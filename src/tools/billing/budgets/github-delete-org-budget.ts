import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteOrgBudgetFailure,
    DeleteOrgBudgetSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubDeleteOrgBudgetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_budget",
        "Delete a budget for an organization (DELETE /organizations/{org}/settings/billing/budgets/{budget_id}). " +
            "Requires organization admin or billing manager. " +
            "See [Delete a budget for an organization](https://docs.github.com/en/rest/billing/budgets?apiVersion=2026-03-10#delete-a-budget-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            budget_id: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /organizations/{org}/settings/billing/budgets/{budget_id}",
                    { org: input.org, budget_id: input.budget_id }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgBudgetSuccess = {
                    success: true,
                    message: "Budget deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    budget_id: input.budget_id,
                    result: toPlain(response.data ?? { id: input.budget_id }),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgBudgetFailure = {
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
