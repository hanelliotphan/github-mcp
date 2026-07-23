# Dependabot secrets MCP tools

Tools for [Dependabot secrets](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10). `create_or_update_*` tools accept plaintext `value` and encrypt via LibSodium. Failures use `CreateRepoFailure`.

## Organization

| Tool | Endpoint |
| --- | --- |
| `github_list_org_dependabot_secrets` | `GET /orgs/{org}/dependabot/secrets` |
| `github_get_org_dependabot_public_key` | `GET .../public-key` |
| `github_get_org_dependabot_secret` | `GET .../{secret_name}` |
| `github_create_or_update_org_dependabot_secret` | `PUT .../{secret_name}` |
| `github_delete_org_dependabot_secret` | `DELETE .../{secret_name}` |
| `github_list_selected_repos_for_org_dependabot_secret` | `GET .../repositories` |
| `github_set_selected_repos_for_org_dependabot_secret` | `PUT .../repositories` |
| `github_add_selected_repo_to_org_dependabot_secret` | `PUT .../repositories/{repository_id}` |
| `github_remove_selected_repo_from_org_dependabot_secret` | `DELETE .../repositories/{repository_id}` |

## Repository

| Tool | Endpoint |
| --- | --- |
| `github_list_repo_dependabot_secrets` | `GET /repos/{owner}/{repo}/dependabot/secrets` |
| `github_get_repo_dependabot_public_key` | `GET .../public-key` |
| `github_get_repo_dependabot_secret` | `GET .../{secret_name}` |
| `github_create_or_update_repo_dependabot_secret` | `PUT .../{secret_name}` |
| `github_delete_repo_dependabot_secret` | `DELETE .../{secret_name}` |
