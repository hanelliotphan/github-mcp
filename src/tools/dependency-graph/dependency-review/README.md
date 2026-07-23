# Dependency review MCP tools

Tool implementations wrap [REST API endpoints for dependency review](https://docs.github.com/en/rest/dependency-graph/dependency-review?apiVersion=2026-03-10) under **Dependency graph > Dependency review**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_compare_repo_dependency_graph` | MCP `manifest` → API query `name` (repo remains MCP `name`). |
