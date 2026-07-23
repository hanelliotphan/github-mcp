# Issue dependencies MCP tools

Tool implementations wrap [REST API endpoints for issue dependencies](https://docs.github.com/en/rest/issues/issue-dependencies?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_issue_dependencies_blocked_by` | |
| `github_add_issue_dependency_blocked_by` | |
| `github_remove_issue_dependency_blocked_by` | |
| `github_list_issue_dependencies_blocking` | |
