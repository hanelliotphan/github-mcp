# Apps (GitHub Apps) MCP tools

Tool implementations wrap [REST API endpoints for GitHub Apps](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10) under **Apps → GitHub Apps**. They are registered from `src/index.ts`.

Most endpoints require authentication as a **GitHub App** using a **JWT** (not a personal access token or installation token). `github_get_app` is a public lookup by slug; `github_create_github_app_from_manifest` completes the manifest handshake; `github_create_scoped_access_token` scopes a user access token for an OAuth/GitHub App `client_id`.

Installations, Marketplace, OAuth Apps, and App webhooks sections are **not** implemented here.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Auth note |
| --- | --- | --- |
| `github_get_authenticated_app` | `GET /app` | JWT |
| `github_create_github_app_from_manifest` | `POST /app-manifests/{code}/conversions` | Manifest code |
| `github_list_installation_requests_for_authenticated_app` | `GET /app/installation-requests` | App (JWT) |
| `github_list_installations_for_authenticated_app` | `GET /app/installations` | JWT |
| `github_get_installation_for_authenticated_app` | `GET /app/installations/{installation_id}` | JWT |
| `github_delete_installation_for_authenticated_app` | `DELETE /app/installations/{installation_id}` | JWT (**202**) |
| `github_create_installation_access_token` | `POST /app/installations/{installation_id}/access_tokens` | JWT |
| `github_suspend_app_installation` | `PUT /app/installations/{installation_id}/suspended` | JWT (**204**) |
| `github_unsuspend_app_installation` | `DELETE /app/installations/{installation_id}/suspended` | JWT (**204**) |
| `github_create_scoped_access_token` | `POST /applications/{client_id}/token/scoped` | App credentials + user token |
| `github_get_app` | `GET /apps/{app_slug}` | Public app metadata |
| `github_get_org_installation_for_authenticated_app` | `GET /orgs/{org}/installation` | JWT |
| `github_get_repo_installation_for_authenticated_app` | `GET /repos/{owner}/{repo}/installation` | JWT (`name` → `repo`) |
| `github_get_user_installation_for_authenticated_app` | `GET /users/{username}/installation` | JWT |

List endpoints support **`per_page`** (1–100; MCP default **100**), **`page`**, **`all_pages`**, and **`max_pages`**. `github_list_installations_for_authenticated_app` also accepts **`since`** and **`outdated`**.
