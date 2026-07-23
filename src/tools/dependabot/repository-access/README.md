# Dependabot repository access MCP tools

Tools for [Dependabot repository access](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10) at enterprise and organization scope.

Failures use `CreateRepoFailure`.

## Enterprise

| Tool | Endpoint |
| --- | --- |
| `github_list_enterprise_dependabot_repository_access` | `GET /enterprises/{enterprise}/dependabot/repository-access` |
| `github_update_enterprise_dependabot_repository_access` | `PATCH /enterprises/{enterprise}/dependabot/repository-access` |
| `github_set_enterprise_dependabot_repository_access_default_level` | `PUT .../default-level` |

## Organization

| Tool | Endpoint |
| --- | --- |
| `github_list_org_dependabot_repository_access` | `GET /orgs/{org}/dependabot/repository-access` |
| `github_update_org_dependabot_repository_access` | `PATCH /orgs/{org}/dependabot/repository-access` |
| `github_set_org_dependabot_repository_access_default_level` | `PUT .../default-level` |
