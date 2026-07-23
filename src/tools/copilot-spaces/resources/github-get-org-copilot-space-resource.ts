import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgCopilotSpaceResourceSuccess, GetOrgCopilotSpaceResourceFailure } from "../../../types.js";
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

export function registerGithubGetOrgCopilotSpaceResourceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_copilot_space_resource",
        "Get a resource for an organization Copilot Space (GET /orgs/{org}/copilot-spaces/{space_number}/resources/{space_resource_id}). See [Get a resource for an organization Copilot Space](https://docs.github.com/en/rest/copilot-spaces/resources?apiVersion=2026-03-10#get-a-resource-for-an-organization-copilot-space).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive(),
            space_resource_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /orgs/{org}/copilot-spaces/{space_number}/resources/{space_resource_id}", { org: input.org, space_number: input.space_number, space_resource_id: input.space_resource_id } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgCopilotSpaceResourceSuccess = {
                    success: true,
                    message: "Resource retrieved successfully.",
                    org: input.org,
                    space_number: input.space_number,
                    space_resource_id: input.space_resource_id,
                    resource: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCopilotSpaceResourceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
