# Repository interactions MCP tools

Tool implementations wrap [REST API endpoints for repository interactions](https://docs.github.com/en/rest/interactions/repos?apiVersion=2026-03-10) under **Interactions → Repositories**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

MCP **`name`** maps to API **`repo`**.

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_repo_interaction_limits` | Empty API body → `interaction_limits: null` |
| `github_set_repo_interaction_limits` | Required `limit`; optional `expiry`; **409** if org-level limit set |
| `github_remove_repo_interaction_limits` | HTTP 204; **409** if org-level limit set |
| `github_list_repo_pull_request_creation_cap_bypass_list` | Returns `users` array |
| `github_add_repo_pull_request_creation_cap_bypass_users` | Required `users` (1–100); HTTP 204 |
| `github_remove_repo_pull_request_creation_cap_bypass_users` | Required `users` (1–100); HTTP 204 |
| `github_get_repo_pull_request_creation_cap` | Returns `creation_cap` |
| `github_update_repo_pull_request_creation_cap` | Required `enabled`; optional `max_open_pull_requests` (1–1000) |

## Shared enums

- **`limit`**: `existing_users`, `contributors_only`, `collaborators_only`
- **`expiry`**: `one_day`, `three_days`, `one_week`, `one_month`, `six_months`
