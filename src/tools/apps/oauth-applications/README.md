# Apps (OAuth authorizations) MCP tools

Tool implementations wrap [REST API endpoints for OAuth authorizations](https://docs.github.com/en/rest/apps/oauth-applications?apiVersion=2026-03-10) under **Apps → OAuth authorizations**. They are registered from `src/index.ts`.

These endpoints manage OAuth tokens for **OAuth apps** (`gho_`) and **GitHub App user-to-server tokens** (`ghu_`). Authentication typically uses **app client credentials** (HTTP basic auth with the app’s client id and secret), not a normal Bearer personal access token. **`access_token`** inputs are sensitive and are not logged by these tools.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_delete_app_authorization` | `DELETE /applications/{client_id}/grant` | Revokes the grant and all tokens for that user (**204**) |
| `github_check_app_token` | `POST /applications/{client_id}/token` | Validates a token; invalid → **404** |
| `github_reset_app_token` | `PATCH /applications/{client_id}/token` | Returns a new token; save it immediately |
| `github_delete_app_token` | `DELETE /applications/{client_id}/token` | Revokes a single token (**204**) |

All tools require **`client_id`** and **`access_token`**. Check/reset return an **`authorization`** object (scopes, user, installation, token metadata, …). Reset responses include a new **`token`** that takes effect immediately.
