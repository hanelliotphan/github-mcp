# Organization issue fields MCP tools

Tool implementations wrap [REST API endpoints for organization issue fields](https://docs.github.com/en/rest/orgs/issue-fields?apiVersion=2026-03-10) (`/orgs/{org}/issue-fields`). They are registered from `src/index.ts`.

## Tools

- [`github_list_org_issue_fields`](README.md#github_list_org_issue_fields)
- [`github_create_org_issue_field`](README.md#github_create_org_issue_field)
- [`github_update_org_issue_field`](README.md#github_update_org_issue_field)
- [`github_delete_org_issue_field`](README.md#github_delete_org_issue_field)

---

### `github_list_org_issue_fields`

Calls [List issue fields for an organization](https://docs.github.com/en/rest/orgs/issue-fields?apiVersion=2026-03-10#list-issue-fields-for-an-organization) (`GET /orgs/{org}/issue-fields`).

#### Inputs

- **`org`** (required) — organization login

#### Output

On success (**200**): **`org`**, **`issue_fields`** (array of issue field objects per GitHub: **`id`**, **`node_id`**, **`name`**, **`description`**, **`data_type`**, **`visibility`**, **`options`**, **`created_at`**, **`updated_at`**, …), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**404**, etc.).

Classic personal access tokens need the **`read:org`** scope.

---

### `github_create_org_issue_field`

Calls [Create issue field for an organization](https://docs.github.com/en/rest/orgs/issue-fields?apiVersion=2026-03-10#create-issue-field-for-an-organization) (`POST /orgs/{org}/issue-fields`).

#### Inputs

- **`org`** (required) — organization login
- **`name`** (required) — field name
- **`data_type`** (required) — `text`, `date`, `single_select`, or `number`
- **`description`** (optional) — string or null
- **`visibility`** (optional) — `organization_members_only` or `all` (when the visibility feature is enabled)
- **`options`** (required when **`data_type`** is **`single_select`**) — non-empty array of `{ name, color, priority }` with optional `description`; **`color`** is one of `gray`, `blue`, `green`, `yellow`, `orange`, `red`, `pink`, `purple`; **`priority`** is an integer for ordering

#### Output

On success (**200**): **`org`**, **`issue_field`** (created field object), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**404**, **422**, etc.).

Requires **org admin**; classic tokens need **`admin:org`**.

---

### `github_update_org_issue_field`

Calls [Update issue field for an organization](https://docs.github.com/en/rest/orgs/issue-fields?apiVersion=2026-03-10#update-issue-field-for-an-organization) (`PATCH /orgs/{org}/issue-fields/{issue_field_id}`).

#### Inputs

- **`org`** (required) — organization login
- **`issue_field_id`** (required) — numeric field id (from list/create)
- At least one of **`name`**, **`description`**, **`visibility`**, **`options`**
- **`options`** (optional) — for **`single_select`** fields only; **replaces** the full option set. Each item: **`name`**, **`color`**, **`priority`**; optional **`id`** (existing option to keep/update); optional **`description`**

#### Output

On success (**200**): **`org`**, **`issue_field_id`**, **`issue_field`** (updated object), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**404**, **422**, etc.).

Requires **org admin**; classic tokens need **`admin:org`**.

---

### `github_delete_org_issue_field`

Calls [Delete issue field for an organization](https://docs.github.com/en/rest/orgs/issue-fields?apiVersion=2026-03-10#delete-issue-field-for-an-organization) (`DELETE /orgs/{org}/issue-fields/{issue_field_id}`).

#### Inputs

- **`org`** (required) — organization login
- **`issue_field_id`** (required) — numeric field id

#### Output

On success (**204** No Content): **`org`**, **`issue_field_id`**, **`http_status`**, **`request_id`**. On failure: structured **`error`** (**404**, **422**, etc.).

Requires **org admin**; classic tokens need **`admin:org`**.
