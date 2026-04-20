# Organization blocking users MCP tools

Tool implementations wrap [REST API endpoints for blocking users](https://docs.github.com/en/rest/orgs/blocking?apiVersion=2026-03-10) (`/orgs/{org}/blocks` and `/orgs/{org}/blocks/{username}`). They are registered from `src/index.ts`.

Classic tokens need **`admin:org`** for these calls; without it GitHub often returns **404** (see GitHub’s “About blocking users” note). Success payloads follow the shared MCP shape; failures use the structured **error** envelope.

## Tools

- [`github_list_org_blocked_users`](README.md#github_list_org_blocked_users)
- [`github_check_org_blocked_user`](README.md#github_check_org_blocked_user)
- [`github_block_org_user`](README.md#github_block_org_user)
- [`github_unblock_org_user`](README.md#github_unblock_org_user)

---

### `github_list_org_blocked_users`

Calls [List users blocked by an organization](https://docs.github.com/en/rest/orgs/blocking?apiVersion=2026-03-10#list-users-blocked-by-an-organization) (`GET /orgs/{org}/blocks`).

#### Inputs

- **`org`** (required) — organization login
- **`per_page`** (optional) — **1–100**; default **100** when omitted (MCP default; GitHub REST default is **30**)
- **`page`** (optional) — page number (default **1**)
- **`all_pages`** (optional) — follow `next` links up to **`max_pages`** (default **100**)
- **`max_pages`** (optional) — **1–500**

#### Output

On success (**200**): **`org`**, **`blocked_users`** (simple user objects), **`http_status`**, **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**. On failure: structured **`error`**.

---

### `github_check_org_blocked_user`

Calls [Check if a user is blocked by an organization](https://docs.github.com/en/rest/orgs/blocking?apiVersion=2026-03-10#check-if-a-user-is-blocked-by-an-organization) (`GET /orgs/{org}/blocks/{username}`).

#### Inputs

- **`org`** (required) — organization login
- **`username`** (required) — user login to check

#### Output

On **204**: **`blocked: true`**. On **404**: **`blocked: false`** with an explanatory **`message`** (GitHub also uses **404** without **`admin:org`**, so interpret cautiously). Other errors: structured **`error`**.

---

### `github_block_org_user`

Calls [Block a user from an organization](https://docs.github.com/en/rest/orgs/blocking?apiVersion=2026-03-10#block-a-user-from-an-organization) (`PUT /orgs/{org}/blocks/{username}`).

#### Inputs

- **`org`** (required) — organization login
- **`username`** (required) — user login to block

#### Output

On success (**204**): **`org`**, **`username`**, **`http_status`**, **`request_id`**. **422** and other failures: structured **`error`**.

---

### `github_unblock_org_user`

Calls [Unblock a user from an organization](https://docs.github.com/en/rest/orgs/blocking?apiVersion=2026-03-10#unblock-a-user-from-an-organization) (`DELETE /orgs/{org}/blocks/{username}`).

#### Inputs

- **`org`** (required) — organization login
- **`username`** (required) — user login to unblock

#### Output

On success (**204**): **`org`**, **`username`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.
