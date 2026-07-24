import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateModelEmbeddingsFailure,
    CreateModelEmbeddingsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const MODELS_API_BASE_URL = "https://models.github.ai";

const embeddingInputSchema = z.union([
    z.string().min(1),
    z.array(z.string().min(1)).min(1).max(2048)
]);

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateModelEmbeddingsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_model_embeddings",
        "Run an embedding request (POST /inference/embeddings on models.github.ai). " +
            "Pass **`model`** as `{publisher}/{model_name}` (e.g. `openai/text-embedding-3-small`) and **`input`** as a string or string array. " +
            "Requires **`models: read`**. " +
            "See [Run an embedding request](https://docs.github.com/en/rest/models/embeddings?apiVersion=2026-03-10#run-an-embedding-request).",
        {
            model: z
                .string()
                .min(1)
                .describe("Model ID in {publisher}/{model_name} form."),
            input: embeddingInputSchema.describe(
                "Text to embed: a string, or an array of up to 2048 strings."
            ),
            encoding_format: z.enum(["float", "base64"]).optional(),
            dimensions: z.number().int().positive().optional(),
            user: z.string().min(1).optional(),
            api_version: z
                .string()
                .min(1)
                .optional()
                .describe("Optional Models API version query (`api-version`).")
        },
        async (input) => {
            try {
                const response = await octokit.request("POST /inference/embeddings", {
                    baseUrl: MODELS_API_BASE_URL,
                    ...(input.api_version !== undefined ? { "api-version": input.api_version } : {}),
                    model: input.model,
                    input: input.input,
                    ...(input.encoding_format !== undefined
                        ? { encoding_format: input.encoding_format }
                        : {}),
                    ...(input.dimensions !== undefined ? { dimensions: input.dimensions } : {}),
                    ...(input.user !== undefined ? { user: input.user } : {})
                } as never);
                const requestId = getRequestId(
                    (response.headers as Record<string, unknown>)["x-github-request-id"]
                );
                const successPayload: CreateModelEmbeddingsSuccess = {
                    success: true,
                    message: "Embeddings created successfully.",
                    http_status: response.status as number,
                    embeddings: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateModelEmbeddingsFailure = {
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
