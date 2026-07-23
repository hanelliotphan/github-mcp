import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CancelRepoDependabotDismissalRequestSuccess,
    CancelRepoDependabotDismissalRequestFailure
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


export function registerGithubCancelRepoDependabotDismissalRequestTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_cancel_repo_dependabot_dismissal_request",
        "Cancel a pending dismissal request for a Dependabot alert (DELETE /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}). " +
            "Returns **204**. Classic tokens need `security_events`. " +
            "See [Cancel a dismissal request for a Dependabot alert for a repository](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10#cancel-a-dismissal-request-for-a-dependabot-alert-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            alert_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}",
                    { owner: input.owner, repo: input.name, alert_number: input.alert_number } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CancelRepoDependabotDismissalRequestSuccess = {
                    success: true,
                    message: "Dismissal request cancelled successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CancelRepoDependabotDismissalRequestFailure = {
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
