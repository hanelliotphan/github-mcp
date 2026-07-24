import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetGlobalSecurityAdvisoryFailure,
    GetGlobalSecurityAdvisorySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetGlobalSecurityAdvisoryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_global_security_advisory",
        "Get a global security advisory (GET /advisories/{ghsa_id}). See [Get a global security advisory](https://docs.github.com/en/rest/security-advisories/global-advisories?apiVersion=2026-03-10#get-a-global-security-advisory).",
        {
            ghsa_id: z.string().min(1).describe("The GHSA (GitHub Security Advisory) identifier of the advisory.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.securityAdvisories.getGlobalAdvisory({
                    ghsa_id: input.ghsa_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetGlobalSecurityAdvisorySuccess = {
                    success: true,
                    message: "Global security advisory retrieved successfully.",
                    http_status: response.status,
                    ghsa_id: input.ghsa_id,
                    advisory: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetGlobalSecurityAdvisoryFailure = {
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
