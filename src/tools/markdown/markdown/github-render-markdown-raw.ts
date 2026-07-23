import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RenderMarkdownRawFailure, RenderMarkdownRawSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

/** GitHub limits raw Markdown bodies to 400 KB. */
const MAX_RAW_MARKDOWN_BYTES = 400 * 1024;

export function registerGithubRenderMarkdownRawTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_render_markdown_raw",
        "Render Markdown as plain (non-GFM) HTML (POST /markdown/raw). " +
            "Sends the body as `text/plain`. Content must be 400 KB or less. " +
            "See [Render a Markdown document in raw mode](https://docs.github.com/en/rest/markdown/markdown?apiVersion=2026-03-10#render-a-markdown-document-in-raw-mode).",
        {
            text: z
                .string()
                .min(1)
                .refine(
                    (value) => Buffer.byteLength(value, "utf8") <= MAX_RAW_MARKDOWN_BYTES,
                    "text must be 400 KB or less (UTF-8)"
                )
                .describe("Markdown text to render (plain format, not GFM).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.markdown.renderRaw({
                    data: input.text
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const html = typeof response.data === "string" ? response.data : String(response.data ?? "");
                const successPayload: RenderMarkdownRawSuccess = {
                    success: true,
                    message: "Markdown rendered successfully (raw mode).",
                    http_status: response.status as number,
                    html,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RenderMarkdownRawFailure = {
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
