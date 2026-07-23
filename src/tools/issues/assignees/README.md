# Assignees MCP tools

Tool implementations wrap [REST API endpoints for assignees](https://docs.github.com/en/rest/issues/assignees?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_assignees` | |
| `github_check_user_can_be_assigned` | |
| `github_add_issue_assignees` | |
| `github_remove_issue_assignees` | |
| `github_check_user_can_be_assigned_to_issue` | |
