# Deploy keys MCP tools

Tool implementations wrap [REST API endpoints for deploy keys](https://docs.github.com/en/rest/deploy-keys/deploy-keys?apiVersion=2026-03-10) under **Deploy keys**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_deploy_keys` | `per_page` / `page` / `all_pages` / `max_pages` |
| `github_create_repo_deploy_key` | Required `key`; optional `title`, `read_only` |
| `github_get_repo_deploy_key` | |
| `github_delete_repo_deploy_key` | Keys are immutable — delete and recreate to rotate |
