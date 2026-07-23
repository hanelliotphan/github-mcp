# Organization interactions MCP tools

Tool implementations wrap [REST API endpoints for organization interactions](https://docs.github.com/en/rest/interactions/orgs?apiVersion=2026-03-10) under **Interactions → Organizations**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_org_interaction_limits` | Empty API body → `interaction_limits: null` |
| `github_set_org_interaction_limits` | Required `limit`; optional `expiry` |
| `github_remove_org_interaction_limits` | HTTP 204 on success |

## Shared enums

- **`limit`**: `existing_users`, `contributors_only`, `collaborators_only`
- **`expiry`**: `one_day`, `three_days`, `one_week`, `one_month`, `six_months`
