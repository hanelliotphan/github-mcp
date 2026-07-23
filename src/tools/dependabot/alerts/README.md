# Dependabot alerts MCP tools

Tools for [Dependabot alerts](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10) at enterprise, organization, and repository scope.

Failures use `CreateRepoFailure`. List tools use cursor pagination (`before`/`after`) with optional `all_pages`.

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_enterprise_dependabot_alerts` | `GET /enterprises/{enterprise}/dependabot/alerts` |
| `github_list_org_dependabot_alerts` | `GET /orgs/{org}/dependabot/alerts` |
| `github_list_repo_dependabot_alerts` | `GET /repos/{owner}/{repo}/dependabot/alerts` |
| `github_get_repo_dependabot_alert` | `GET .../dependabot/alerts/{alert_number}` |
| `github_update_repo_dependabot_alert` | `PATCH .../dependabot/alerts/{alert_number}` |
