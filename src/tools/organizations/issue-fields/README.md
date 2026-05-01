# Organization issue fields MCP tools

Tool implementations wrap [REST API endpoints for organization issue fields](https://docs.github.com/en/rest/orgs/issue-fields?apiVersion=2026-03-10) (`/orgs/{org}/issue-fields`). They are registered from `src/index.ts`.

## Tools

- [`github_list_org_issue_fields`](README.md#github_list_org_issue_fields)

---

### `github_list_org_issue_fields`

Calls [List issue fields for an organization](https://docs.github.com/en/rest/orgs/issue-fields?apiVersion=2026-03-10#list-issue-fields-for-an-organization) (`GET /orgs/{org}/issue-fields`).

#### Inputs

- **`org`** (required) — organization login

#### Output

On success (**200**): **`org`**, **`issue_fields`** (array of issue field objects per GitHub: **`id`**, **`node_id`**, **`name`**, **`description`**, **`data_type`**, **`visibility`**, **`options`**, **`created_at`**, **`updated_at`**, …), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**404**, etc.).

Classic personal access tokens need the **`read:org`** scope.
