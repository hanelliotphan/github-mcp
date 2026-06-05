# Organization outside collaborators MCP tools

Tool implementations wrap [REST API endpoints for outside collaborators](https://docs.github.com/en/rest/orgs/outside-collaborators?apiVersion=2026-03-10) (`/orgs/{org}/outside_collaborators`, …). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope.

## Tools

- [`github_list_org_outside_collaborators`](README.md#github_list_org_outside_collaborators)

---

### `github_list_org_outside_collaborators`

Calls [List outside collaborators for an organization](https://docs.github.com/en/rest/orgs/outside-collaborators?apiVersion=2026-03-10#list-outside-collaborators-for-an-organization) (`GET /orgs/{org}/outside_collaborators`).

#### Inputs

- **`org`** (required) — organization login
- **`filter`** (optional) — `all` (default), `2fa_disabled` (only collaborators without 2FA), or `2fa_insecure` (only collaborators with insecure 2FA methods)
- **`per_page`** (optional, 1–100, default **100**) — results per page
- **`page`** (optional, default **1**) — page number
- **`all_pages`** (optional) — when **true**, follow `next` links and aggregate results
- **`max_pages`** (optional, 1–500, default **100**) — page cap when `all_pages` is set

#### Output

On success (**200**): echoed **`org`**, **`filter`**, **`outside_collaborators`** (simple user objects), **`pagination`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.
