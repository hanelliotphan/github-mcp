# Issue field values MCP tools

Tool implementations wrap [REST API endpoints for issue field values](https://docs.github.com/en/rest/issues/issue-field-values?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_issue_field_values` | |
| `github_add_issue_field_values` | |
| `github_set_issue_field_values` | |
| `github_delete_issue_field_value` | |
