import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetCodeOfConductFailure,
    GetCodeOfConductSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetCodeOfConductTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_code_of_conduct",
        "Get a code of conduct by key (GET /codes_of_conduct/{key}). Returns `key`, `name`, `url`, optional `body`, and `html_url`. " +
            "See [Get a code of conduct](https://docs.github.com/en/rest/codes-of-conduct/codes-of-conduct?apiVersion=2026-03-10#get-a-code-of-conduct).",
        {
            key: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.codesOfConduct.getConductCode({
                    key: input.key
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCodeOfConductSuccess = {
                    success: true,
                    message: "Code of conduct retrieved successfully.",
                    http_status: response.status as number,
                    key: input.key,
                    code_of_conduct: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCodeOfConductFailure = {
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
