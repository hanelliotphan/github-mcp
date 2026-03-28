import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoDispatchFailure, CreateRepoDispatchSuccess, ErrorEnvelope } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const MAX_CLIENT_PAYLOAD_TOP_LEVEL = 10;
const MAX_CLIENT_PAYLOAD_BYTES = 64 * 1024;

function validateClientPayload(payload: Record<string, unknown> | undefined): ErrorEnvelope | null {
    if (payload == null) {
        return null;
    }
    const keys = Object.keys(payload);
    if (keys.length > MAX_CLIENT_PAYLOAD_TOP_LEVEL) {
        return {
            status_code: 422,
            error_type: "validation_error",
            message: `client_payload must have at most ${MAX_CLIENT_PAYLOAD_TOP_LEVEL} top-level properties.`,
            hint: "GitHub limits repository_dispatch client_payload to 10 top-level keys.",
            retryable: false
        };
    }
    const size = Buffer.byteLength(JSON.stringify(payload), "utf8");
    if (size >= MAX_CLIENT_PAYLOAD_BYTES) {
        return {
            status_code: 422,
            error_type: "validation_error",
            message: "client_payload JSON must be smaller than 64KB.",
            hint: "Reduce payload size to stay under GitHub's limit.",
            retryable: false
        };
    }
    return null;
}

export function registerGithubCreateRepoDispatchTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_dispatch",
        "Create a repository dispatch event (POST /repos/{owner}/{repo}/dispatches). Triggers the repository_dispatch webhook / workflows for the given event_type. Optional client_payload is JSON (max 10 top-level keys, under 64KB). Classic PATs need the repo scope.",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            event_type: z
                .string()
                .min(1)
                .max(100)
                .describe("Custom event name for repository_dispatch (100 characters or fewer)."),
            client_payload: z.record(z.string(), z.unknown()).optional()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;

            const validationError = validateClientPayload(input.client_payload);
            if (validationError) {
                const failurePayload: CreateRepoDispatchFailure = {
                    success: false,
                    error: validationError,
                    request_id: null
                };
                return textAndData(failurePayload);
            }

            try {
                const response = await octokit.rest.repos.createDispatchEvent({
                    owner: input.owner,
                    repo: input.name,
                    event_type: input.event_type,
                    client_payload: input.client_payload
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: CreateRepoDispatchSuccess = {
                    success: true,
                    message: "Repository dispatch event created successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    event_type: input.event_type,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoDispatchFailure = {
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
