# Repository webhooks MCP tools

Tools for [GitHub REST: repository webhooks](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10).

## Tools

- [`github_list_repo_webhooks`](README.md#github_list_repo_webhooks)
- [`github_create_repo_webhook`](README.md#github_create_repo_webhook)

---

### `github_list_repo_webhooks`

Lists webhooks via [List repository webhooks](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#list-repository-webhooks) (`GET /repos/{owner}/{repo}/hooks`). Each hook includes `id`, `name`, `events`, `config`, `active`, `last_response`, etc. **`last_response`** may be `null` if there have been no deliveries within the last 30 days (per GitHub).

#### Inputs

- `owner` (required), `name` (required)
- `per_page` (optional) — 1–100; default **100** when omitted
- `page` (optional)
- `all_pages` (optional), `max_pages` (optional)

#### Output

On success: **`webhooks`**, **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.

#### Access

Classic personal access tokens need **`read:repo_hook`** or **`repo`**. Fine-grained tokens need **Administration** read access (or as required by GitHub for this endpoint).

---

### `github_create_repo_webhook`

Creates a webhook via [Create a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#create-a-repository-webhook) (`POST /repos/{owner}/{repo}/hooks`). Pass **`webhook`** with **`config.url`** (required). **`name`** must be **`web`** when set (GitHub’s only value). Optional **`events`** (GitHub defaults to **`push`** if omitted), **`active`** (default **true**), and **`config`** fields: **`content_type`** (`json` or `form`), **`secret`**, **`insecure_ssl`**.

#### Inputs

- `owner` (required), `name` (required) — repository
- **`webhook`** (required) — `config` (at least `url`), optional `name`, `events`, `active`; additional top-level properties are forwarded when supported by the API

#### Output

On success: **`http_status`** (**201**), **`webhook`** (created hook object), **`request_id`**. On failure: structured **`error`** (e.g. **403**, **404**, **422**).

#### Access

Classic tokens need **`write:repo_hook`** or **`repo`**. Fine-grained tokens need **Administration** write access (or as required by GitHub).
