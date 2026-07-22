import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgBudgetFailure,
    GetOrgBudgetSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetOrgBudgetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_budget",
        "Get a budget by ID for an organization (GET /organizations/{org}/settings/billing/budgets/{budget_id}). " +
            "Requires organization admin or billing manager. " +
            "See [Get a budget by ID for an organization](https://docs.github.com/en/rest/billing/budgets?apiVersion=2026-03-10#get-a-budget-by-id-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            budget_id: z.string().min(1).describe("The ID corresponding to the budget.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /organizations/{org}/settings/billing/budgets/{budget_id}",
                    { org: input.org, budget_id: input.budget_id }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgBudgetSuccess = {
                    success: true,
                    message: "Budget retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    budget_id: input.budget_id,
                    budget: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgBudgetFailure = {
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
