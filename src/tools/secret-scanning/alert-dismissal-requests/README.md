# Secret scanning alert dismissal requests MCP tools

Tool implementations wrap [REST API endpoints for secret scanning alert dismissal requests](https://docs.github.com/en/enterprise-cloud@latest/rest/secret-scanning/alert-dismissal-requests?apiVersion=2026-03-10) under **Secret scanning**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_enterprise_secret_scanning_alert_dismissal_requests` | |
| `github_list_org_secret_scanning_alert_dismissal_requests` | |
| `github_list_repo_secret_scanning_alert_dismissal_requests` | |
| `github_get_secret_scanning_alert_dismissal_request` | |
| `github_review_secret_scanning_alert_dismissal_request` | |
