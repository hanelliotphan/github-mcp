# Organization issue types MCP tools

Tool implementations wrap [REST API endpoints for organization issue types](https://docs.github.com/en/rest/orgs/issue-types?apiVersion=2026-03-10) (`/orgs/{org}/issue-types`). They are registered from `src/index.ts`.

## Tools

- [`github_list_org_issue_types`](README.md#github_list_org_issue_types)
- [`github_create_org_issue_type`](README.md#github_create_org_issue_type)

---

### `github_list_org_issue_types`

Calls [List issue types for an organization](https://docs.github.com/en/rest/orgs/issue-types?apiVersion=2026-03-10#list-issue-types-for-an-organization) (`GET /orgs/{org}/issue-types`).

#### Inputs

- **`org`** (required) — organization login

#### Output

On success (**200**): **`org`**, **`issue_types`** (array of issue type objects per GitHub: **`id`**, **`node_id`**, **`name`**, **`description`**, **`color`**, **`is_enabled`**, **`created_at`**, **`updated_at`**, …), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**404**, etc.).

Classic personal access tokens need the **`read:org`** scope.

---

### `github_create_org_issue_type`

Calls [Create issue type for an organization](https://docs.github.com/en/rest/orgs/issue-types?apiVersion=2026-03-10#create-issue-type-for-an-organization) (`POST /orgs/{org}/issue-types`).

#### Inputs

- **`org`** (required) — organization login
- **`name`** (required) — issue type name
- **`is_enabled`** (required) — whether the type is enabled org-wide
- **`description`** (optional) — string or `null`
- **`color`** (optional) — `gray` | `blue` | `green` | `yellow` | `orange` | `red` | `pink` | `purple` | `null`

#### Output

On success (**200**): **`org`**, **`issue_type`** (created object), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**404**, **422**, etc.).

Requires **org admin**; classic personal access tokens need the **`admin:org`** scope.
