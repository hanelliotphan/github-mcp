# Environments MCP tools

Tool implementations wrap [REST API endpoints for environments](https://docs.github.com/en/rest/deployments/environments?apiVersion=2026-03-10) under **Deployments**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_environments` | `per_page` / `page` / `all_pages` / `max_pages`; returns `total_count` + `environments` |
| `github_get_repo_environment` | — |
| `github_create_or_update_repo_environment` | Optional `wait_timer`, `prevent_self_review`, `reviewers`, `deployment_branch_policy` |
| `github_delete_repo_environment` | HTTP **204** via `deleteAnEnvironment` |
