import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RenderMarkdownFailure, RenderMarkdownSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubRenderMarkdownTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_render_markdown",
        "Render a Markdown document to HTML (POST /markdown). " +
            "Use **`mode`** `markdown` (default) or `gfm`. With `gfm`, optional **`context`** " +
            "(`owner/repo`) resolves references like `#42`. " +
            "See [Render a Markdown document](https://docs.github.com/en/rest/markdown/markdown?apiVersion=2026-03-10#render-a-markdown-document).",
        {
            text: z.string().min(1).describe("Markdown text to render as HTML."),
            mode: z
                .enum(["markdown", "gfm"])
                .optional()
                .describe("Rendering mode. Default on GitHub is markdown."),
            context: z
                .string()
                .min(1)
                .optional()
                .describe("Repository context (owner/repo) used when mode is gfm.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.markdown.render({
                    text: input.text,
                    ...(input.mode !== undefined ? { mode: input.mode } : {}),
                    ...(input.context !== undefined ? { context: input.context } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const html = typeof response.data === "string" ? response.data : String(response.data ?? "");
                const successPayload: RenderMarkdownSuccess = {
                    success: true,
                    message: "Markdown rendered successfully.",
                    http_status: response.status as number,
                    html,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RenderMarkdownFailure = {
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
