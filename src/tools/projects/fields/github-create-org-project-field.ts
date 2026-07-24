import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgProjectFieldSuccess,
    CreateOrgProjectFieldFailure
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

export function registerGithubCreateOrgProjectFieldTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_project_field",
        "Add a field to a organization-owned project (POST /orgs/{org}/projectsV2/{project_number}/fields). " +
            "Requires **`name`** and **`data_type`** (`text` / `number` / `date` / `single_select` / `iteration`). " +
            "Optional **`issue_field_id`**, **`single_select_options`**, **`iteration_configuration`**. " +
            "See [Add a field to an organization-owned project](https://docs.github.com/en/rest/projects/fields?apiVersion=2026-03-10#add-a-field-to-an-organization-owned-project).",
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
            data_type: z.enum([
                "text",
                "number",
                "date",
                "single_select",
                "iteration"
            ]),
            issue_field_id: z.number().int().positive().optional(),
            single_select_options: z
                .array(
                    z
                        .object({
                            name: z.union([
                                z.string().min(1),
                                z
                                    .object({
                                        raw: z.string().min(1),
                                        html: z.string().optional()
                                    })
                                    .passthrough()
                            ]),
                            color: z
                                .enum([
                                    "BLUE",
                                    "GRAY",
                                    "GREEN",
                                    "ORANGE",
                                    "PINK",
                                    "PURPLE",
                                    "RED",
                                    "YELLOW"
                                ])
                                .optional(),
                            description: z
                                .union([
                                    z.string(),
                                    z
                                        .object({
                                            raw: z.string(),
                                            html: z.string().optional()
                                        })
                                        .passthrough()
                                ])
                                .optional()
                        })
                        .passthrough()
                )
                .optional(),
            iteration_configuration: z
                .object({
                    start_day: z.number().int().optional(),
                    start_date: z.string().optional(),
                    duration: z.number().int().positive().optional(),
                    iterations: z
                        .array(
                            z
                                .object({
                                    title: z.union([
                                        z.string(),
                                        z
                                            .object({
                                                raw: z.string(),
                                                html: z.string().optional()
                                            })
                                            .passthrough()
                                    ]),
                                    start_date: z.string().optional(),
                                    duration: z.number().int().positive().optional()
                                })
                                .passthrough()
                        )
                        .optional()
                })
                .passthrough()
                .optional()
        },
        async (input) => {
            try {
                const body: Record<string, unknown> = {
                    name: input.name,
                    data_type: input.data_type
                };
                if (input.issue_field_id !== undefined) {
                    body.issue_field_id = input.issue_field_id;
                }
                if (input.single_select_options !== undefined) {
                    body.single_select_options = input.single_select_options;
                }
                if (input.iteration_configuration !== undefined) {
                    body.iteration_configuration = input.iteration_configuration;
                }
                const response = await octokit.request(
                    "POST /orgs/{org}/projectsV2/{project_number}/fields",
                    {
                        org: input.org,
                        project_number: input.project_number,
                        ...body
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgProjectFieldSuccess = {
                    success: true,
                    message: "Organization project field created successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    project_number: input.project_number,
                    field: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgProjectFieldFailure = {
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
