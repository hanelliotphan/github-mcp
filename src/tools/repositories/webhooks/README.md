# Repository webhooks MCP tools

Tools for [GitHub REST: repository webhooks](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10).

## Tools

- [`github_list_repo_webhooks`](README.md#github_list_repo_webhooks)

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
