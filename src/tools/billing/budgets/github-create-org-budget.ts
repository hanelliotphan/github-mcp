import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgBudgetFailure,
    CreateOrgBudgetSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubCreateOrgBudgetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_budget",
        "Create a budget for an organization (POST /organizations/{org}/settings/billing/budgets). " +
            "Requires organization admin or billing manager. For `budget_scope` `user`, also pass **user** (username). " +
            "See [Create a budget for an organization](https://docs.github.com/en/rest/billing/budgets?apiVersion=2026-03-10#create-a-budget-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            budget_amount: z.number().int().min(0).optional(),
            prevent_further_usage: z.boolean().optional(),
            budget_alerting: z
                .object({
                    will_alert: z.boolean().optional(),
                    alert_recipients: z.array(z.string().min(1)).optional()
                })
                .optional(),
            budget_scope: z
                .enum(["organization", "repository", "multi_user_customer", "user"])
                .optional(),
            budget_entity_name: z.string().optional(),
            budget_type: z.string().min(1).optional().describe("e.g. BundlePricing, ProductPricing, SkuPricing"),
            budget_product_sku: z.string().min(1).optional(),
            user: z
                .string()
                .min(1)
                .optional()
                .describe("Required when budget_scope is user.")
        },
        async (input) => {
            try {
                const body = {
                    ...(input.budget_amount !== undefined ? { budget_amount: input.budget_amount } : {}),
                    ...(input.prevent_further_usage !== undefined
                        ? { prevent_further_usage: input.prevent_further_usage }
                        : {}),
                    ...(input.budget_alerting ? { budget_alerting: input.budget_alerting } : {}),
                    ...(input.budget_scope ? { budget_scope: input.budget_scope } : {}),
                    ...(input.budget_entity_name !== undefined
                        ? { budget_entity_name: input.budget_entity_name }
                        : {}),
                    ...(input.budget_type ? { budget_type: input.budget_type } : {}),
                    ...(input.budget_product_sku ? { budget_product_sku: input.budget_product_sku } : {}),
                    ...(input.user ? { user: input.user } : {})
                };
                const response = await octokit.request(
                    "POST /organizations/{org}/settings/billing/budgets",
                    { org: input.org, ...body }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgBudgetSuccess = {
                    success: true,
                    message: "Budget created successfully.",
                    http_status: response.status,
                    org: input.org,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgBudgetFailure = {
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
