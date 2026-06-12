# Organization webhooks MCP tools

Tools for [GitHub REST: organization webhooks](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10).

## Tools

- [`github_list_org_webhooks`](README.md#github_list_org_webhooks)
- [`github_create_org_webhook`](README.md#github_create_org_webhook)

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

---

### `github_create_org_webhook`

Creates a webhook via [Create an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#create-an-organization-webhook) (`POST /orgs/{org}/hooks`). Creates a hook that posts payloads in JSON format when **`config.content_type`** is **`json`**.

#### Inputs

- **`org`** (required)
- **`webhook`** (required) — **`config.url`** required; optional **`name`** (must be **`web`**), **`events`**, **`active`**, **`config.content_type`**, **`config.secret`**, **`config.insecure_ssl`**, **`config.username`**, **`config.password`**

#### Output

On success (**201**): echoed **`org`**, created **`webhook`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.
