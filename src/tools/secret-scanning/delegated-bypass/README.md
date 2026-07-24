# Secret scanning delegated bypass MCP tools

Tool implementations wrap [REST API endpoints for push protection bypass requests](https://docs.github.com/en/enterprise-cloud@latest/rest/secret-scanning/delegated-bypass?apiVersion=2026-03-10) under **Secret scanning**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_enterprise_secret_scanning_bypass_requests` | |
| `github_list_org_secret_scanning_bypass_requests` | |
| `github_list_repo_secret_scanning_bypass_requests` | |
| `github_get_secret_scanning_bypass_request` | |
| `github_review_secret_scanning_bypass_request` | |
| `github_dismiss_secret_scanning_bypass_response` | |
