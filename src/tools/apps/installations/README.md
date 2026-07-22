# Apps (Installations) MCP tools

Tool implementations wrap [REST API endpoints for GitHub App installations](https://docs.github.com/en/rest/apps/installations?apiVersion=2026-03-10) under **Apps → Installations**. They are registered from `src/index.ts`.

Auth differs by endpoint:

- **Installation access token** — `github_list_repos_accessible_to_installation` and `github_revoke_installation_access_token` act as the installation (`GET /installation/repositories`, `DELETE /installation/token`).
- **User access token** — the `/user/installations…` tools require a user token with permission to the installation. Add/remove repository tools need a **classic PAT** with the **`repo`** scope and **admin** access to the repository.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Auth note |
| --- | --- | --- |
| `github_list_repos_accessible_to_installation` | `GET /installation/repositories` | Installation token |
| `github_revoke_installation_access_token` | `DELETE /installation/token` | Installation token (**204**) |
| `github_list_app_installations_accessible_to_user` | `GET /user/installations` | User token |
| `github_list_installation_repos_for_authenticated_user` | `GET /user/installations/{installation_id}/repositories` | User token |
| `github_add_repo_to_app_installation` | `PUT /user/installations/{installation_id}/repositories/{repository_id}` | Classic PAT `repo` + admin (**204**) |
| `github_remove_repo_from_app_installation` | `DELETE /user/installations/{installation_id}/repositories/{repository_id}` | Classic PAT `repo` + admin (**204**) |

List endpoints support **`per_page`** (1–100; MCP default **100**), **`page`**, **`all_pages`**, and **`max_pages`**. They return GitHub’s **`total_count`** plus **`repositories`** or **`installations`**.
