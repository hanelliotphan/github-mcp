# Dependency submission MCP tools

Tool implementations wrap [REST API endpoints for dependency submission](https://docs.github.com/en/rest/dependency-graph/dependency-submission?apiVersion=2026-03-10) under **Dependency graph > Dependency submission**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_create_repo_dependency_snapshot` | |
