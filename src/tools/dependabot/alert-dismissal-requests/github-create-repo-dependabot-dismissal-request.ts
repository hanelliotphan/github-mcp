import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRepoDependabotDismissalRequestSuccess,
    CreateRepoDependabotDismissalRequestFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;


export function registerGithubCreateRepoDependabotDismissalRequestTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_dependabot_dismissal_request",
        "Create a dismissal request for a Dependabot alert (POST /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}). " +
            "Requires `dismissed_reason`; optional `dismissed_comment`. Returns **201**. Classic tokens need `security_events`. " +
            "See [Create a dismissal request for a Dependabot alert for a repository](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10#create-a-dismissal-request-for-a-dependabot-alert-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            alert_number: z.number().int().positive(),
            dismissed_reason: z.enum(["fix_started", "no_bandwidth", "tolerable_risk", "inaccurate", "not_used"]),
            dismissed_comment: z.string().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}",
                    {
                        owner: input.owner,
                        repo: input.name,
                        alert_number: input.alert_number,
                        dismissed_reason: input.dismissed_reason,
                        ...(input.dismissed_comment !== undefined ? { dismissed_comment: input.dismissed_comment } : {})
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoDependabotDismissalRequestSuccess = {
                    success: true,
                    message: "Dismissal request created successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    dismissal_request: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoDependabotDismissalRequestFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
