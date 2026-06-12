# Organization personal access tokens MCP tools

Tool implementations wrap [REST API endpoints for personal access tokens](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10) (`/orgs/{org}/personal-access-token-requests`, `/orgs/{org}/personal-access-tokens`, …). They are registered from `src/index.ts`.

> **Only GitHub Apps can use these endpoints.** A classic/fine-grained PAT or OAuth token will receive **403/404**. Success payloads follow the shared MCP shape; failures use the structured **error** envelope.

## Tools

- [`github_list_org_pat_requests`](README.md#github_list_org_pat_requests)
- [`github_review_org_pat_requests`](README.md#github_review_org_pat_requests)
- [`github_review_org_pat_request`](README.md#github_review_org_pat_request)

---

### `github_list_org_pat_requests`

Calls [List requests to access organization resources with fine-grained personal access tokens](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10#list-requests-to-access-organization-resources-with-fine-grained-personal-access-tokens) (`GET /orgs/{org}/personal-access-token-requests`). **GitHub Apps only.**

#### Inputs

- **`org`** (required) — organization login
- **`sort`** (optional) — `created_at` (only allowed value; default)
- **`direction`** (optional) — `asc` or `desc` (default **desc**)
- **`owner`** (optional) — array of owner usernames to filter by
- **`repository`** (optional) — repository name to filter by
- **`permission`** (optional) — permission to filter by
- **`last_used_before`** (optional) — ISO 8601 `YYYY-MM-DDTHH:MM:SSZ`; only tokens last used before this time
- **`last_used_after`** (optional) — ISO 8601 `YYYY-MM-DDTHH:MM:SSZ`; only tokens last used after this time
- **`token_id`** (optional) — array of token IDs to filter by
- **`per_page`** (optional, 1–100, default **100**) — results per page
- **`page`** (optional, default **1**) — page number
- **`all_pages`** (optional) — when **true**, follow `next` links and aggregate results
- **`max_pages`** (optional, 1–500, default **100**) — page cap when `all_pages` is set

#### Output

On success (**200**): echoed **`org`**, **`pat_requests`** (simple org programmatic access grant request rows: `id`, `reason`, `owner`, `repository_selection`, `permissions`, `token_id`, `token_name`, `token_expired`, …), **`pagination`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**, **`http_status`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **404**, **422**, **500**).

---

### `github_review_org_pat_requests`

Calls [Review requests to access organization resources with fine-grained personal access tokens](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10#review-requests-to-access-organization-resources-with-fine-grained-personal-access-tokens) (`POST /orgs/{org}/personal-access-token-requests`). Approves or denies **multiple** pending PAT access requests. **GitHub Apps only.**

#### Inputs

- **`org`** (required) — organization login
- **`action`** (required) — `approve` or `deny`
- **`pat_request_ids`** (optional) — 1–100 request ids (from **`github_list_org_pat_requests`**)
- **`reason`** (optional) — reason for approving/denying (max 1024 characters)

#### Output

On success (**202** Accepted; processed asynchronously): echoed **`org`**, **`action`**, **`pat_request_ids`**, **`reason`**, optional **`data`** (present when GitHub returns a 202 body), **`http_status`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **404**, **422**, **500**).

---

### `github_review_org_pat_request`

Calls [Review a request to access organization resources with a fine-grained personal access token](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10#review-a-request-to-access-organization-resources-with-a-fine-grained-personal-access-token) (`POST /orgs/{org}/personal-access-token-requests/{pat_request_id}`). Approves or denies **one** pending PAT access request. **GitHub Apps only.**

#### Inputs

- **`org`** (required) — organization login
- **`pat_request_id`** (required) — request id (from **`github_list_org_pat_requests`**)
- **`action`** (required) — `approve` or `deny`
- **`reason`** (optional) — reason for approving/denying (max 1024 characters)

#### Output

On success (**204**): echoed **`org`**, **`pat_request_id`**, **`action`**, **`reason`**, **`http_status`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **404**, **422**, **500**).
