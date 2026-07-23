# Issues MCP tools

Tool implementations wrap [REST API endpoints for issues](https://docs.github.com/en/rest/issues/issues?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_issues` | |
| `github_list_user_account_issues` | |
| `github_list_org_issues` | |
| `github_list_repo_issues` | |
| `github_create_repo_issue` | |
| `github_get_repo_issue` | |
| `github_update_repo_issue` | |
| `github_lock_repo_issue` | |
| `github_unlock_repo_issue` | |
