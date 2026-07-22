# Agents secrets tools

Tools for managing [GitHub agent secrets](https://docs.github.com/en/rest/agents/secrets?apiVersion=2026-03-10) at the organization and repository level.

Secret **values are never returned** by GitHub. The `create_or_update_*` tools accept a plaintext **`value`**, automatically fetch the relevant public key, and encrypt it with LibSodium ([`libsodium-wrappers`](https://www.npmjs.com/package/libsodium-wrappers)) before sending it to GitHub, so you never need to encrypt anything yourself. They return HTTP `201` (created) or `204` (updated); all `delete_*`/`set_*`/`add_*`/`remove_*` tools return `204`. Org tools generally require the `admin:org` scope (plus `repo` for private repositories) for classic tokens; repository tools require the `repo` scope. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Organization

| Tool | Endpoint |
| --- | --- |
| `github_list_org_agent_secrets` | `GET /orgs/{org}/agents/secrets` |
| `github_get_org_agent_public_key` | `GET /orgs/{org}/agents/secrets/public-key` |
| `github_get_org_agent_secret` | `GET /orgs/{org}/agents/secrets/{secret_name}` |
| `github_create_or_update_org_agent_secret` | `PUT /orgs/{org}/agents/secrets/{secret_name}` |
| `github_delete_org_agent_secret` | `DELETE /orgs/{org}/agents/secrets/{secret_name}` |
| `github_list_selected_repos_for_org_agent_secret` | `GET …/secrets/{secret_name}/repositories` |
| `github_set_selected_repos_for_org_agent_secret` | `PUT …/secrets/{secret_name}/repositories` |
| `github_add_selected_repo_to_org_agent_secret` | `PUT …/secrets/{secret_name}/repositories/{repository_id}` |
| `github_remove_selected_repo_from_org_agent_secret` | `DELETE …/secrets/{secret_name}/repositories/{repository_id}` |

## Repository

| Tool | Endpoint |
| --- | --- |
| `github_list_repo_organization_agent_secrets` | `GET /repos/{owner}/{repo}/agents/organization-secrets` |
| `github_list_repo_agent_secrets` | `GET /repos/{owner}/{repo}/agents/secrets` |
| `github_get_repo_agent_public_key` | `GET /repos/{owner}/{repo}/agents/secrets/public-key` |
| `github_get_repo_agent_secret` | `GET /repos/{owner}/{repo}/agents/secrets/{secret_name}` |
| `github_create_or_update_repo_agent_secret` | `PUT /repos/{owner}/{repo}/agents/secrets/{secret_name}` |
| `github_delete_repo_agent_secret` | `DELETE /repos/{owner}/{repo}/agents/secrets/{secret_name}` |
