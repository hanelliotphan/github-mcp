# Actions secrets tools

Tools for managing [GitHub Actions secrets](https://docs.github.com/en/rest/actions/secrets?apiVersion=2026-03-10) at the organization, repository, and environment level.

Secret **values are never returned** by GitHub. The `create_or_update_*` tools accept a plaintext **`value`**, automatically fetch the relevant public key, and encrypt it with LibSodium ([`libsodium-wrappers`](https://www.npmjs.com/package/libsodium-wrappers)) before sending it to GitHub, so you never need to encrypt anything yourself. They return HTTP `201` (created) or `204` (updated); all `delete_*`/`set_*`/`add_*`/`remove_*` tools return `204`. Org tools generally require the `admin:org` scope (plus `repo` for private repositories) for classic tokens; repository and environment tools require the `repo` scope. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Organization

| Tool | Endpoint |
| --- | --- |
| `github_list_org_actions_secrets` | `GET /orgs/{org}/actions/secrets` |
| `github_get_org_actions_public_key` | `GET /orgs/{org}/actions/secrets/public-key` |
| `github_get_org_actions_secret` | `GET /orgs/{org}/actions/secrets/{secret_name}` |
| `github_create_or_update_org_actions_secret` | `PUT /orgs/{org}/actions/secrets/{secret_name}` |
| `github_delete_org_actions_secret` | `DELETE /orgs/{org}/actions/secrets/{secret_name}` |
| `github_list_selected_repos_for_org_actions_secret` | `GET …/secrets/{secret_name}/repositories` |
| `github_set_selected_repos_for_org_actions_secret` | `PUT …/secrets/{secret_name}/repositories` |
| `github_add_selected_repo_to_org_actions_secret` | `PUT …/secrets/{secret_name}/repositories/{repository_id}` |
| `github_remove_selected_repo_from_org_actions_secret` | `DELETE …/secrets/{secret_name}/repositories/{repository_id}` |

## Repository

| Tool | Endpoint |
| --- | --- |
| `github_list_repo_organization_actions_secrets` | `GET /repos/{owner}/{repo}/actions/organization-secrets` |
| `github_list_repo_actions_secrets` | `GET /repos/{owner}/{repo}/actions/secrets` |
| `github_get_repo_actions_public_key` | `GET /repos/{owner}/{repo}/actions/secrets/public-key` |
| `github_get_repo_actions_secret` | `GET /repos/{owner}/{repo}/actions/secrets/{secret_name}` |
| `github_create_or_update_repo_actions_secret` | `PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}` |
| `github_delete_repo_actions_secret` | `DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}` |

## Environment

| Tool | Endpoint |
| --- | --- |
| `github_list_environment_actions_secrets` | `GET …/environments/{environment_name}/secrets` |
| `github_get_environment_actions_public_key` | `GET …/environments/{environment_name}/secrets/public-key` |
| `github_get_environment_actions_secret` | `GET …/environments/{environment_name}/secrets/{secret_name}` |
| `github_create_or_update_environment_actions_secret` | `PUT …/environments/{environment_name}/secrets/{secret_name}` |
| `github_delete_environment_actions_secret` | `DELETE …/environments/{environment_name}/secrets/{secret_name}` |
