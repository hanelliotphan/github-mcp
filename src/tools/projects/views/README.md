# Project views MCP tools

Tool implementations wrap [REST API endpoints for Project views](https://docs.github.com/en/rest/projects/views?apiVersion=2026-03-10) under **Projects → Views**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_create_org_project_view` | `request` (no typed Octokit method) |
| `github_create_user_project_view` | Path uses `user_id` |
