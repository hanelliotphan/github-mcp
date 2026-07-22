# Apps (Marketplace) MCP tools

Tool implementations wrap [REST API endpoints for GitHub Marketplace](https://docs.github.com/en/rest/apps/marketplace?apiVersion=2026-03-10) under **Apps → Marketplace**. They are registered from `src/index.ts`.

Most listing endpoints require a **GitHub App JWT** or **OAuth app basic auth** (client id/secret). Authenticated-user purchase tools use a **user access token**. **Stubbed** endpoints return hard-coded fake data for testing before listing on GitHub Marketplace — replace them with production endpoints before deploying.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Auth note |
| --- | --- | --- |
| `github_get_marketplace_subscription_plan_for_account` | `GET /marketplace_listing/accounts/{account_id}` | JWT or OAuth basic |
| `github_list_marketplace_plans` | `GET /marketplace_listing/plans` | JWT or OAuth basic |
| `github_list_marketplace_accounts_for_plan` | `GET /marketplace_listing/plans/{plan_id}/accounts` | JWT or OAuth basic |
| `github_get_marketplace_subscription_plan_for_account_stubbed` | `GET /marketplace_listing/stubbed/accounts/{account_id}` | JWT or OAuth basic (stubbed) |
| `github_list_marketplace_plans_stubbed` | `GET /marketplace_listing/stubbed/plans` | JWT or OAuth basic (stubbed) |
| `github_list_marketplace_accounts_for_plan_stubbed` | `GET /marketplace_listing/stubbed/plans/{plan_id}/accounts` | JWT or OAuth basic (stubbed) |
| `github_list_marketplace_purchases_for_authenticated_user` | `GET /user/marketplace_purchases` | User token |
| `github_list_marketplace_purchases_for_authenticated_user_stubbed` | `GET /user/marketplace_purchases/stubbed` | User token (stubbed) |

List endpoints support **`per_page`** (1–100; MCP default **100**), **`page`**, **`all_pages`**, and **`max_pages`**. Account-for-plan tools also accept **`sort`** (`created` \| `updated`) and **`direction`** (`asc` \| `desc`; ignored without `sort`).
