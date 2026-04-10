# Organization MCP tools

Implementations in this folder wrap [GitHub REST organizations](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10) endpoints. They are registered from `src/index.ts`. Success payloads follow the shared MCP shape (`request_id`, etc.); failures use the structured **error** envelope.

## Tools

- [`github_list_organizations`](README.md#github_list_organizations)

---

### `github_list_organizations`

Lists [all organizations](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-organizations) via `GET /organizations` in the order they were created. Returns **simple** organization objects (`login`, `id`, `url`, `avatar_url`, `description`, …). This is **not** the same as repositories for one org (`github_list_org_repos` in the parent [`repositories/`](../repositories/README.md) docs).

GitHub paginates with the **`since`** organization id cursor (like `github_list_public_repos` uses repository ids). Pass **`per_page`** (1–100; default **100** when omitted; GitHub’s REST default is **30**).

#### Inputs

- `since` (optional) — non-negative integer organization id cursor; omit for the first page
- `per_page` (optional, 1–100; default **100** when omitted)
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `organizations`, `since` (cursor used on the last request, or `null`), `per_page`, `pages_fetched`, `pagination`, optional `truncated`, and `request_id`. On failure: structured `error`.
