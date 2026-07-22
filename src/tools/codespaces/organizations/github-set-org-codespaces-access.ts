import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetOrgCodespacesAccessFailure,
    SetOrgCodespacesAccessSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetOrgCodespacesAccessTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_org_codespaces_access",
        "Manage codespaces access for organization members (PUT /orgs/{org}/codespaces/access). visibility required. See GitHub REST Codespaces organizations.",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex),
            visibility: z.enum(["disabled", "selected_members", "all_members", "all_members_and_outside_collaborators"]),
            selected_usernames: z.array(z.string()).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request("PUT /orgs/{org}/codespaces/access", {
                    org: input.org,
                    visibility: input.visibility,
                    ...(input.selected_usernames !== undefined ? { selected_usernames: input.selected_usernames } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetOrgCodespacesAccessSuccess = {
                    success: true,
                    message: "Organization codespaces access updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    visibility: input.visibility,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetOrgCodespacesAccessFailure = {
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
