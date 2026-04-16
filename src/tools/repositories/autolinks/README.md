# Repository autolinks MCP tools

Tool implementations in this folder wrap the [GitHub REST repository autolinks API](https://docs.github.com/en/rest/repos/autolinks?apiVersion=2026-03-10). They are registered from `src/index.ts`. Responses use the same shared shape as other repository tools: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope (see the parent [../README.md](../README.md) for general conventions).

## Tools

- [`github_list_repo_autolinks`](README.md#github_list_repo_autolinks)
- [`github_create_repo_autolink`](README.md#github_create_repo_autolink)

---

### `github_list_repo_autolinks`

Lists [all autolinks](https://docs.github.com/en/rest/repos/autolinks?apiVersion=2026-03-10#get-all-autolinks-of-a-repository) configured for a repository via `GET /repos/{owner}/{repo}/autolinks`. GitHub only exposes autolink configuration to **repository administrators**; other callers may see **403** or **404**. GitHub Apps need repository administration with read or write access. This endpoint returns the full list in one response (no `per_page` pagination).

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success: `autolinks` (each row has `id`, `key_prefix`, `url_template`, `is_alphanumeric`, `updated_at`), and `request_id`. On failure: structured `error`.

---

### `github_create_repo_autolink`

Creates [an autolink reference](https://docs.github.com/en/rest/repos/autolinks?apiVersion=2026-03-10#create-an-autolink-reference-for-a-repository) via `POST /repos/{owner}/{repo}/autolinks`. Body fields match GitHub: **`key_prefix`**, **`url_template`** (must contain the literal **`<num>`**), optional **`is_alphanumeric`** (default **true** on GitHub).

#### Inputs

- **`owner`**, **`name`** (required) — repository coordinates (same as other repo tools)
- **`key_prefix`** (required) — prefix that triggers the link
- **`url_template`** (required) — URL with **`<num>`** for the matched reference
- **`is_alphanumeric`** (optional) — widen or narrow what **`<num>`** matches

#### Output

On success: **`http_status`** (**201**), echoed **`owner`** / **`name`**, **`autolink`** (created row: `id`, `key_prefix`, `url_template`, `is_alphanumeric`, `updated_at`), **`request_id`**. On failure: structured **`error`** (including **422** for validation / abuse per GitHub).
