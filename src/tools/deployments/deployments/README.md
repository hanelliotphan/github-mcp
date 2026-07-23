# Deployments MCP tools

Tool implementations wrap [REST API endpoints for deployments](https://docs.github.com/en/rest/deployments/deployments?apiVersion=2026-03-10) under **Deployments**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_deployments` | Optional filters: `sha`, `ref`, `task`, `environment`; pagination |
| `github_create_repo_deployment` | Required `ref`; optional deployment fields; HTTP **201** or **202** |
| `github_get_repo_deployment` | — |
| `github_delete_repo_deployment` | HTTP **204** |
