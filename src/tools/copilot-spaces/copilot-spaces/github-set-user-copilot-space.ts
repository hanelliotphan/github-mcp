import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { SetUserCopilotSpaceSuccess, SetUserCopilotSpaceFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubSetUserCopilotSpaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_user_copilot_space",
        "Update a Copilot Space for a user (PUT /users/{username}/copilot-spaces/{space_number}). Optional name, description, general_instructions, base_role (reader|no_access), resources_attributes. See [Set a Copilot Space for a user](https://docs.github.com/en/rest/copilot-spaces/copilot-spaces?apiVersion=2026-03-10#set-a-copilot-space-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive(),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            general_instructions: z.string().max(4000).optional(),
            base_role: z.enum(["reader", "no_access"]).optional(),
            resources_attributes: z
                .array(
                    z.object({
                        id: z.number().int().positive().optional(),
                        _destroy: z.boolean().optional(),
                        resource_type: z
                            .enum([
                                "repository",
                                "github_file",
                                "free_text",
                                "github_issue",
                                "github_pull_request",
                                "media_content",
                                "uploaded_text_file"
                            ])
                            .optional(),
                        metadata: z.record(z.string(), z.unknown()).optional()
                    })
                )
                .optional()
        },
        async (input) => {
            try {
                const body: Record<string, unknown> = {};
                if (input.name !== undefined) body.name = input.name;
                if (input.description !== undefined) body.description = input.description;
                if (input.general_instructions !== undefined) body.general_instructions = input.general_instructions;
                if (input.base_role !== undefined) body.base_role = input.base_role;
                if (input.resources_attributes !== undefined) body.resources_attributes = input.resources_attributes;
                const response = await octokit.request("PUT /users/{username}/copilot-spaces/{space_number}", { username: input.username, space_number: input.space_number, ...body } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetUserCopilotSpaceSuccess = {
                    success: true,
                    message: "Copilot Space updated successfully.",
                    http_status: response.status,
                    username: input.username,
                    space_number: input.space_number,
                    space: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetUserCopilotSpaceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
