# External groups MCP tools

Tool implementations wrap [External groups](https://docs.github.com/en/enterprise-cloud@latest/rest/teams/external-groups?apiVersion=2026-03-10) under **Teams**. Enterprise Managed Users only.

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_get_org_external_group` | `GET /orgs/{org}/external-group/{group_id}` |
| `github_list_org_external_groups` | `GET /orgs/{org}/external-groups` |
| `github_list_org_team_external_groups` | `GET /orgs/{org}/teams/{team_slug}/external-groups` |
| `github_update_org_team_external_groups` | `PATCH /orgs/{org}/teams/{team_slug}/external-groups` |
| `github_delete_org_team_external_groups` | `DELETE /orgs/{org}/teams/{team_slug}/external-groups` |
