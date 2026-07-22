# Billing MCP tools

Tool implementations wrap [REST API endpoints for billing](https://docs.github.com/en/rest/billing/billing?apiVersion=2026-03-10) under **Billing**. They are registered from `src/index.ts`.

Product-specific Actions/Packages/shared-storage billing endpoints have been retired; use [Billing usage](../usage/README.md) instead.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_get_org_advanced_security_active_committers` | `GET /orgs/{org}/settings/billing/advanced-security` | Org admin / billing manager; optional `advanced_security_product`; page Link pagination |

### `github_get_org_advanced_security_active_committers`

Returns Advanced Security seat and committer breakdown via [Get GitHub Advanced Security active committers for an organization](https://docs.github.com/en/rest/billing/billing?apiVersion=2026-03-10#get-github-advanced-security-active-committers-for-an-organization).

#### Inputs

- **`org`** (required)
- **`advanced_security_product`** (optional) — `code_security` or `secret_protection`
- **`per_page`**, **`page`**, **`all_pages`**, **`max_pages`** (optional)

#### Output

On success (**200**): **`billing`** (totals + **`repositories`**), **`pagination`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Organization **admin** or **billing manager**.
