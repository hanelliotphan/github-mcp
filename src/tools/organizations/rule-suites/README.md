# Organization rule suites MCP tools

Tool implementations wrap [REST API endpoints for rule suites](https://docs.github.com/en/rest/orgs/rule-suites?apiVersion=2026-03-10) (`/orgs/{org}/rulesets/rule-suites`, …). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope.

## Tools

- [`github_list_org_rule_suites`](README.md#github_list_org_rule_suites)

---

### `github_list_org_rule_suites`

Calls [List organization rule suites](https://docs.github.com/en/rest/orgs/rule-suites?apiVersion=2026-03-10#list-organization-rule-suites) (`GET /orgs/{org}/rulesets/rule-suites`).

#### Inputs

- **`org`** (required) — organization login
- **`ref`** (optional) — ref name (no wildcards); prefix with `refs/heads/` or `refs/tags/`, or omit prefix to search all refs
- **`repository_name`** (optional) — repository name to filter on
- **`time_period`** (optional) — `hour`, `day` (default), `week`, or `month`
- **`actor_name`** (optional) — GitHub user handle; only evaluations triggered by this actor
- **`rule_suite_result`** (optional) — `pass`, `fail`, `bypass`, or `all` (default **all**)
- **`evaluate_status`** (optional) — `all` (default), `active`, or `evaluate`
- **`per_page`** (optional, 1–100, default **100**) — results per page
- **`page`** (optional, default **1**) — page number
- **`all_pages`** (optional) — when **true**, follow `next` links and aggregate results
- **`max_pages`** (optional, 1–500, default **100**) — page cap when `all_pages` is set

#### Output

On success (**200**): echoed **`org`**, **`rule_suites`** (rule suite rows: `id`, `actor_name`, `ref`, `repository_name`, `pushed_at`, `result`, `evaluation_result`, …), **`pagination`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**, **`http_status`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**, **500**).
