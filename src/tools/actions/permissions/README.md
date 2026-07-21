# Actions permissions tools

Tools for managing [GitHub Actions permissions](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10) at the organization and repository level.

Org-level tools require the authenticated user to be an organization owner (classic tokens need `admin:org`). Repo-level tools require admin access (classic tokens need `repo`). All `set`/`enable`/`disable` tools return HTTP 204. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Organization

| Tool | Endpoint |
| --- | --- |
| `github_get_github_actions_permissions_organization` | `GET /orgs/{org}/actions/permissions` |
| `github_set_github_actions_permissions_organization` | `PUT /orgs/{org}/actions/permissions` |
| `github_list_selected_repositories_enabled_github_actions_organization` | `GET /orgs/{org}/actions/permissions/repositories` |
| `github_set_selected_repositories_enabled_github_actions_organization` | `PUT /orgs/{org}/actions/permissions/repositories` |
| `github_enable_selected_repository_github_actions_organization` | `PUT …/repositories/{repository_id}` |
| `github_disable_selected_repository_github_actions_organization` | `DELETE …/repositories/{repository_id}` |
| `github_get_allowed_actions_organization` | `GET /orgs/{org}/actions/permissions/selected-actions` |
| `github_set_allowed_actions_organization` | `PUT /orgs/{org}/actions/permissions/selected-actions` |
| `github_get_github_actions_default_workflow_permissions_organization` | `GET /orgs/{org}/actions/permissions/workflow` |
| `github_set_github_actions_default_workflow_permissions_organization` | `PUT /orgs/{org}/actions/permissions/workflow` |

## Repository

| Tool | Endpoint |
| --- | --- |
| `github_get_github_actions_permissions_repository` | `GET /repos/{owner}/{repo}/actions/permissions` |
| `github_set_github_actions_permissions_repository` | `PUT /repos/{owner}/{repo}/actions/permissions` |
| `github_get_workflow_access_to_repository` | `GET …/actions/permissions/access` |
| `github_set_workflow_access_to_repository` | `PUT …/actions/permissions/access` |
| `github_get_allowed_actions_repository` | `GET …/actions/permissions/selected-actions` |
| `github_set_allowed_actions_repository` | `PUT …/actions/permissions/selected-actions` |
| `github_get_github_actions_default_workflow_permissions_repository` | `GET …/actions/permissions/workflow` |
| `github_set_github_actions_default_workflow_permissions_repository` | `PUT …/actions/permissions/workflow` |
