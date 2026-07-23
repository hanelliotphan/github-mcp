# Deployment statuses MCP tools

Tool implementations wrap [REST API endpoints for statuses](https://docs.github.com/en/rest/deployments/statuses?apiVersion=2026-03-10) under **Deployments**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_deployment_statuses` | Pagination |
| `github_create_repo_deployment_status` | Required `state` enum |
| `github_get_repo_deployment_status` | — |
