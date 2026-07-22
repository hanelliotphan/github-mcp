import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoSubscriptionFailure,
    GetRepoSubscriptionSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetRepoSubscriptionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_subscription",
        "Get whether the authenticated user is subscribed to (watching) a repository (GET /repos/{owner}/{repo}/subscription). " +
            "GitHub returns HTTP 200 with the subscription when subscribed and 404 when not; this tool maps both to a boolean **`subscribed`** field. " +
            "See [Get a repository subscription](https://docs.github.com/en/rest/activity/watching?apiVersion=2026-03-10#get-a-repository-subscription).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.activity.getRepoSubscription({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoSubscriptionSuccess = {
                    success: true,
                    message: "Repository subscription retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    subscribed: true,
                    subscription: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const status = (error as { status?: number; response?: { status?: number } }).status ??
                    (error as { response?: { status?: number } }).response?.status;
                const requestId = getRequestId(
                    (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                        "x-github-request-id"
                    ]
                );
                if (status === 404) {
                    const successPayload: GetRepoSubscriptionSuccess = {
                        success: true,
                        message: "The authenticated user is not subscribed to this repository.",
                        http_status: 404,
                        owner: input.owner,
                        repo: input.name,
                        full_name,
                        subscribed: false,
                        subscription: null,
                        request_id: requestId
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: GetRepoSubscriptionFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: requestId
                };
                return textAndData(failurePayload);
            }
        }
    );
}
