# Organization members MCP tools

Tool implementations wrap [REST API endpoints for organization members](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10) (`/orgs/{org}/...` membership and invitations). They are registered from `src/index.ts`.

## Tools

- [`github_list_org_failed_invitations`](README.md#github_list_org_failed_invitations)
- [`github_list_org_pending_invitations`](README.md#github_list_org_pending_invitations)
- [`github_list_org_invitation_teams`](README.md#github_list_org_invitation_teams)
- [`github_create_org_invitation`](README.md#github_create_org_invitation)
- [`github_cancel_org_invitation`](README.md#github_cancel_org_invitation)

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

---

### `github_list_org_pending_invitations`

Calls [List pending organization invitations](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-pending-organization-invitations) (`GET /orgs/{org}/invitations`).

#### Inputs

- **`org`** (required) — organization login
- **`per_page`** (optional, 1–100, default **100**) — page size
- **`page`** (optional, default **1**) — page number
- **`role`** (optional) — filter: `all`, `admin`, `direct_member`, `billing_manager`, `hiring_manager` (GitHub default when omitted: **all**)
- **`invitation_source`** (optional) — filter: `all`, `member`, `scim` (GitHub default when omitted: **all**)
- **`all_pages`** (optional) — follow `Link: rel="next"` until done or **`max_pages`**
- **`max_pages`** (optional, 1–500, default **100**) — cap when **`all_pages`** is true

#### Output

On success (**200**): **`org`**, **`invitations`**, **`http_status`**, **`pagination`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**, **`request_id`**. On failure: structured **`error`** (**404**, etc.).

Requires permission to list invitations (typically org owner or **`admin:org`** on classic PATs).

---

### `github_list_org_invitation_teams`

Calls [List organization invitation teams](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-organization-invitation-teams) (`GET /orgs/{org}/invitations/{invitation_id}/teams`).

#### Inputs

- **`org`** (required) — organization login
- **`invitation_id`** (required) — numeric invitation id (from **`github_list_org_pending_invitations`** or **`github_create_org_invitation`**)
- **`per_page`** (optional, 1–100, default **100**) — page size
- **`page`** (optional, default **1**) — page number
- **`all_pages`** (optional) — follow `Link: rel="next"` until done or **`max_pages`**
- **`max_pages`** (optional, 1–500, default **100**) — cap when **`all_pages`** is true

#### Output

On success (**200**): **`org`**, **`invitation_id`**, **`teams`**, **`http_status`**, **`pagination`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**, **`request_id`**. On failure: **`error`** (**404**, etc.).

Requires permission to see org invitations (typically org owner or **`admin:org`** on classic PATs).

---

### `github_create_org_invitation`

Calls [Create an organization invitation](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#create-an-organization-invitation) (`POST /orgs/{org}/invitations`).

#### Inputs

- **`org`** (required) — organization login
- **`invitee_id`** (optional) — GitHub user id of the person to invite (omit if using **`email`**)
- **`email`** (optional) — email address to invite (omit if using **`invitee_id`**); provide **exactly one** of these
- **`role`** (optional) — `direct_member` (GitHub default when omitted), `admin`, `billing_manager`, or **`reinstate`**
- **`team_ids`** (optional) — array of numeric team ids to add the member to

#### Output

On success (**201**): **`org`**, **`invitation`** (id, login, email, role, inviter, …), **`http_status`**, **`request_id`**. On failure: **`error`** (**404**, **422**, etc.).

Requires **organization owner**. Triggers notifications; respect invitation rate limits.

---

### `github_cancel_org_invitation`

Calls [Cancel an organization invitation](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#cancel-an-organization-invitation) (`DELETE /orgs/{org}/invitations/{invitation_id}`).

#### Inputs

- **`org`** (required) — organization login
- **`invitation_id`** (required) — numeric id of the pending invitation (from **`github_list_org_pending_invitations`**)

#### Output

On success (**204**): **`org`**, **`invitation_id`**, **`http_status`**, **`request_id`**. On failure: **`error`** (**404**, **422**, etc.).

Requires **organization owner**. Triggers notifications.
