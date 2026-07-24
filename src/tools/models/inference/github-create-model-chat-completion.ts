import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateModelChatCompletionFailure,
    CreateModelChatCompletionSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const MODELS_API_BASE_URL = "https://models.github.ai";

const chatMessageSchema = z.object({
    role: z.enum(["assistant", "developer", "system", "user"]),
    content: z.string().min(1)
});

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateModelChatCompletionTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_create_model_chat_completion",
        "Run a chat completion inference request (POST /inference/chat/completions on models.github.ai). " +
            "Pass **`model`** as `{publisher}/{model_name}` and **`messages`**. Streaming (`stream: true`) is not supported via this MCP tool. " +
            "Requires **`models: read`**. " +
            "See [Run an inference request](https://docs.github.com/en/rest/models/inference?apiVersion=2026-03-10#run-an-inference-request).",
        {
            model: z.string().min(1).describe("Model ID in {publisher}/{model_name} form."),
            messages: z.array(chatMessageSchema).min(1),
            frequency_penalty: z.number().min(-2).max(2).optional(),
            max_tokens: z.number().int().positive().optional(),
            modalities: z.array(z.enum(["text", "audio"])).optional(),
            presence_penalty: z.number().min(-2).max(2).optional(),
            response_format: z.record(z.string(), z.unknown()).optional(),
            seed: z.number().int().optional(),
            stream: z
                .boolean()
                .optional()
                .describe("Must be false or omitted; streaming is not supported via this MCP tool."),
            stream_options: z
                .object({
                    include_usage: z.boolean().optional()
                })
                .optional(),
            stop: z.array(z.string().min(1)).optional(),
            temperature: z.number().min(0).max(1).optional(),
            tool_choice: z.enum(["auto", "required", "none"]).optional(),
            tools: z.array(z.record(z.string(), z.unknown())).optional(),
            top_p: z.number().min(0).max(1).optional(),
            api_version: z
                .string()
                .min(1)
                .optional()
                .describe("Optional Models API version query (`api-version`).")
        },
        async (input) => {
            if (input.stream === true) {
                const failurePayload: CreateModelChatCompletionFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message:
                            "stream: true is not supported via this MCP tool; omit stream or set it to false.",
                        hint: "Call again with stream omitted or set to false.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            try {
                const response = await octokit.request("POST /inference/chat/completions", {
                    baseUrl: MODELS_API_BASE_URL,
                    headers: { "content-type": "application/json" },
                    ...(input.api_version !== undefined ? { "api-version": input.api_version } : {}),
                    model: input.model,
                    messages: input.messages,
                    ...(input.frequency_penalty !== undefined
                        ? { frequency_penalty: input.frequency_penalty }
                        : {}),
                    ...(input.max_tokens !== undefined ? { max_tokens: input.max_tokens } : {}),
                    ...(input.modalities !== undefined ? { modalities: input.modalities } : {}),
                    ...(input.presence_penalty !== undefined
                        ? { presence_penalty: input.presence_penalty }
                        : {}),
                    ...(input.response_format !== undefined
                        ? { response_format: input.response_format }
                        : {}),
                    ...(input.seed !== undefined ? { seed: input.seed } : {}),
                    stream: false,
                    ...(input.stream_options !== undefined
                        ? { stream_options: input.stream_options }
                        : {}),
                    ...(input.stop !== undefined ? { stop: input.stop } : {}),
                    ...(input.temperature !== undefined ? { temperature: input.temperature } : {}),
                    ...(input.tool_choice !== undefined ? { tool_choice: input.tool_choice } : {}),
                    ...(input.tools !== undefined ? { tools: input.tools } : {}),
                    ...(input.top_p !== undefined ? { top_p: input.top_p } : {})
                } as never);
                const requestId = getRequestId(
                    (response.headers as Record<string, unknown>)["x-github-request-id"]
                );
                const successPayload: CreateModelChatCompletionSuccess = {
                    success: true,
                    message: "Chat completion created successfully.",
                    http_status: response.status as number,
                    completion: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateModelChatCompletionFailure = {
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
