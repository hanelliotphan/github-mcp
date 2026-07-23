# Enterprise teams MCP tools

Tool implementations wrap [Enterprise teams](https://docs.github.com/en/rest/enterprise-teams/enterprise-teams?apiVersion=2026-03-10) under **Enterprise teams**. They are registered from `src/index.ts`.

Requires a **classic PAT** only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_enterprise_teams` | `GET /enterprises/{enterprise}/teams` |
| `github_create_enterprise_team` | `POST /enterprises/{enterprise}/teams` |
| `github_get_enterprise_team` | `GET /enterprises/{enterprise}/teams/{team_slug}` |
| `github_update_enterprise_team` | `PATCH /enterprises/{enterprise}/teams/{team_slug}` |
| `github_delete_enterprise_team` | `DELETE /enterprises/{enterprise}/teams/{team_slug}` |
