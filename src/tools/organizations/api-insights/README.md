# Organization API Insights MCP tools

Wrappers for [REST API endpoints for API Insights](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10) (`/orgs/{org}/insights/api/...`). These endpoints require **API Insights** on the organization (GitHub Enterprise Cloud and appropriate access). Implementations live under `src/tools/organizations/api-insights/` and are registered from `src/index.ts`.

## Tools

- [`github_get_route_stats_by_actor`](README.md#github_get_route_stats_by_actor)
- [`github_get_subject_stats`](README.md#github_get_subject_stats)
- [`github_get_summary_stats`](README.md#github_get_summary_stats)
- [`github_get_summary_stats_by_actor`](README.md#github_get_summary_stats_by_actor)
- [`github_get_summary_stats_by_user`](README.md#github_get_summary_stats_by_user)
- [`github_get_time_stats`](README.md#github_get_time_stats)
- [`github_get_time_stats_by_actor`](README.md#github_get_time_stats_by_actor)
- [`github_get_time_stats_by_user`](README.md#github_get_time_stats_by_user)

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

---

### `github_get_summary_stats`

Calls [Get summary stats](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-summary-stats) (`GET /orgs/{org}/insights/api/summary-stats`). Returns a single object with organization-wide totals (per GitHub, at least **`total_request_count`** and **`rate_limited_request_count`**). No `page` / `per_page` on this endpoint.

#### Inputs

- **`org`** (required) — organization login
- **`min_timestamp`** (required) — ISO 8601 lower bound
- **`max_timestamp`** (optional) — ISO 8601 upper bound

#### Output

On success: **`http_status`**, echoed **`org`**, **`min_timestamp`**, **`max_timestamp`** (or `null`), **`summary_stats`** (object), **`request_id`**. On failure: structured **`error`**.

---

### `github_get_summary_stats_by_actor`

Calls [Get summary stats by actor](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-summary-stats-by-actor) (`GET /orgs/{org}/insights/api/summary-stats/{actor_type}/{actor_id}`). Response body matches org-wide [Get summary stats](#github_get_summary_stats).

#### Inputs

- **`org`** (required) — organization login
- **`actor_type`** (required) — `installation`, `classic_pat`, `fine_grained_pat`, `oauth_app`, or `github_app_user_to_server`
- **`actor_id`** (required) — numeric actor id (e.g. installation id when **`actor_type`** is **`installation`**)
- **`min_timestamp`** (required) — ISO 8601 lower bound
- **`max_timestamp`** (optional) — ISO 8601 upper bound

#### Output

On success: **`http_status`**, echoed **`org`**, **`actor_type`**, **`actor_id`**, **`min_timestamp`**, **`max_timestamp`** (or `null`), **`summary_stats`**, **`request_id`**. On failure: structured **`error`**.

---

### `github_get_summary_stats_by_user`

Calls [Get summary stats by user](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-summary-stats-by-user) (`GET /orgs/{org}/insights/api/summary-stats/users/{user_id}`). Response body matches org-wide [Get summary stats](#github_get_summary_stats) (`total_request_count`, `rate_limited_request_count`, …).

#### Inputs

- **`org`** (required) — organization login
- **`user_id`** (required) — numeric GitHub user id (string or positive integer; echoed back as a string)
- **`min_timestamp`** (required) — ISO 8601 lower bound
- **`max_timestamp`** (optional) — ISO 8601 upper bound

#### Output

On success: **`http_status`**, echoed **`org`**, **`user_id`**, **`min_timestamp`**, **`max_timestamp`** (or `null`), **`summary_stats`**, **`request_id`**. On failure: structured **`error`**.

---

### `github_get_time_stats`

Calls [Get time stats](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-time-stats) (`GET /orgs/{org}/insights/api/time-stats`). Returns an array of time buckets with **`timestamp`**, **`total_request_count`**, **`rate_limited_request_count`** per GitHub’s schema.

#### Inputs

- **`org`** (required) — organization login
- **`min_timestamp`** (required) — ISO 8601 lower bound
- **`timestamp_increment`** (required) — bucket size (e.g. **`5m`**, **`10m`**, **`1h`**)
- **`max_timestamp`** (optional) — ISO 8601 upper bound

#### Output

On success: **`http_status`**, echoed **`org`**, **`min_timestamp`**, **`max_timestamp`** (or `null`), **`timestamp_increment`**, **`time_stats`** (array), **`request_id`**. On failure: structured **`error`**.

---

### `github_get_time_stats_by_actor`

Calls [Get time stats by actor](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-time-stats-by-actor) (`GET /orgs/{org}/insights/api/time-stats/{actor_type}/{actor_id}`). Response rows match org-wide [Get time stats](#github_get_time_stats).

#### Inputs

- **`org`** (required) — organization login
- **`actor_type`** (required) — `installation`, `classic_pat`, `fine_grained_pat`, `oauth_app`, or `github_app_user_to_server`
- **`actor_id`** (required) — numeric actor id (e.g. installation id when **`actor_type`** is **`installation`**)
- **`min_timestamp`** (required) — ISO 8601 lower bound
- **`timestamp_increment`** (required) — bucket size (e.g. **`5m`**, **`10m`**, **`1h`**)
- **`max_timestamp`** (optional) — ISO 8601 upper bound

#### Output

On success: **`http_status`**, echoed **`org`**, **`actor_type`**, **`actor_id`**, **`min_timestamp`**, **`max_timestamp`** (or `null`), **`timestamp_increment`**, **`time_stats`** (array), **`request_id`**. On failure: structured **`error`**.

---

### `github_get_time_stats_by_user`

Calls [Get time stats by user](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-time-stats-by-user) (`GET /orgs/{org}/insights/api/time-stats/users/{user_id}`). Response rows match org-wide [Get time stats](#github_get_time_stats).

#### Inputs

- **`org`** (required) — organization login
- **`user_id`** (required) — numeric GitHub user id (string or positive integer; echoed back as a string)
- **`min_timestamp`** (required) — ISO 8601 lower bound
- **`timestamp_increment`** (required) — bucket size (e.g. **`5m`**, **`10m`**, **`1h`**)
- **`max_timestamp`** (optional) — ISO 8601 upper bound

#### Output

On success: **`http_status`**, echoed **`org`**, **`user_id`**, **`min_timestamp`**, **`max_timestamp`** (or `null`), **`timestamp_increment`**, **`time_stats`** (array), **`request_id`**. On failure: structured **`error`**.
