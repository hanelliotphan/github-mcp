import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateOrgCopilotSpaceSuccess, CreateOrgCopilotSpaceFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateOrgCopilotSpaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_copilot_space",
        "Create an organization Copilot Space (POST /orgs/{org}/copilot-spaces). name required; optional description, general_instructions, base_role, resources_attributes. Returns HTTP 201. See [Create an organization Copilot Space](https://docs.github.com/en/rest/copilot-spaces/copilot-spaces?apiVersion=2026-03-10#create-an-organization-copilot-space).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1),
            description: z.string().optional(),
            general_instructions: z.string().max(4000).optional(),
            base_role: z.enum(["reader", "writer", "admin", "no_access"]).optional(),
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
                const body: Record<string, unknown> = { name: input.name };
                if (input.description !== undefined) body.description = input.description;
                if (input.general_instructions !== undefined) body.general_instructions = input.general_instructions;
                if (input.base_role !== undefined) body.base_role = input.base_role;
                if (input.resources_attributes !== undefined) body.resources_attributes = input.resources_attributes;
                const response = await octokit.request("POST /orgs/{org}/copilot-spaces", { org: input.org, ...body } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgCopilotSpaceSuccess = {
                    success: true,
                    message: "Copilot Space created successfully.",
                    http_status: response.status,
                    org: input.org,
                    space: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgCopilotSpaceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
