# Dependabot alert dismissal requests MCP tools

Tool implementations wrap [REST API endpoints for Dependabot alert dismissal requests](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_list_org_dependabot_dismissal_requests` | `GET /orgs/{org}/dismissal-requests/dependabot` | Org-wide; optional filters |
| `github_list_repo_dependabot_dismissal_requests` | `GET /repos/{owner}/{repo}/dismissal-requests/dependabot` | Delegated dismissal required |
| `github_get_repo_dependabot_dismissal_request` | `GET .../dismissal-requests/dependabot/{alert_number}` | |
| `github_create_repo_dependabot_dismissal_request` | `POST .../dismissal-requests/dependabot/{alert_number}` | **201**; `dismissed_reason` required |
| `github_review_repo_dependabot_dismissal_request` | `PATCH .../dismissal-requests/dependabot/{alert_number}` | **200**; `approve`/`deny` |
| `github_cancel_repo_dependabot_dismissal_request` | `DELETE .../dismissal-requests/dependabot/{alert_number}` | **204** |

### Access

Classic tokens need the `security_events` scope. Review requires dismissal reviewer authorization.
