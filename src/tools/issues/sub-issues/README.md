# Sub-issues MCP tools

Tool implementations wrap [REST API endpoints for sub-issues](https://docs.github.com/en/rest/issues/sub-issues?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_issue_parent` | |
| `github_list_issue_sub_issues` | |
| `github_add_issue_sub_issue` | |
| `github_remove_issue_sub_issue` | |
| `github_reprioritize_issue_sub_issue` | |
