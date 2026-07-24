# Community metrics MCP tools

Tool implementations wrap [REST API endpoints for community metrics](https://docs.github.com/en/rest/metrics/community?apiVersion=2026-03-10) under **Metrics → Community**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_repo_community_profile_metrics` | Not available for forks |
