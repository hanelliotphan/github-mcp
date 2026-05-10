# Organization members MCP tools

Tool implementations wrap [REST API endpoints for organization members](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10) (`/orgs/{org}/...` membership and invitations). They are registered from `src/index.ts`.

## Tools

- [`github_list_org_failed_invitations`](README.md#github_list_org_failed_invitations)

---

### `github_list_org_failed_invitations`

Calls [List failed organization invitations](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-failed-organization-invitations) (`GET /orgs/{org}/failed_invitations`).

#### Inputs

- **`org`** (required) — organization login
- **`per_page`** (optional, 1–100, default **100**) — page size
- **`page`** (optional, default **1**) — page number
- **`all_pages`** (optional) — follow `Link: rel="next"` until done or **`max_pages`**
- **`max_pages`** (optional, 1–500, default **100**) — cap when **`all_pages`** is true

#### Output

On success (**200**): **`org`**, **`invitations`** (each includes **`failed_at`**, **`failed_reason`**, and other invitation fields per GitHub), **`http_status`**, **`pagination`** (from `Link` header), **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**, **`request_id`**. On failure: structured **`error`** (**404**, etc.).

Requires permission to read failed invitations (typically org owner or **`admin:org`** on classic PATs).
