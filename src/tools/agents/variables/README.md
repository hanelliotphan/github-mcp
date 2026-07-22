# Agents variables tools

Tools for managing [GitHub Agents variables](https://docs.github.com/en/rest/agents/variables?apiVersion=2026-03-10) at the organization and repository levels. Variables store non-sensitive configuration values that agents can reference.

Organization tools need the **`admin:org`** scope for classic OAuth apps and PATs (plus `repo` for private repositories); repository tools need the **`repo`** scope. `create` returns HTTP `201`, `get`/`list` return `200`, and `update`/`delete`/`set`/`add`/`remove` return `204`. The org selected-repository endpoints return `409` when the variable's visibility is not `selected`. List endpoints support pagination (`per_page`, `page`, `all_pages`, `max_pages`). Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Organization

| Tool | Endpoint |
| --- | --- |
| `github_list_org_agent_variables` | `GET /orgs/{org}/agents/variables` |
| `github_create_org_agent_variable` | `POST /orgs/{org}/agents/variables` |
| `github_get_org_agent_variable` | `GET /orgs/{org}/agents/variables/{name}` |
| `github_update_org_agent_variable` | `PATCH /orgs/{org}/agents/variables/{name}` |
| `github_delete_org_agent_variable` | `DELETE /orgs/{org}/agents/variables/{name}` |
| `github_list_selected_repos_for_org_agent_variable` | `GET …/variables/{name}/repositories` |
| `github_set_selected_repos_for_org_agent_variable` | `PUT …/variables/{name}/repositories` |
| `github_add_selected_repo_to_org_agent_variable` | `PUT …/variables/{name}/repositories/{repository_id}` |
| `github_remove_selected_repo_from_org_agent_variable` | `DELETE …/variables/{name}/repositories/{repository_id}` |

## Repository

| Tool | Endpoint |
| --- | --- |
| `github_list_repo_organization_agent_variables` | `GET /repos/{owner}/{repo}/agents/organization-variables` |
| `github_list_repo_agent_variables` | `GET /repos/{owner}/{repo}/agents/variables` |
| `github_create_repo_agent_variable` | `POST /repos/{owner}/{repo}/agents/variables` |
| `github_get_repo_agent_variable` | `GET /repos/{owner}/{repo}/agents/variables/{name}` |
| `github_update_repo_agent_variable` | `PATCH /repos/{owner}/{repo}/agents/variables/{name}` |
| `github_delete_repo_agent_variable` | `DELETE /repos/{owner}/{repo}/agents/variables/{name}` |
