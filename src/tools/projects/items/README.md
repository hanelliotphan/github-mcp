# Project items MCP tools

Tool implementations wrap [REST API endpoints for Project items](https://docs.github.com/en/rest/projects/items?apiVersion=2026-03-10) under **Projects → Items**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_project_items` | Cursor pagination; optional `q`, `fields` |
| `github_add_org_project_item` | `id` or `owner`+`name`+`number` |
| `github_get_org_project_item` | Optional `fields` |
| `github_update_org_project_item` | Required `fields` updates |
| `github_delete_org_project_item` | HTTP **204** |
| `github_list_org_project_view_items` | View-filtered list (`request`) |
| `github_list_user_project_items` | Cursor pagination |
| `github_add_user_project_item` | `id` or `owner`+`name`+`number` |
| `github_get_user_project_item` | Optional `fields` |
| `github_update_user_project_item` | Required `fields` updates |
| `github_delete_user_project_item` | HTTP **204** |
| `github_list_user_project_view_items` | View-filtered list (`request`) |
