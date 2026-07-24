import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type { ListModelsFailure, ListModelsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const MODELS_API_BASE_URL = "https://models.github.ai";

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row ?? {})) as Record<string, unknown>);
}

export function registerGithubListModelsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_models",
        "List models available in the GitHub Models catalog (GET /catalog/models on models.github.ai). " +
            "Returns IDs, modalities, publishers, and rate-limit tiers. Requires **`models: read`** for fine-grained tokens. " +
            "See [List all models](https://docs.github.com/en/rest/models/catalog?apiVersion=2026-03-10#list-all-models).",
        {},
        async () => {
            try {
                const response = await octokit.request("GET /catalog/models", {
                    baseUrl: MODELS_API_BASE_URL
                } as never);
                const requestId = getRequestId(
                    (response.headers as Record<string, unknown>)["x-github-request-id"]
                );
                const models = Array.isArray(response.data) ? toPlainRows(response.data) : [];
                const successPayload: ListModelsSuccess = {
                    success: true,
                    message: "Models catalog retrieved successfully.",
                    http_status: response.status as number,
                    models,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListModelsFailure = {
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
