# Actions variables tools

Tools for managing [GitHub Actions variables](https://docs.github.com/en/rest/actions/variables?apiVersion=2026-03-10) at the organization, repository, and environment levels. Variables store non-sensitive configuration values (e.g. a username) that workflows can reference.

Organization tools need the **`admin:org`** scope for classic OAuth apps and PATs (plus `repo` for private repositories); repository and environment tools need the **`repo`** scope. `create` returns HTTP `201`, `get`/`list` return `200`, and `update`/`delete`/`set`/`add`/`remove` return `204`. The org selected-repository endpoints return `409` when the variable's visibility is not `selected`. List endpoints support pagination (`per_page`, `page`, `all_pages`, `max_pages`). Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Organization

| Tool | Endpoint |
| --- | --- |
| `github_list_org_actions_variables` | `GET /orgs/{org}/actions/variables` |
| `github_create_org_actions_variable` | `POST /orgs/{org}/actions/variables` |
| `github_get_org_actions_variable` | `GET /orgs/{org}/actions/variables/{name}` |
| `github_update_org_actions_variable` | `PATCH /orgs/{org}/actions/variables/{name}` |
| `github_delete_org_actions_variable` | `DELETE /orgs/{org}/actions/variables/{name}` |
| `github_list_selected_repos_for_org_actions_variable` | `GET …/variables/{name}/repositories` |
| `github_set_selected_repos_for_org_actions_variable` | `PUT …/variables/{name}/repositories` |
| `github_add_selected_repo_to_org_actions_variable` | `PUT …/variables/{name}/repositories/{repository_id}` |
| `github_remove_selected_repo_from_org_actions_variable` | `DELETE …/variables/{name}/repositories/{repository_id}` |

## Repository

| Tool | Endpoint |
| --- | --- |
| `github_list_repo_organization_actions_variables` | `GET /repos/{owner}/{repo}/actions/organization-variables` |
| `github_list_repo_actions_variables` | `GET /repos/{owner}/{repo}/actions/variables` |
| `github_create_repo_actions_variable` | `POST /repos/{owner}/{repo}/actions/variables` |
| `github_get_repo_actions_variable` | `GET /repos/{owner}/{repo}/actions/variables/{name}` |
| `github_update_repo_actions_variable` | `PATCH /repos/{owner}/{repo}/actions/variables/{name}` |
| `github_delete_repo_actions_variable` | `DELETE /repos/{owner}/{repo}/actions/variables/{name}` |

## Environment

| Tool | Endpoint |
| --- | --- |
| `github_list_environment_actions_variables` | `GET …/environments/{environment_name}/variables` |
| `github_create_environment_actions_variable` | `POST …/environments/{environment_name}/variables` |
| `github_get_environment_actions_variable` | `GET …/environments/{environment_name}/variables/{name}` |
| `github_update_environment_actions_variable` | `PATCH …/environments/{environment_name}/variables/{name}` |
| `github_delete_environment_actions_variable` | `DELETE …/environments/{environment_name}/variables/{name}` |
