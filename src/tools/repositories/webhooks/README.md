# Repository webhooks MCP tools

Tools for [GitHub REST: repository webhooks](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10).

## Tools

- [`github_list_repo_webhooks`](README.md#github_list_repo_webhooks)
- [`github_list_repo_webhook_deliveries`](README.md#github_list_repo_webhook_deliveries)
- [`github_get_repo_webhook_delivery`](README.md#github_get_repo_webhook_delivery)
- [`github_redeliver_repo_webhook_delivery`](README.md#github_redeliver_repo_webhook_delivery)
- [`github_get_repo_webhook`](README.md#github_get_repo_webhook)
- [`github_get_repo_webhook_config`](README.md#github_get_repo_webhook_config)
- [`github_create_repo_webhook`](README.md#github_create_repo_webhook)
- [`github_update_repo_webhook_config`](README.md#github_update_repo_webhook_config)
- [`github_update_repo_webhook`](README.md#github_update_repo_webhook)
- [`github_delete_repo_webhook`](README.md#github_delete_repo_webhook)

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

### `github_list_repo_webhook_deliveries`

Lists delivery attempts via [List deliveries for a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#list-deliveries-for-a-repository-webhook) (`GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries`). Each row is a **simple webhook delivery** (e.g. **`id`**, **`guid`**, **`delivered_at`**, **`status_code`**, **`event`**). For the **full** delivery (request/response bodies when present), call **`github_get_repo_webhook_delivery`** with **`delivery_id`** = **`id`**.

#### Inputs

- `owner` (required), `name` (required), **`hook_id`** (required)
- `per_page` (optional) — 1–100; default **100** when omitted (GitHub’s REST default is **30**)
- `cursor` (optional) — for the next page; use **`pagination.next.cursor`** from a prior response (or from `Link` headers)
- `status` (optional) — **`success`** or **`failure`** (filters by HTTP status code range per GitHub)
- `all_pages` (optional), `max_pages` (optional) — follow `rel="next"` until done or cap

#### Output

On success: **`deliveries`**, **`pagination`** (cursor-style `next` / `prev` / …), **`request_id`**, echoed **`hook_id`**, **`cursor`** (input used for this request’s first page), **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`** (e.g. **400**, **422**).

#### Access

Same as list webhooks: classic **`read:repo_hook`** or **`repo`**; fine-grained **Administration** read (or as GitHub requires).

---

### `github_get_repo_webhook_delivery`

Fetches one delivery via [Get a delivery for a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#get-a-delivery-for-a-repository-webhook) (`GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}`). Returns the **full** `hook-delivery` object (including **`request`** / **`response`** payloads when GitHub includes them).

#### Inputs

- `owner` (required), `name` (required), **`hook_id`** (required), **`delivery_id`** (required) — use **`delivery_id`** from `github_list_repo_webhook_deliveries` (field **`id`**)

#### Output

On success: **`http_status`** (**200**), echoed **`hook_id`** and **`delivery_id`**, **`delivery`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**).

#### Access

Same as list webhooks: classic **`read:repo_hook`** or **`repo`**; fine-grained **Administration** read (or as GitHub requires).

---

### `github_redeliver_repo_webhook_delivery`

Queues a redelivery via [Redeliver a delivery for a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#redeliver-a-delivery-for-a-repository-webhook) (`POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts`). GitHub typically responds with **202** Accepted.

#### Inputs

- `owner` (required), `name` (required), **`hook_id`** (required), **`delivery_id`** (required)

#### Output

On success: **`http_status`** (typically **202**), echoed **`hook_id`** and **`delivery_id`**, **`request_id`**. On failure: structured **`error`** (e.g. **400**, **422**).

#### Access

Classic **`write:repo_hook`** or **`repo`**; fine-grained **Administration** write (or as GitHub requires).

---

### `github_get_repo_webhook`

Fetches one webhook via [Get a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#get-a-repository-webhook) (`GET /repos/{owner}/{repo}/hooks/{hook_id}`). Use **`hook_id`** from `github_list_repo_webhooks` (field **`id`**) or from the **`X-GitHub-Hook-ID`** header on a delivery.

#### Inputs

- `owner` (required), `name` (required), **`hook_id`** (required)

#### Output

On success: **`http_status`** (**200**), echoed **`hook_id`**, **`webhook`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**).

#### Access

Same as list: classic **`read:repo_hook`** or **`repo`**; fine-grained **Administration** read (or as GitHub requires).

---

### `github_get_repo_webhook_config`

Returns only the webhook **config** via [Get a webhook configuration for a repository](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#get-a-webhook-configuration-for-a-repository) (`GET /repos/{owner}/{repo}/hooks/{hook_id}/config`): typically **`url`**, **`content_type`**, **`secret`**, **`insecure_ssl`**. For **`events`**, **`active`**, and delivery metadata, use **`github_get_repo_webhook`**.

#### Inputs

- `owner` (required), `name` (required), **`hook_id`** (required)

#### Output

On success: **`http_status`** (**200**), echoed **`hook_id`**, **`config`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Classic **`read:repo_hook`** or **`repo`**; fine-grained **Administration** read (or as GitHub requires).

---

### `github_update_repo_webhook_config`

Patches only the webhook **config** via [Update a webhook configuration for a repository](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#update-a-webhook-configuration-for-a-repository) (`PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config`). Pass **`config`** with at least one of **`url`**, **`content_type`**, **`secret`**, **`insecure_ssl`**. To change **`events`** or **`active`**, use **`github_update_repo_webhook`**.

#### Inputs

- `owner` (required), `name` (required), **`hook_id`** (required)
- **`config`** (required) — non-empty object of config fields to set

#### Output

On success: **`http_status`** (**200**), echoed **`hook_id`**, **`config`** (updated object), **`request_id`**. On failure: structured **`error`**.

#### Access

Classic **`write:repo_hook`** or **`repo`**; fine-grained **Administration** write (or as GitHub requires).

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

---

### `github_update_repo_webhook`

Updates a webhook via [Update a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#update-a-repository-webhook) (`PATCH /repos/{owner}/{repo}/hooks/{hook_id}`). Pass **`webhook`** with at least one field: **`config`** (partial), **`events`** (replaces the entire event list), **`add_events`**, **`remove_events`**, **`active`**. If a **`secret`** was previously configured, send the same secret, a new secret, or GitHub removes it. Extra keys are forwarded when supported.

#### Inputs

- `owner` (required), `name` (required), **`hook_id`** (required)
- **`webhook`** (required) — non-empty patch object

#### Output

On success: **`http_status`** (**200**), echoed **`hook_id`**, **`webhook`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**, **422**).

#### Access

Classic **`write:repo_hook`** or **`repo`**; fine-grained **Administration** write (or as GitHub requires).

---

### `github_delete_repo_webhook`

Deletes a webhook via [Delete a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#delete-a-repository-webhook) (`DELETE /repos/{owner}/{repo}/hooks/{hook_id}`). The authenticated user must be a **repository owner** or have **admin** access.

#### Inputs

- `owner` (required), `name` (required), **`hook_id`** (required)

#### Output

On success: **`http_status`** (**204**), echoed **`owner`**, **`repo`**, **`full_name`**, **`hook_id`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**).

#### Access

Classic **`write:repo_hook`** or **`repo`**; fine-grained **Administration** write (or as GitHub requires).
