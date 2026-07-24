import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgProjectDraftItemFailure,
    CreateOrgProjectDraftItemSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateOrgProjectDraftItemTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_create_org_project_draft_item",
        "Create a draft issue item on an organization-owned project (POST /orgs/{org}/projectsV2/{project_number}/drafts). " +
            "Requires **`title`**; optional **`body`**. " +
            "See [Create draft item for organization owned project](https://docs.github.com/en/rest/projects/drafts?apiVersion=2026-03-10#create-draft-item-for-organization-owned-project).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            project_number: z.number().int().positive(),
            title: z.string().min(1),
            body: z.string().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /orgs/{org}/projectsV2/{project_number}/drafts",
                    {
                        org: input.org,
                        project_number: input.project_number,
                        title: input.title,
                        ...(input.body !== undefined ? { body: input.body } : {})
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgProjectDraftItemSuccess = {
                    success: true,
                    message: "Organization project draft item created successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    project_number: input.project_number,
                    item: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgProjectDraftItemFailure = {
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
