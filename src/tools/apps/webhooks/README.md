# Apps (Webhooks) MCP tools

Tool implementations wrap [REST API endpoints for GitHub App webhooks](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10) under **Apps → Webhooks**. They are registered from `src/index.ts`.

All endpoints require authentication as a **GitHub App** using a **JWT** (not a personal access token or installation token).

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_get_app_webhook_config` | `GET /app/hook/config` | JWT; returns `url`, `content_type`, `secret`, `insecure_ssl` |
| `github_update_app_webhook_config` | `PATCH /app/hook/config` | JWT; optional `url`, `content_type`, `secret`, `insecure_ssl` (**200**) |
| `github_list_app_webhook_deliveries` | `GET /app/hook/deliveries` | JWT; **cursor** pagination (`cursor`, `all_pages`, `max_pages`) |
| `github_get_app_webhook_delivery` | `GET /app/hook/deliveries/{delivery_id}` | JWT; full delivery including request/response |
| `github_redeliver_app_webhook_delivery` | `POST /app/hook/deliveries/{delivery_id}/attempts` | JWT; typically **202** Accepted |

---

### `github_get_app_webhook_config`

Returns webhook **`config`** via [Get a webhook configuration for an app](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#get-a-webhook-configuration-for-an-app) (`GET /app/hook/config`).

#### Inputs

None (authenticated app only).

#### Output

On success (**200**): **`config`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Requires a GitHub App **JWT**.

---

### `github_update_app_webhook_config`

Updates webhook **`config`** via [Update a webhook configuration for an app](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#update-a-webhook-configuration-for-an-app) (`PATCH /app/hook/config`).

#### Inputs

- **`url`** (optional)
- **`content_type`** (optional) — **`json`** or **`form`**
- **`secret`** (optional)
- **`insecure_ssl`** (optional) — string or number (`0` / `1`)

At least one property is required.

#### Output

On success (**200**): updated **`config`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Requires a GitHub App **JWT**.

---

### `github_list_app_webhook_deliveries`

Lists delivery attempts via [List deliveries for an app webhook](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#list-deliveries-for-an-app-webhook) (`GET /app/hook/deliveries`). Each row is a **simple webhook delivery** (e.g. **`id`**, **`guid`**, **`delivered_at`**, **`status_code`**, **`event`**). For the **full** delivery (request/response bodies when present), call **`github_get_app_webhook_delivery`** with **`delivery_id`** = **`id`**.

#### Inputs

- **`per_page`** (optional) — 1–100; default **100** when omitted (GitHub’s REST default is **30**)
- **`cursor`** (optional) — pagination cursor from previous **`pagination.next`**
- **`status`** (optional) — **`success`** (status codes 200–399) or **`failure`** (400–599)
- **`all_pages`** (optional), **`max_pages`** (optional)

#### Output

On success (**200**): **`deliveries`**, **`pagination`**, **`request_id`**, **`cursor`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.

#### Access

Requires a GitHub App **JWT**.

---

### `github_get_app_webhook_delivery`

Returns one delivery via [Get a delivery for an app webhook](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#get-a-delivery-for-an-app-webhook) (`GET /app/hook/deliveries/{delivery_id}`). Includes full **`request`** and **`response`** payloads when present.

#### Inputs

- **`delivery_id`** (required) — from **`id`** in `github_list_app_webhook_deliveries`

#### Output

On success (**200**): **`delivery_id`**, **`delivery`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Requires a GitHub App **JWT**.

---

### `github_redeliver_app_webhook_delivery`

Queues a redelivery via [Redeliver a delivery for an app webhook](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#redeliver-a-delivery-for-an-app-webhook) (`POST /app/hook/deliveries/{delivery_id}/attempts`).

#### Inputs

- **`delivery_id`** (required) — from `github_list_app_webhook_deliveries` or `github_get_app_webhook_delivery`

#### Output

On success (typically **202**): **`delivery_id`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Requires a GitHub App **JWT**.
