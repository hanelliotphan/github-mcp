import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateOrgCopilotSpaceResourceSuccess, CreateOrgCopilotSpaceResourceFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function getResources(data: unknown): Record<string, unknown>[] {
    if (data && typeof data === "object" && "resources" in data) {
        const rows = (data as { resources?: unknown }).resources;
        return Array.isArray(rows) ? rows.map((row) => toPlain(row)) : [];
    }
    return [];
}

export function registerGithubCreateOrgCopilotSpaceResourceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_copilot_space_resource",
        "Create a resource for an organization Copilot Space (POST /orgs/{org}/copilot-spaces/{space_number}/resources). Requires resource_type and metadata. Returns HTTP 201 or 200 for duplicate github_file. See [Create a resource for an organization Copilot Space](https://docs.github.com/en/rest/copilot-spaces/resources?apiVersion=2026-03-10#create-a-resource-for-an-organization-copilot-space).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive(),
            resource_type: z.enum(["repository", "github_file", "free_text", "github_issue", "github_pull_request"]),
            metadata: z.record(z.string(), z.unknown())
        },
        async (input) => {
            try {
                const response = await octokit.request("POST /orgs/{org}/copilot-spaces/{space_number}/resources", {
                    org: input.org,
                    space_number: input.space_number,
                    resource_type: input.resource_type,
                    metadata: input.metadata
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgCopilotSpaceResourceSuccess = {
                    success: true,
                    message: response.status === 200 ? "Existing resource returned (duplicate github_file)." : "Resource created successfully.",
                    http_status: response.status,
                    org: input.org,
                    space_number: input.space_number,
                    resource_type: input.resource_type,
                    resource: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgCopilotSpaceResourceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
