# Projects MCP tools

Tool implementations wrap [REST API endpoints for Projects](https://docs.github.com/en/rest/projects/projects?apiVersion=2026-03-10) under **Projects → Projects**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_projects` | Cursor pagination; optional `q` |
| `github_get_org_project` | |
| `github_list_user_projects` | Cursor pagination; optional `q` |
| `github_get_user_project` | |
