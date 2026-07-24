import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgProjectViewSuccess,
    CreateOrgProjectViewFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainList(data: unknown): Record<string, unknown>[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((row) => toPlain(row));
}

export function registerGithubCreateOrgProjectViewTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_project_view",
        "Create a view on a organization-owned project (POST /orgs/{org}/projectsV2/{project_number}/views). " +
            "Requires **`name`** and **`layout`** (`table` / `board` / `roadmap`). Optional **`filter`**, **`visible_fields`**. " +
            "See [Create a view for an organization-owned project](https://docs.github.com/en/rest/projects/views?apiVersion=2026-03-10#create-a-view-for-an-organization-owned-project).",
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
            name: z.string().min(1),
            layout: z.enum(["table", "board", "roadmap"]),
            filter: z.string().optional(),
            visible_fields: z.array(z.number().int().positive()).optional()
        },
        async (input) => {
            try {
                const body: Record<string, unknown> = {
                    name: input.name,
                    layout: input.layout
                };
                if (input.filter !== undefined) {
                    body.filter = input.filter;
                }
                if (input.visible_fields !== undefined) {
                    body.visible_fields = input.visible_fields;
                }
                const response = await octokit.request(
                    "POST /orgs/{org}/projectsV2/{project_number}/views",
                    {
                        org: input.org,
                        project_number: input.project_number,
                        ...body
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgProjectViewSuccess = {
                    success: true,
                    message: "Organization project view created successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    project_number: input.project_number,
                    view: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgProjectViewFailure = {
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
