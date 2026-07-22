# Copilot usage metrics MCP tools

Tool implementations wrap [Copilot usage metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_enterprise_copilot_metrics_1_day` | Get Copilot enterprise usage metrics download links for a specific day (GET /enterprises/{enterprise}/copilot/metrics/reports/enterprise-1-day). |
| `github_get_enterprise_copilot_metrics_28_day` | Get latest 28-day Copilot enterprise usage metrics download links (GET /enterprises/{enterprise}/copilot/metrics/reports/enterprise-28-day/latest). |
| `github_get_enterprise_copilot_repos_metrics_1_day` | Get Copilot enterprise repository metrics download links for a specific day (GET /enterprises/{enterprise}/copilot/metrics/reports/repos-1-day). |
| `github_get_enterprise_copilot_user_teams_metrics_1_day` | Get Copilot enterprise user-teams metrics download links for a specific day (GET /enterprises/{enterprise}/copilot/metrics/reports/user-teams-1-day). |
| `github_get_enterprise_copilot_users_metrics_1_day` | Get Copilot enterprise users metrics download links for a specific day (GET /enterprises/{enterprise}/copilot/metrics/reports/users-1-day). |
| `github_get_enterprise_copilot_users_metrics_28_day` | Get latest 28-day Copilot enterprise users metrics download links (GET /enterprises/{enterprise}/copilot/metrics/reports/users-28-day/latest). |
| `github_get_org_copilot_metrics_1_day` | Get Copilot organization usage metrics download links for a specific day (GET /orgs/{org}/copilot/metrics/reports/organization-1-day). |
| `github_get_org_copilot_metrics_28_day` | Get latest 28-day Copilot organization usage metrics download links (GET /orgs/{org}/copilot/metrics/reports/organization-28-day/latest). |
| `github_get_org_copilot_repos_metrics_1_day` | Get Copilot organization repository metrics download links for a specific day (GET /orgs/{org}/copilot/metrics/reports/repos-1-day). |
| `github_get_org_copilot_user_teams_metrics_1_day` | Get Copilot organization user-teams metrics download links for a specific day (GET /orgs/{org}/copilot/metrics/reports/user-teams-1-day). |
| `github_get_org_copilot_users_metrics_1_day` | Get Copilot organization users metrics download links for a specific day (GET /orgs/{org}/copilot/metrics/reports/users-1-day). |
| `github_get_org_copilot_users_metrics_28_day` | Get latest 28-day Copilot organization users metrics download links (GET /orgs/{org}/copilot/metrics/reports/users-28-day/latest). |
