# Organization roles MCP tools

Tool implementations wrap [REST API endpoints for organization roles](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10) (`/orgs/{org}/organization-roles`, …). They are registered from `src/index.ts`.

The authenticated user must be an **organization administrator** (or hold the `read_organization_custom_org_role` permission for read endpoints). Classic OAuth apps and personal access tokens (classic) need **`admin:org`** scope. Success payloads follow the shared MCP shape; failures use the structured **error** envelope.

## Tools

- [`github_list_org_roles`](README.md#github_list_org_roles)
- [`github_remove_all_org_roles_for_team`](README.md#github_remove_all_org_roles_for_team)
- [`github_assign_org_role_to_team`](README.md#github_assign_org_role_to_team)
- [`github_remove_org_role_from_team`](README.md#github_remove_org_role_from_team)
- [`github_remove_all_org_roles_for_user`](README.md#github_remove_all_org_roles_for_user)

---

### `github_list_org_roles`

Calls [Get all organization roles for an organization](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#get-all-organization-roles-for-an-organization) (`GET /orgs/{org}/organization-roles`).

#### Inputs

- **`org`** (required) — organization login

#### Output

On success (**200**): **`org`**, **`total_count`**, **`roles`** (organization role objects with `id`, `name`, `description`, `base_role`, `source`, `permissions`, `organization`, `created_at`, `updated_at`), **`http_status`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**, **422**).

---

### `github_remove_all_org_roles_for_team`

Calls [Remove all organization roles for a team](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#remove-all-organization-roles-for-a-team) (`DELETE /orgs/{org}/organization-roles/teams/{team_slug}`). Requires org admin; classic tokens need **`admin:org`**.

#### Inputs

- **`org`** (required) — organization login
- **`team_slug`** (required) — slug of the team

#### Output

On success (**204**): echoed **`org`**, **`team_slug`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

---

### `github_assign_org_role_to_team`

Calls [Assign an organization role to a team](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#assign-an-organization-role-to-a-team) (`PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}`). Requires org admin; classic tokens need **`admin:org`**.

#### Inputs

- **`org`** (required) — organization login
- **`team_slug`** (required) — slug of the team
- **`role_id`** (required) — numeric id of the organization role (from **`github_list_org_roles`**)

#### Output

On success (**204**): echoed **`org`**, **`team_slug`**, **`role_id`**, **`http_status`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**, **422**).

---

### `github_remove_org_role_from_team`

Calls [Remove an organization role from a team](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#remove-an-organization-role-from-a-team) (`DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}`). Removes a **single** role; to remove **all** roles use **`github_remove_all_org_roles_for_team`**. Requires org admin; classic tokens need **`admin:org`**.

#### Inputs

- **`org`** (required) — organization login
- **`team_slug`** (required) — slug of the team
- **`role_id`** (required) — numeric id of the organization role

#### Output

On success (**204**): echoed **`org`**, **`team_slug`**, **`role_id`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

---

### `github_remove_all_org_roles_for_user`

Calls [Remove all organization roles for a user](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#remove-all-organization-roles-for-a-user) (`DELETE /orgs/{org}/organization-roles/users/{username}`). Requires org admin; classic tokens need **`admin:org`**.

#### Inputs

- **`org`** (required) — organization login
- **`username`** (required) — user login (handle)

#### Output

On success (**204**): echoed **`org`**, **`username`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.
