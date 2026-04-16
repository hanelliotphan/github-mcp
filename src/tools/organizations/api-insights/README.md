# Organization API Insights MCP tools

Wrappers for [REST API endpoints for API Insights](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10) (`/orgs/{org}/insights/api/...`). These endpoints require **API Insights** on the organization (GitHub Enterprise Cloud and appropriate access). Implementations live under `src/tools/organizations/api-insights/` and are registered from `src/index.ts`.

## Tools

- [`github_get_route_stats_by_actor`](README.md#github_get_route_stats_by_actor)
- [`github_get_subject_stats`](README.md#github_get_subject_stats)

---

### `github_get_route_stats_by_actor`

See tool description in [`github-get-route-stats-by-actor.ts`](github-get-route-stats-by-actor.ts) and [Get route stats by actor](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-route-stats-by-actor).

---

### `github_get_subject_stats`

Calls [Get subject stats](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-subject-stats) (`GET /orgs/{org}/insights/api/subject-stats`). Returns subjects (users and GitHub Apps) with **`subject_type`**, **`subject_name`**, **`subject_id`**, and request count fields per GitHub’s schema.

#### Inputs

- **`org`** (required) — organization login
- **`min_timestamp`** (required) — ISO 8601 lower bound (e.g. `2025-01-01T00:00:00Z`)
- **`max_timestamp`** (optional) — ISO 8601 upper bound
- **`subject_name_substring`** (optional) — case-insensitive filter on subject name
- **`direction`** (optional) — `asc` or `desc`
- **`sort`** (optional) — array of sort field names (max 20 entries)
- **`page`** (optional, default **1**), **`per_page`** (optional, 1–100; default **100** when omitted)
- **`all_pages`** (optional), **`max_pages`** (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: **`http_status`**, echoed **`org`**, **`min_timestamp`**, **`max_timestamp`** (or `null`), **`subject_stats`**, **`page`**, **`per_page`**, **`pages_fetched`**, **`pagination`**, optional **`truncated`**, **`request_id`**. On failure: structured **`error`**.
