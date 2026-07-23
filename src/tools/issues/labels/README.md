# Labels MCP tools

Tool implementations wrap [REST API endpoints for labels](https://docs.github.com/en/rest/issues/labels?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_issue_labels` | |
| `github_add_issue_labels` | |
| `github_set_issue_labels` | |
| `github_remove_all_issue_labels` | |
| `github_remove_issue_label` | |
| `github_list_repo_labels` | |
| `github_create_repo_label` | |
| `github_get_repo_label` | |
| `github_update_repo_label` | |
| `github_delete_repo_label` | |
| `github_list_milestone_labels` | |
