# Milestones MCP tools

Tool implementations wrap [REST API endpoints for milestones](https://docs.github.com/en/rest/issues/milestones?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_milestones` | |
| `github_create_repo_milestone` | |
| `github_get_repo_milestone` | |
| `github_update_repo_milestone` | |
| `github_delete_repo_milestone` | |
