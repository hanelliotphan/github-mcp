# Organization security managers MCP tools

Tool implementations wrap [REST API endpoints for security managers](https://docs.github.com/en/rest/orgs/security-managers?apiVersion=2026-03-10) (`/orgs/{org}/security-managers`, …). They are registered from `src/index.ts`.

> **Deprecation:** GitHub is closing down these endpoints (removal from **January 1, 2026**). Use [Organization Roles](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10) instead.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope.

## Tools

- [`github_list_org_security_manager_teams`](README.md#github_list_org_security_manager_teams)

---

### `github_list_org_security_manager_teams`

Calls [List security manager teams](https://docs.github.com/en/rest/orgs/security-managers?apiVersion=2026-03-10#list-security-manager-teams) (`GET /orgs/{org}/security-managers`).

#### Inputs

- **`org`** (required) — organization login

#### Output

On success (**200**): echoed **`org`**, **`teams`** (team simple objects: `id`, `name`, `slug`, `permission`, `description`, …), **`http_status`**, **`request_id`**. On failure: structured **`error`**.
