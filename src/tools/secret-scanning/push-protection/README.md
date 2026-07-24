# Secret scanning push protection MCP tools

Tool implementations wrap [REST API endpoints for secret scanning push protection](https://docs.github.com/en/rest/secret-scanning/push-protection?apiVersion=2026-03-10) under **Secret scanning**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_secret_scanning_pattern_configurations` | |
| `github_update_org_secret_scanning_pattern_configurations` | |
