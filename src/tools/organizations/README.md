# Organization MCP tools

Implementations in this folder wrap [GitHub REST organizations](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10) endpoints. They are registered from `src/index.ts`. Success payloads follow the shared MCP shape (`request_id`, etc.); failures use the structured **error** envelope.

## Tools

- [`github_list_organizations`](README.md#github_list_organizations)
- [`github_get_org`](README.md#github_get_org)
- [`github_update_org`](README.md#github_update_org)

---

### `github_update_org`

Updates an organization via [Update an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#update-an-organization) (`PATCH /orgs/{org}`). Send a non-empty **`patch`** object; only include keys you want to change. Validated keys include **`billing_email`**, **`company`**, **`email`**, **`twitter_username`**, **`location`**, **`name`**, **`description`** (max 160 chars, nullable), **`blog`**, project flags, **`default_repository_permission`**, member repository-creation and Pages settings, **`web_commit_signoff_required`**, deploy keys flag, and deprecated “new repository” security toggles (GitHub recommends code security configurations instead). Additional properties are forwarded when the API accepts them.

#### Inputs

- **`org`** (required) — organization login
- **`patch`** (required) — non-empty object of fields to set

#### Output

On success: **`http_status`** (**200**), echoed **`org`**, updated **`organization`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **409**, **422**).

---

### `github_get_org`

Fetches one organization via [Get an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#get-an-organization) (`GET /orgs/{org}`). The JSON includes at least public profile fields; **sensitive or owner-only fields** depend on the token (classic: e.g. **`admin:org`** for full org details per GitHub; fine-grained: org permissions as documented).

#### Inputs

- **`org`** (required) — organization login (not case sensitive)

#### Output

On success: **`http_status`** (**200**), echoed **`org`**, **`organization`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**).

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
