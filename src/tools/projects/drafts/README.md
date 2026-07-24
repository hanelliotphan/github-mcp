# Project drafts MCP tools

Tool implementations wrap [REST API endpoints for draft Project items](https://docs.github.com/en/rest/projects/drafts?apiVersion=2026-03-10) under **Projects → Drafts**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_create_org_project_draft_item` | Org-owned project |
| `github_create_user_project_draft_item` | User-owned; path uses `user_id` |
