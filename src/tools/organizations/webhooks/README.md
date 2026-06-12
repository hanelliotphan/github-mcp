# Organization webhooks MCP tools

Tools for [GitHub REST: organization webhooks](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10).

## Tools

- [`github_list_org_webhooks`](README.md#github_list_org_webhooks)
- [`github_create_org_webhook`](README.md#github_create_org_webhook)
- [`github_get_org_webhook`](README.md#github_get_org_webhook)
- [`github_get_org_webhook_config`](README.md#github_get_org_webhook_config)
- [`github_update_org_webhook_config`](README.md#github_update_org_webhook_config)
- [`github_update_org_webhook`](README.md#github_update_org_webhook)
- [`github_list_org_webhook_deliveries`](README.md#github_list_org_webhook_deliveries)
- [`github_get_org_webhook_delivery`](README.md#github_get_org_webhook_delivery)
- [`github_redeliver_org_webhook_delivery`](README.md#github_redeliver_org_webhook_delivery)
- [`github_ping_org_webhook`](README.md#github_ping_org_webhook)
- [`github_delete_org_webhook`](README.md#github_delete_org_webhook)

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

---

### `github_get_org_webhook`

Retrieves one webhook via [Get an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#get-an-organization-webhook) (`GET /orgs/{org}/hooks/{hook_id}`). For only **`config`**, use **`github_get_org_webhook_config`**.

#### Inputs

- **`org`** (required)
- **`hook_id`** (required) — from `github_list_org_webhooks` or **`X-GitHub-Hook-ID`** on a delivery

#### Output

On success (**200**): echoed **`org`**, **`hook_id`**, **`webhook`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.

---

### `github_get_org_webhook_config`

Returns webhook **`config`** via [Get a webhook configuration for an organization](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#get-a-webhook-configuration-for-an-organization) (`GET /orgs/{org}/hooks/{hook_id}/config`). Returns **`url`**, **`content_type`**, **`secret`**, **`insecure_ssl`** — not **`events`** or **`active`** (use **`github_get_org_webhook`** for the full hook).

#### Inputs

- **`org`** (required)
- **`hook_id`** (required) — from `github_list_org_webhooks` or **`X-GitHub-Hook-ID`** on a delivery

#### Output

On success (**200**): echoed **`org`**, **`hook_id`**, **`config`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.

---

### `github_update_org_webhook_config`

Updates webhook **`config`** via [Update a webhook configuration for an organization](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#update-a-webhook-configuration-for-an-organization) (`PATCH /orgs/{org}/hooks/{hook_id}/config`). Does not change **`events`** or **`active`** (use **`github_update_org_webhook`** for those).

#### Inputs

- **`org`** (required), **`hook_id`** (required)
- **`config`** (required) — at least one of **`url`**, **`content_type`**, **`secret`**, **`insecure_ssl`**

#### Output

On success (**200**): echoed **`org`**, **`hook_id`**, updated **`config`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.

---

### `github_update_org_webhook`

Updates a webhook via [Update an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#update-an-organization-webhook) (`PATCH /orgs/{org}/hooks/{hook_id}`). Updating overwrites the secret — if one was set, resend the same or a new secret or GitHub removes it. For **`config`**-only edits, use **`github_update_org_webhook_config`**.

#### Inputs

- **`org`** (required), **`hook_id`** (required)
- **`webhook`** (required) — at least one of **`name`**, **`config`**, **`events`**, **`active`**

#### Output

On success (**200**): echoed **`org`**, **`hook_id`**, updated **`webhook`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.

---

### `github_list_org_webhook_deliveries`

Lists delivery attempts via [List deliveries for an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#list-deliveries-for-an-organization-webhook) (`GET /orgs/{org}/hooks/{hook_id}/deliveries`). Each row is a **simple webhook delivery** (e.g. **`id`**, **`guid`**, **`delivered_at`**, **`status_code`**, **`event`**). For the **full** delivery (request/response bodies when present), call **`github_get_org_webhook_delivery`** with **`delivery_id`** = **`id`**.

#### Inputs

- **`org`** (required), **`hook_id`** (required)
- **`per_page`** (optional) — 1–100; default **100** when omitted (GitHub’s REST default is **30**)
- **`cursor`** (optional) — pagination cursor from previous **`pagination.next`**
- **`status`** (optional) — **`success`** (status codes 200–399) or **`failure`** (400–599)
- **`all_pages`** (optional), **`max_pages`** (optional)

#### Output

On success (**200**): echoed **`org`**, **`hook_id`**, **`deliveries`**, **`pagination`**, **`request_id`**, **`cursor`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.

---

### `github_get_org_webhook_delivery`

Returns one delivery via [Get a webhook delivery for an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#get-a-webhook-delivery-for-an-organization-webhook) (`GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}`). Includes full **`request`** and **`response`** payloads when present.

#### Inputs

- **`org`** (required), **`hook_id`** (required), **`delivery_id`** (required) — **`delivery_id`** from **`id`** in `github_list_org_webhook_deliveries`

#### Output

On success (**200**): echoed **`org`**, **`hook_id`**, **`delivery_id`**, **`delivery`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.

---

### `github_redeliver_org_webhook_delivery`

Queues a redelivery via [Redeliver a delivery for an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#redeliver-a-delivery-for-an-organization-webhook) (`POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts`).

#### Inputs

- **`org`** (required), **`hook_id`** (required), **`delivery_id`** (required) — from `github_list_org_webhook_deliveries` or `github_get_org_webhook_delivery`

#### Output

On success (typically **202**): echoed **`org`**, **`hook_id`**, **`delivery_id`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.

---

### `github_ping_org_webhook`

Sends a ping via [Ping an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#ping-an-organization-webhook) (`POST /orgs/{org}/hooks/{hook_id}/pings`). Triggers a **`ping`** event to the configured URL.

#### Inputs

- **`org`** (required)
- **`hook_id`** (required) — from `github_list_org_webhooks` or **`X-GitHub-Hook-ID`** on a delivery

#### Output

On success (**204**): echoed **`org`**, **`hook_id`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.

---

### `github_delete_org_webhook`

Deletes a webhook via [Delete an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#delete-an-organization-webhook) (`DELETE /orgs/{org}/hooks/{hook_id}`).

#### Inputs

- **`org`** (required)
- **`hook_id`** (required) — from `github_list_org_webhooks` or **`X-GitHub-Hook-ID`** on a delivery

#### Output

On success (**204**): echoed **`org`**, **`hook_id`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization owner required; classic OAuth apps and PATs need **`admin:org_hook`** scope.
