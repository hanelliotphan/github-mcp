# Enterprise team members MCP tools

Tool implementations wrap [Enterprise team members](https://docs.github.com/en/rest/enterprise-teams/enterprise-team-members?apiVersion=2026-03-10) under **Enterprise teams → Enterprise team members**. They are registered from `src/index.ts`.

Requires a **classic PAT** only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_enterprise_team_members` | `GET /enterprises/{enterprise}/teams/{enterprise-team}/memberships` |
| `github_bulk_add_enterprise_team_members` | `POST …/memberships/add` |
| `github_bulk_remove_enterprise_team_members` | `POST …/memberships/remove` |
| `github_get_enterprise_team_membership` | `GET …/memberships/{username}` |
| `github_add_enterprise_team_member` | `PUT …/memberships/{username}` |
| `github_remove_enterprise_team_membership` | `DELETE …/memberships/{username}` |
