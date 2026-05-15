# Organization members MCP tools

Tool implementations wrap [REST API endpoints for organization members](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10) (`/orgs/{org}/...` membership and invitations). They are registered from `src/index.ts`.

## Tools

- [`github_list_org_failed_invitations`](README.md#github_list_org_failed_invitations)
- [`github_list_org_pending_invitations`](README.md#github_list_org_pending_invitations)
- [`github_list_org_invitation_teams`](README.md#github_list_org_invitation_teams)
- [`github_create_org_invitation`](README.md#github_create_org_invitation)
- [`github_cancel_org_invitation`](README.md#github_cancel_org_invitation)
- [`github_list_org_members`](README.md#github_list_org_members)
- [`github_list_org_public_members`](README.md#github_list_org_public_members)
- [`github_check_org_membership_for_user`](README.md#github_check_org_membership_for_user)
- [`github_remove_org_member`](README.md#github_remove_org_member)
- [`github_get_org_membership_for_user`](README.md#github_get_org_membership_for_user)
- [`github_set_org_membership_for_user`](README.md#github_set_org_membership_for_user)
- [`github_remove_org_membership_for_user`](README.md#github_remove_org_membership_for_user)

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

---

### `github_list_org_members`

Calls [List organization members](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-organization-members) (`GET /orgs/{org}/members`).

#### Inputs

- **`org`** (required) — organization login
- **`filter`** (optional) — `2fa_disabled`, `2fa_insecure`, or **`all`** (GitHub default: **all**; `2fa_*` values are **organization-owner** only)
- **`role`** (optional) — **`all`**, `admin`, or **`member`** (GitHub default: **all**)
- **`per_page`** (optional, 1–100, default **100**) — page size
- **`page`** (optional, default **1**) — page number
- **`all_pages`** (optional) — follow `Link: rel="next"` until done or **`max_pages`**
- **`max_pages`** (optional, 1–500, default **100**) — cap when **`all_pages`** is true

#### Output

On success (**200**): **`org`**, **`members`** (Simple User objects), **`http_status`**, **`pagination`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**, **`request_id`**. On failure: **`error`** (**422**, etc.).

Requires permission to list members (org member for basic list; owner for **`filter`** restrictions per GitHub).

---

### `github_list_org_public_members`

Calls [List public organization members](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-public-organization-members) (`GET /orgs/{org}/public_members`).

#### Inputs

- **`org`** (required) — organization login
- **`per_page`** (optional, 1–100, default **100**) — page size
- **`page`** (optional, default **1**) — page number
- **`all_pages`** (optional) — follow `Link: rel="next"` until done or **`max_pages`**
- **`max_pages`** (optional, 1–500, default **100**) — cap when **`all_pages`** is true

#### Output

On success (**200**): **`org`**, **`members`** (Simple User objects for **public** members only), **`http_status`**, **`pagination`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**, **`request_id`**. On failure: **`error`**.

Public endpoint shape per GitHub; no **`filter`** / **`role`** on this route.

---

### `github_check_org_membership_for_user`

Calls [Check organization membership for a user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#check-organization-membership-for-a-user) (`GET /orgs/{org}/members/{username}`). The tool uses **`redirect: manual`** so an HTTP **302** is returned in the payload instead of being followed.

#### Inputs

- **`org`** (required) — organization login
- **`username`** (required) — GitHub handle to check

#### Output

Structured **`success: true`** payload:

- **`http_status` `204`**, **`is_member`**: `true` — authenticated user is an org member and **`username`** is a member.
- **`http_status` `404`**, **`is_member`**: `false` — authenticated user is an org member and **`username`** is not a member (see GitHub for other **404** cases).
- **`http_status` `302`**, **`is_member`**: `null` — authenticated user is **not** an org member; GitHub does not disclose whether **`username`** is a member. **`location`** may be set from the **`Location`** header.

Other HTTP statuses return **`success: false`** with **`error`**.

---

### `github_remove_org_member`

Calls [Remove an organization member](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#remove-an-organization-member) (`DELETE /orgs/{org}/members/{username}`).

#### Inputs

- **`org`** (required) — organization login
- **`username`** (required) — GitHub handle to remove from the organization

#### Output

On success (**204**): **`org`**, **`username`**, **`http_status`**, **`request_id`**. On failure: **`error`** (**403**, **404**, **451**, etc.).

Requires permission to remove members (typically **organization owner**). Enterprise-team indirect membership may remain per GitHub.

---

### `github_get_org_membership_for_user`

Calls [Get organization membership for a user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#get-organization-membership-for-a-user) (`GET /orgs/{org}/memberships/{username}`).

#### Inputs

- **`org`** (required) — organization login
- **`username`** (required) — GitHub handle whose membership to fetch

#### Output

On success (**200**): **`org`**, **`username`**, **`membership`** (`state`, `role`, `user`, `organization`, `permissions`, …), **`http_status`**, **`request_id`**. On failure: **`error`** (**403**, **404**, etc.).

The authenticated user must be an **organization member** (per GitHub).

---

### `github_set_org_membership_for_user`

Calls [Set organization membership for a user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#set-organization-membership-for-a-user) (`PUT /orgs/{org}/memberships/{username}`).

#### Inputs

- **`org`** (required) — organization login
- **`username`** (required) — GitHub handle to add or update
- **`role`** (optional) — **`member`** (default when omitted, per GitHub) or **`admin`** (organization owner)

#### Output

On success (**200**): **`org`**, **`username`**, **`membership`** (same shape as GET), **`http_status`**, **`request_id`**. On failure: **`error`** (**403**, **422**, **451**, etc.).

Only **organization owners** may call this endpoint. Adding a user may leave **`state`** as **`pending`** until they accept; watch invitation rate limits per GitHub.

---

### `github_remove_org_membership_for_user`

Calls [Remove organization membership for a user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#remove-organization-membership-for-a-user) (`DELETE /orgs/{org}/memberships/{username}`).

This differs from **`github_remove_org_member`** (`DELETE /orgs/{org}/members/{username}`): the **memberships** endpoint also **cancels a pending invitation** and is the API documented for membership removal in this form.

#### Inputs

- **`org`** (required) — organization login
- **`username`** (required) — GitHub handle to remove or un-invite

#### Output

On success (**204**): **`org`**, **`username`**, **`http_status`**, **`request_id`**. On failure: **`error`** (**403**, **404**, etc.).

Requires **organization owner**. Sends email to the affected user per GitHub.
