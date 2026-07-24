import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOctocatFailure, GetOctocatSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubGetOctocatTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_octocat",
        "Get the octocat as ASCII art (GET /octocat). Optional **`s`** sets the speech-bubble text. " +
            "See [Get Octocat](https://docs.github.com/en/rest/meta/meta?apiVersion=2026-03-10#get-octocat).",
        {
            s: z.string().min(1).optional().describe("Words to show in Octocat's speech bubble.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.meta.getOctocat({
                    ...(input.s !== undefined ? { s: input.s } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const octocat =
                    typeof response.data === "string" ? response.data : String(response.data ?? "");
                const successPayload: GetOctocatSuccess = {
                    success: true,
                    message: "Octocat retrieved successfully.",
                    http_status: response.status as number,
                    octocat,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOctocatFailure = {
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
