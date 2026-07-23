# User interactions MCP tools

Tool implementations wrap [REST API endpoints for user interactions](https://docs.github.com/en/rest/interactions/user?apiVersion=2026-03-10) under **Interactions → User** (authenticated user). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_authenticated_user_interaction_limits` | HTTP **204** → `interaction_limits: null`, `http_status: 204` |
| `github_set_authenticated_user_interaction_limits` | Required `limit`; optional `expiry` |
| `github_remove_authenticated_user_interaction_limits` | HTTP 204 on success |

## Shared enums

- **`limit`**: `existing_users`, `contributors_only`, `collaborators_only`
- **`expiry`**: `one_day`, `three_days`, `one_week`, `one_month`, `six_months`
