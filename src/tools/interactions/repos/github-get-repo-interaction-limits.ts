import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoInteractionLimitsFailure,
    GetRepoInteractionLimitsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function parseInteractionLimits(data: unknown): Record<string, unknown> | null {
    if (data === null || data === undefined) {
        return null;
    }
    if (typeof data === "object" && !Array.isArray(data) && Object.keys(data as object).length === 0) {
        return null;
    }
    return toPlain(data);
}

export function registerGithubGetRepoInteractionLimitsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_interaction_limits",
        "Get interaction restrictions for a repository (GET /repos/{owner}/{repo}/interaction-limits). " +
            "MCP **`name`** maps to API **`repo`**. When no restrictions are active, GitHub may return an empty object; the tool returns **`interaction_limits`: null** with a clear message. " +
            "See [Get interaction restrictions for a repository](https://docs.github.com/en/rest/interactions/repos?apiVersion=2026-03-10#get-interaction-restrictions-for-a-repository).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                )
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.interactions.getRestrictionsForRepo({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const interactionLimits = parseInteractionLimits(response.data);
                const successPayload: GetRepoInteractionLimitsSuccess = {
                    success: true,
                    message: interactionLimits
                        ? "Repository interaction limits retrieved successfully."
                        : "No interaction restrictions are currently set for this repository.",
                    http_status: response.status as number,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    interaction_limits: interactionLimits,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoInteractionLimitsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
