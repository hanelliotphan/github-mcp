# Repository traffic MCP tools

Tool implementations wrap [REST API endpoints for repository traffic](https://docs.github.com/en/rest/metrics/traffic?apiVersion=2026-03-10) under **Metrics → Traffic**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

These endpoints require push access to the repository.

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_repo_clones` | Optional `per`: `day` \| `week` |
| `github_get_repo_top_paths` | Top 10 contents (14 days) |
| `github_get_repo_top_referrers` | Top 10 referrers (14 days) |
| `github_get_repo_views` | Optional `per`: `day` \| `week` |
