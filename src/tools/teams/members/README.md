# Team members MCP tools

Tool implementations wrap [Team members](https://docs.github.com/en/rest/teams/members?apiVersion=2026-03-10) under **Teams**. They are registered from `src/index.ts`.

OAuth access tokens require the `read:org` scope for most endpoints.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_org_team_pending_invitations` | `GET /orgs/{org}/teams/{team_slug}/invitations` |
| `github_list_org_team_members` | `GET /orgs/{org}/teams/{team_slug}/members` |
| `github_get_org_team_membership_for_user` | `GET /orgs/{org}/teams/{team_slug}/memberships/{username}` |
| `github_add_or_update_org_team_membership_for_user` | `PUT /orgs/{org}/teams/{team_slug}/memberships/{username}` |
| `github_remove_org_team_membership_for_user` | `DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}` |
