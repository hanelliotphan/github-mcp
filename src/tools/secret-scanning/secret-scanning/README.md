# Secret scanning MCP tools

Tool implementations wrap [REST API endpoints for secret scanning](https://docs.github.com/en/rest/secret-scanning/secret-scanning?apiVersion=2026-03-10) under **Secret scanning**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_secret_scanning_alerts` | |
| `github_list_repo_secret_scanning_alerts` | |
| `github_get_secret_scanning_alert` | |
| `github_update_secret_scanning_alert` | |
| `github_list_secret_scanning_alert_locations` | |
| `github_create_secret_scanning_push_protection_bypass` | |
| `github_get_repo_secret_scanning_scan_history` | |
