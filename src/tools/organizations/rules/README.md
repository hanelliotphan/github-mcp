# Organization rules MCP tools

Tool implementations wrap [REST API endpoints for rules](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10) (`/orgs/{org}/rulesets`, …). Organization rulesets control how people can interact with selected branches and tags in repositories in an organization. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope.

## Tools

- [`github_list_org_rulesets`](README.md#github_list_org_rulesets)
- [`github_create_org_ruleset`](README.md#github_create_org_ruleset)
- [`github_get_org_ruleset`](README.md#github_get_org_ruleset)

---

### `github_list_org_rulesets`

Calls [Get all organization repository rulesets](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#get-all-organization-repository-rulesets) (`GET /orgs/{org}/rulesets`).

#### Inputs

- **`org`** (required) — organization login
- **`targets`** (optional) — comma-separated rule targets to filter by (e.g. `branch`, `tag`, `push`)
- **`per_page`** (optional, 1–100, default **100**) — results per page
- **`page`** (optional, default **1**) — page number
- **`all_pages`** (optional) — when **true**, follow `next` links and aggregate results
- **`max_pages`** (optional, 1–500, default **100**) — page cap when `all_pages` is set

#### Output

On success (**200**): echoed **`org`**, **`rulesets`** (repository ruleset objects: `id`, `name`, `target`, `enforcement`, `conditions`, `rules`, …), optional **`targets`**, **`pagination`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**, **`http_status`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**, **500**).

---

### `github_create_org_ruleset`

Calls [Create an organization repository ruleset](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#create-an-organization-repository-ruleset) (`POST /orgs/{org}/rulesets`).

#### Inputs

- **`org`** (required) — organization login
- **`ruleset`** (required) — ruleset body with at least **`name`** and **`enforcement`** (`disabled`, `active`, or `evaluate`); optional **`target`** (`branch`, `tag`, `push`, `repository`; default `branch` on GitHub), **`conditions`** (org conditions object), **`rules`**, **`bypass_actors`**

#### Output

On success (**201**): echoed **`org`**, **`ruleset`** (created ruleset object), **`http_status`**, **`request_id`**. On failure: structured **`error`**.

---

### `github_get_org_ruleset`

Calls [Get an organization repository ruleset](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#get-an-organization-repository-ruleset) (`GET /orgs/{org}/rulesets/{ruleset_id}`).

#### Inputs

- **`org`** (required) — organization login
- **`ruleset_id`** (required) — ruleset id (from **`github_list_org_rulesets`**)

#### Output

On success (**200**): echoed **`org`**, **`ruleset_id`**, **`ruleset`** (full ruleset object; `bypass_actors` only when the token has write access), **`http_status`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**, **500**).
