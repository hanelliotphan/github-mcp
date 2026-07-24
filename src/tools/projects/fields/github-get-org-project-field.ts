import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgProjectFieldSuccess,
    GetOrgProjectFieldFailure
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

export function registerGithubGetOrgProjectFieldTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_project_field",
        "Get a field on an organization-owned project (GET /orgs/{org}/projectsV2/{project_number}/fields/{field_id}). " +
            "See [Organization project field](https://docs.github.com/en/rest/projects/fields?apiVersion=2026-03-10#get-project-field-for-organization).",
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
            field_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.projects.getFieldForOrg({
                    org: input.org,
                    project_number: input.project_number,
                    field_id: input.field_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgProjectFieldSuccess = {
                    success: true,
                    message: "Organization project field retrieved successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    project_number: input.project_number,
                    field_id: input.field_id,
                    field: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgProjectFieldFailure = {
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
