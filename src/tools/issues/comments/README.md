# Comments MCP tools

Tool implementations wrap [REST API endpoints for comments](https://docs.github.com/en/rest/issues/comments?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_issue_comments` | |
| `github_get_issue_comment` | |
| `github_update_issue_comment` | |
| `github_delete_issue_comment` | |
| `github_pin_issue_comment` | |
| `github_unpin_issue_comment` | |
| `github_list_issue_comments` | |
| `github_create_issue_comment` | |
