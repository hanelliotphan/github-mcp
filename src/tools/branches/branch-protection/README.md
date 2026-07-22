# Protected branches MCP tools

Tool implementations wrap [REST API endpoints for protected branches](https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2026-03-10) under **Branches**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_get_repo_branch_protection` | `GET /repos/{owner}/{repo}/branches/{branch}/protection` |
| `github_update_repo_branch_protection` | `PUT /repos/{owner}/{repo}/branches/{branch}/protection` |
| `github_delete_repo_branch_protection` | `DELETE /repos/{owner}/{repo}/branches/{branch}/protection` |
| `github_get_admin_branch_protection` | `GET .../protection/enforce_admins` |
| `github_set_admin_branch_protection` | `POST .../protection/enforce_admins` |
| `github_delete_admin_branch_protection` | `DELETE .../protection/enforce_admins` |
| `github_get_pull_request_review_protection` | `GET .../required_pull_request_reviews` |
| `github_update_pull_request_review_protection` | `PATCH .../required_pull_request_reviews` |
| `github_delete_pull_request_review_protection` | `DELETE .../required_pull_request_reviews` |
| `github_get_commit_signature_protection` | `GET .../required_signatures` |
| `github_create_commit_signature_protection` | `POST .../required_signatures` |
| `github_delete_commit_signature_protection` | `DELETE .../required_signatures` |
| `github_get_status_checks_protection` | `GET .../required_status_checks` |
| `github_update_status_check_protection` | `PATCH .../required_status_checks` |
| `github_remove_status_check_protection` | `DELETE .../required_status_checks` |
| `github_get_all_status_check_contexts` | `GET .../required_status_checks/contexts` |
| `github_add_status_check_contexts` | `POST .../required_status_checks/contexts` |
| `github_set_status_check_contexts` | `PUT .../required_status_checks/contexts` |
| `github_remove_status_check_contexts` | `DELETE .../required_status_checks/contexts` |
| `github_get_access_restrictions` | `GET .../protection/restrictions` |
| `github_delete_access_restrictions` | `DELETE .../protection/restrictions` |
| `github_get_apps_with_access_to_protected_branch` | `GET .../restrictions/apps` |
| `github_add_app_access_restrictions` | `POST .../restrictions/apps` |
| `github_set_app_access_restrictions` | `PUT .../restrictions/apps` |
| `github_remove_app_access_restrictions` | `DELETE .../restrictions/apps` |
| `github_get_teams_with_access_to_protected_branch` | `GET .../restrictions/teams` |
| `github_add_team_access_restrictions` | `POST .../restrictions/teams` |
| `github_set_team_access_restrictions` | `PUT .../restrictions/teams` |
| `github_remove_team_access_restrictions` | `DELETE .../restrictions/teams` |
| `github_get_users_with_access_to_protected_branch` | `GET .../restrictions/users` |
| `github_add_user_access_restrictions` | `POST .../restrictions/users` |
| `github_set_user_access_restrictions` | `PUT .../restrictions/users` |
| `github_remove_user_access_restrictions` | `DELETE .../restrictions/users` |
