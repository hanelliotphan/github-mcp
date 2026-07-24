import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgExternalGroupFailure, GetOrgExternalGroupSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const DEFAULT_PER_PAGE = 100 as const;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgExternalGroupTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_external_group",
        "Get an external group (GET /orgs/{org}/external-group/{group_id}). " +
            "Enterprise Managed Users only. Optional **`per_page`** / **`page`** paginate the members array in the response. " +
            "See [Get an external group](https://docs.github.com/en/enterprise-cloud@latest/rest/teams/external-groups?apiVersion=2026-03-10#get-an-external-group).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            group_id: z.number().int().positive().describe("The unique identifier of the external group."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const page = input.page ?? 1;
                const response = await octokit.request("GET /orgs/{org}/external-group/{group_id}", {
                    org: input.org,
                    group_id: input.group_id,
                    per_page: perPage,
                    page
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgExternalGroupSuccess = {
                    success: true,
                    message: "External group retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    group_id: input.group_id,
                    external_group: toPlain(response.data),
                    page,
                    per_page: perPage,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgExternalGroupFailure = {
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
