# Team sync MCP tools

Tool implementations wrap [Team synchronization](https://docs.github.com/en/enterprise-cloud@latest/rest/teams/team-sync?apiVersion=2026-03-10) under **Teams**. Team synchronization must be enabled.

Legacy endpoints are not implemented.

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_org_team_sync_idp_groups` | `GET /orgs/{org}/team-sync/groups` |
| `github_list_org_team_sync_group_mappings` | `GET /orgs/{org}/teams/{team_slug}/team-sync/group-mappings` |
| `github_update_org_team_sync_group_mappings` | `PATCH /orgs/{org}/teams/{team_slug}/team-sync/group-mappings` |
