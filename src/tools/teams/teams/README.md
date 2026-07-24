# Teams MCP tools

Tool implementations wrap [Teams](https://docs.github.com/en/rest/teams/teams?apiVersion=2026-03-10) under **Teams**. They are registered from `src/index.ts`.

OAuth access tokens require the `read:org` scope for most endpoints.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_org_teams` | `GET /orgs/{org}/teams` |
| `github_create_org_team` | `POST /orgs/{org}/teams` |
| `github_get_org_team` | `GET /orgs/{org}/teams/{team_slug}` |
| `github_update_org_team` | `PATCH /orgs/{org}/teams/{team_slug}` |
| `github_delete_org_team` | `DELETE /orgs/{org}/teams/{team_slug}` |
| `github_list_org_team_repos` | `GET /orgs/{org}/teams/{team_slug}/repos` |
| `github_check_org_team_repo_permissions` | `GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}` |
| `github_add_or_update_org_team_repo_permissions` | `PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}` |
| `github_remove_org_team_repo` | `DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}` |
| `github_list_org_team_child_teams` | `GET /orgs/{org}/teams/{team_slug}/teams` |
| `github_list_authenticated_user_teams` | `GET /user/teams` |
