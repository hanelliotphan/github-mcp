# Project fields MCP tools

Tool implementations wrap [REST API endpoints for Project fields](https://docs.github.com/en/rest/projects/fields?apiVersion=2026-03-10) under **Projects → Fields**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_project_fields` | Cursor pagination |
| `github_create_org_project_field` | `request` (no typed Octokit method) |
| `github_get_org_project_field` | |
| `github_list_user_project_fields` | Cursor pagination |
| `github_create_user_project_field` | `request` (no typed Octokit method) |
| `github_get_user_project_field` | |
