# Code scanning alert dismissal requests MCP tools

Tool implementations wrap [REST API endpoints for code scanning alert dismissal requests](https://docs.github.com/en/rest/code-scanning/alert-dismissal-requests?apiVersion=2026-03-10) under **Code scanning**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_list_org_code_scanning_dismissal_requests` | `GET /orgs/{org}/dismissal-requests/code-scanning` | Org-wide; optional filters |
| `github_list_repo_code_scanning_dismissal_requests` | `GET /repos/{owner}/{repo}/dismissal-requests/code-scanning` | Delegated dismissal required |
| `github_get_repo_code_scanning_dismissal_request` | `GET .../dismissal-requests/code-scanning/{alert_number}` | |
| `github_review_repo_code_scanning_dismissal_request` | `PATCH .../dismissal-requests/code-scanning/{alert_number}` | **204**; `approve`/`deny` |

### Access

Classic tokens need the `security_events` scope. Review requires dismissal reviewer authorization.
