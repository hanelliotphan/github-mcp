import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type {
    ListCodesOfConductFailure,
    ListCodesOfConductSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubListCodesOfConductTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_codes_of_conduct",
        "Get all codes of conduct (GET /codes_of_conduct). Returns GitHub’s built-in codes of conduct (`key`, `name`, `url`, optional `body`, `html_url`). " +
            "See [Get all codes of conduct](https://docs.github.com/en/rest/codes-of-conduct/codes-of-conduct?apiVersion=2026-03-10#get-all-codes-of-conduct).",
        {},
        async () => {
            try {
                const response = await octokit.rest.codesOfConduct.getAllCodesOfConduct();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const codes_of_conduct = Array.isArray(response.data)
                    ? response.data.map((row) => toPlain(row))
                    : [];
                const successPayload: ListCodesOfConductSuccess = {
                    success: true,
                    message: "Codes of conduct retrieved successfully.",
                    http_status: response.status as number,
                    codes_of_conduct,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListCodesOfConductFailure = {
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
