# Budgets MCP tools

Tool implementations wrap [Budgets](https://docs.github.com/en/rest/billing/budgets?apiVersion=2026-03-10) under **Billing → Budgets**. They are registered from `src/index.ts`.

The authenticated user must be an organization **admin** or **billing manager**.

For user-scoped budgets, include **`user`** (GitHub username) when creating/updating; omit or leave `budget_entity_name` empty as required by the API.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_org_budgets` | `GET /organizations/{org}/settings/billing/budgets` |
| `github_create_org_budget` | `POST /organizations/{org}/settings/billing/budgets` |
| `github_get_org_budget` | `GET /organizations/{org}/settings/billing/budgets/{budget_id}` |
| `github_update_org_budget` | `PATCH /organizations/{org}/settings/billing/budgets/{budget_id}` |
| `github_delete_org_budget` | `DELETE /organizations/{org}/settings/billing/budgets/{budget_id}` |
