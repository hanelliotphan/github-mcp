# Enterprise team organizations MCP tools

Tool implementations wrap [Enterprise team organizations](https://docs.github.com/en/rest/enterprise-teams/enterprise-team-organizations?apiVersion=2026-03-10) under **Enterprise teams → Enterprise team organizations**. They are registered from `src/index.ts`.

Requires a **classic PAT** only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_enterprise_team_organization_assignments` | `GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations` |
| `github_bulk_add_enterprise_team_organization_assignments` | `POST …/organizations/add` |
| `github_bulk_remove_enterprise_team_organization_assignments` | `POST …/organizations/remove` |
| `github_get_enterprise_team_organization_assignment` | `GET …/organizations/{org}` |
| `github_add_enterprise_team_organization_assignment` | `PUT …/organizations/{org}` |
| `github_delete_enterprise_team_organization_assignment` | `DELETE …/organizations/{org}` |
