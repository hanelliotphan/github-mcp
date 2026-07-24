# Secret scanning custom patterns MCP tools

Tool implementations wrap [REST API endpoints for secret scanning custom patterns](https://docs.github.com/en/rest/secret-scanning/custom-patterns?apiVersion=2026-03-10) under **Secret scanning**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_secret_scanning_custom_patterns` | |
| `github_list_repo_secret_scanning_custom_patterns` | |
| `github_create_org_secret_scanning_custom_patterns` | |
| `github_delete_org_secret_scanning_custom_patterns` | |
| `github_update_org_secret_scanning_custom_pattern` | |
| `github_create_repo_secret_scanning_custom_patterns` | |
| `github_delete_repo_secret_scanning_custom_patterns` | |
| `github_update_repo_secret_scanning_custom_pattern` | |
