import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteOrgUserCodespaceFailure,
    DeleteOrgUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_user_codespace",
        "Delete an organization member codespace (DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}). Returns HTTP 202. See GitHub REST Codespaces organizations.",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            username: z.string().min(1),
            codespace_name: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}", {
                    codespace_name: input.codespace_name,
                    org: input.org,
                    username: input.username
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgUserCodespaceSuccess = {
                    success: true,
                    message: "Organization member codespace deletion accepted.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    codespace_name: input.codespace_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgUserCodespaceFailure = {
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
