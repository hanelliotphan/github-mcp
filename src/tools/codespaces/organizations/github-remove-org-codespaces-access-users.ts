import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveOrgCodespacesAccessUsersFailure,
    RemoveOrgCodespacesAccessUsersSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveOrgCodespacesAccessUsersTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_org_codespaces_access_users",
        "Remove users from selected codespaces access (DELETE /orgs/{org}/codespaces/access/selected_users). selected_usernames required in body. See GitHub REST Codespaces organizations.",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex),
            selected_usernames: z.array(z.string().min(1)).describe("GitHub usernames to add or remove.")
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /orgs/{org}/codespaces/access/selected_users", {
                    org: input.org,
                    selected_usernames: input.selected_usernames
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveOrgCodespacesAccessUsersSuccess = {
                    success: true,
                    message: "Users removed from organization codespaces access successfully.",
                    http_status: response.status,
                    org: input.org,
                    selected_usernames: input.selected_usernames,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveOrgCodespacesAccessUsersFailure = {
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
