import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetMarketplaceSubscriptionPlanForAccountStubbedFailure,
    GetMarketplaceSubscriptionPlanForAccountStubbedSuccess,
    MarketplacePurchaseAccountItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): MarketplacePurchaseAccountItem {
    return JSON.parse(JSON.stringify(data)) as MarketplacePurchaseAccountItem;
}

export function registerGithubGetMarketplaceSubscriptionPlanForAccountStubbedTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_get_marketplace_subscription_plan_for_account_stubbed",
        "Get a Marketplace subscription plan for an account using **stubbed** test data " +
            "(GET /marketplace_listing/stubbed/accounts/{account_id}). " +
            "Same shape as the production counterpart; use for testing before listing on GitHub Marketplace. " +
            "Requires a **GitHub App JWT** or **OAuth app basic auth** (client id/secret). " +
            "See [Get a subscription plan for an account (stubbed)](https://docs.github.com/en/rest/apps/marketplace?apiVersion=2026-03-10#get-a-subscription-plan-for-an-account-stubbed).",
        {
            account_id: z.number().int().describe("Account id (user or organization).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.getSubscriptionPlanForAccountStubbed({
                    account_id: input.account_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetMarketplaceSubscriptionPlanForAccountStubbedSuccess = {
                    success: true,
                    message: "Stubbed Marketplace subscription plan for account retrieved successfully.",
                    http_status: response.status,
                    account_id: input.account_id,
                    account: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetMarketplaceSubscriptionPlanForAccountStubbedFailure = {
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
