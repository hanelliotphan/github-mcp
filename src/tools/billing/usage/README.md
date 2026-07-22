# Billing usage MCP tools

Tool implementations wrap [Billing usage](https://docs.github.com/en/rest/billing/usage?apiVersion=2026-03-10) under **Billing → Billing usage**. They are registered from `src/index.ts`.

These replace the retired product-specific Actions/Packages/shared-storage billing endpoints. Usage summary endpoints are in **public preview**.

Organization tools require an organization administrator. User tools require access to that user’s billing data.

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_get_org_ai_credit_billing_usage` | `GET /organizations/{org}/settings/billing/ai_credit/usage` |
| `github_get_org_premium_request_billing_usage` | `GET /organizations/{org}/settings/billing/premium_request/usage` |
| `github_get_org_billing_usage` | `GET /organizations/{org}/settings/billing/usage` |
| `github_get_org_billing_usage_summary` | `GET /organizations/{org}/settings/billing/usage/summary` |
| `github_get_user_ai_credit_billing_usage` | `GET /users/{username}/settings/billing/ai_credit/usage` |
| `github_get_user_premium_request_billing_usage` | `GET /users/{username}/settings/billing/premium_request/usage` |
| `github_get_user_billing_usage` | `GET /users/{username}/settings/billing/usage` |
| `github_get_user_billing_usage_summary` | `GET /users/{username}/settings/billing/usage/summary` |
