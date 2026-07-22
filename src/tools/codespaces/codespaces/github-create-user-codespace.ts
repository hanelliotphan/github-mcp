import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateUserCodespaceFailure,
    CreateUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_user_codespace",
        "Create a codespace for the authenticated user (POST /user/codespaces). Provide repository_id OR pull_request (not both). See GitHub REST Codespaces.",
        {
            repository_id: z.number().int().positive().optional().describe("Repository id. Required unless pull_request is set."),
            pull_request: z
                .object({
                    pull_request_number: z.number().int().positive(),
                    repository_id: z.number().int().positive()
                })
                .optional()
                .describe("Pull request context. Required unless repository_id is set."),
            ref: z.string().optional(),
            location: z.string().optional(),
            geo: z.enum(["EuropeWest", "SoutheastAsia", "UsEast", "UsWest"]).optional(),
            client_ip: z.string().optional(),
            machine: z.string().optional(),
            devcontainer_path: z.string().optional(),
            multi_repo_permissions_opt_out: z.boolean().optional(),
            working_directory: z.string().optional(),
            idle_timeout_minutes: z.number().int().optional(),
            display_name: z.string().optional(),
            retention_period_minutes: z.number().int().min(0).max(43200).optional()
        },
        async (input) => {
            const hasRepo = input.repository_id !== undefined;
            const hasPr = input.pull_request !== undefined;
            if (hasRepo === hasPr) {
                const failurePayload: CreateUserCodespaceFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: "Provide exactly one of repository_id or pull_request.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            try {
                const response = await octokit.request("POST /user/codespaces", {
                    ...(hasRepo ? { repository_id: input.repository_id! } : { pull_request: input.pull_request! }),
                    ...((input.ref !== undefined) ? { ref: input.ref } : {}),
                    ...((input.location !== undefined) ? { location: input.location } : {}),
                    ...((input.geo !== undefined) ? { geo: input.geo } : {}),
                    ...((input.client_ip !== undefined) ? { client_ip: input.client_ip } : {}),
                    ...((input.machine !== undefined) ? { machine: input.machine } : {}),
                    ...((input.devcontainer_path !== undefined) ? { devcontainer_path: input.devcontainer_path } : {}),
                    ...((input.multi_repo_permissions_opt_out !== undefined) ? { multi_repo_permissions_opt_out: input.multi_repo_permissions_opt_out } : {}),
                    ...((input.working_directory !== undefined) ? { working_directory: input.working_directory } : {}),
                    ...((input.idle_timeout_minutes !== undefined) ? { idle_timeout_minutes: input.idle_timeout_minutes } : {}),
                    ...((input.display_name !== undefined) ? { display_name: input.display_name } : {}),
                    ...((input.retention_period_minutes !== undefined) ? { retention_period_minutes: input.retention_period_minutes } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateUserCodespaceSuccess = {
                    success: true,
                    message: response.status === 202
                        ? "Codespace creation accepted; GitHub is retrying in the background."
                        : "Codespace created successfully.",
                    http_status: response.status,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateUserCodespaceFailure = {
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
