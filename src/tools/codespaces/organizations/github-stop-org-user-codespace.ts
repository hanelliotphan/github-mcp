import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    StopOrgUserCodespaceFailure,
    StopOrgUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubStopOrgUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_stop_org_user_codespace",
        "Stop an organization member codespace (POST .../stop). Returns HTTP 200 with codespace. See GitHub REST Codespaces organizations.",
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
                const response = await octokit.request("POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop", {
                    org: input.org,
                    username: input.username,
                    codespace_name: input.codespace_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: StopOrgUserCodespaceSuccess = {
                    success: true,
                    message: "Organization member codespace stopped successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    codespace_name: input.codespace_name,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: StopOrgUserCodespaceFailure = {
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
