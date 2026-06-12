# Organization webhooks MCP tools

Tools for [GitHub REST: organization webhooks](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10).

## Tools

- [`github_list_org_webhooks`](README.md#github_list_org_webhooks)

---

### `github_list_org_webhooks`

Lists webhooks via [List organization webhooks](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#list-organization-webhooks) (`GET /orgs/{org}/hooks`). Each hook includes `id`, `name`, `events`, `config`, `active`, `url`, `ping_url`, `deliveries_url`, `created_at`, `updated_at`, `type`, etc.

#### Inputs

- **`org`** (required)
- **`per_page`** (optional) — 1–100; default **100** when omitted (GitHub’s REST default is **30**)
- **`page`** (optional)
- **`all_pages`** (optional), **`max_pages`** (optional)

#### Output

On success (**200**): echoed **`org`**, **`webhooks`**, **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.

#### Access

The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need **`admin:org_hook`** scope. OAuth apps cannot list webhooks they did not create; users cannot list webhooks created by OAuth apps.
