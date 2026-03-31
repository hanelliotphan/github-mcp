# Repository rules MCP tools

This folder implements tools for [GitHub REST: repository rules](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10): **branch-level active rules**, **listing, getting, creating, updating, and deleting** repository rulesets, **ruleset version history** (audit of ruleset changes), and related reads. **Ruleset evaluation / rule insight runs** (rule suites) live under [`rule-suites/`](../rule-suites/README.md)—that is separate from **ruleset history**.

Tools are registered from `src/index.ts`. Responses follow shared conventions: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope (see the parent [../README.md](../README.md)).

**Pagination:** set **`per_page`** (1–100, default **100** when omitted) and **`page`**, or use **`all_pages`: `true`** with optional **`max_pages`** (default **100**, max **500**) to follow `Link: rel="next"`. If **`truncated`** is `true`, continue with **`pagination.next`** or raise **`max_pages`**. Helpers live in `src/utils/github-paginate-all.ts`.

## Tools

- [`github_get_repo_branch_rules`](README.md#github_get_repo_branch_rules)
- [`github_list_repo_rulesets`](README.md#github_list_repo_rulesets)
- [`github_get_repo_ruleset`](README.md#github_get_repo_ruleset)
- [`github_get_repo_ruleset_history`](README.md#github_get_repo_ruleset_history)
- [`github_create_repo_ruleset`](README.md#github_create_repo_ruleset)
- [`github_update_repo_ruleset`](README.md#github_update_repo_ruleset)
- [`github_delete_repo_ruleset`](README.md#github_delete_repo_ruleset)

---

### `github_get_repo_branch_rules`

Returns active rules that would apply to a branch via [Get rules for a branch](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#get-rules-for-a-branch) (`GET /repos/{owner}/{repo}/rules/branches/{branch}`). The branch **does not need to exist**. Only rules from rulesets with **active** enforcement are included (not `evaluate` or `disabled`). Rules may originate from the repository or a parent organization or enterprise.

#### Inputs

- `owner` (required), `name` (required) — repository
- `branch` (required) — branch name (no `*` or `?`; slashes allowed, e.g. `feature/foo`)
- `per_page` (optional) — 1–100; default **100** when omitted
- `page` (optional)
- `all_pages` (optional), `max_pages` (optional)

#### Output

On success: **`branch`**, **`rules`** (array of rule objects; shape depends on each rule’s `type`), **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.

---

### `github_list_repo_rulesets`

Lists **rulesets** for the repository via [Get all repository rulesets](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#get-all-repository-rulesets) (`GET /repos/{owner}/{repo}/rulesets`). Responses include ruleset metadata, `conditions`, `rules`, etc. The **`bypass_actors`** field is only returned when the authenticated user has **write** access to that ruleset ([GitHub note](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#get-a-repository-ruleset)).

#### Inputs

- `owner` (required), `name` (required)
- `includes_parents` (optional) — when **`true`** (default if omitted, matching the API), include rulesets from parent org/enterprise that apply to this repo; set **`false`** to exclude them
- `targets` (optional) — comma-separated filter, e.g. `branch`, `tag`, `push`
- `per_page` (optional) — 1–100; default **100** when omitted
- `page` (optional)
- `all_pages` (optional), `max_pages` (optional)

#### Output

On success: **`rulesets`**, echoed **`includes_parents`** (effective value), optional **`targets`**, **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.

---

### `github_get_repo_ruleset`

Fetches one ruleset by ID via [Get a repository ruleset](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#get-a-repository-ruleset) (`GET /repos/{owner}/{repo}/rulesets/{ruleset_id}`). Use **`id`** from `github_list_repo_rulesets` as **`ruleset_id`**.

#### Inputs

- `owner` (required), `name` (required)
- `ruleset_id` (required) — integer ID
- `includes_parents` (optional) — **`true`** when omitted (API default); set **`false`** to exclude parent org/enterprise context

#### Output

On success: **`http_status`** (**200**), **`ruleset`**, echoed **`includes_parents`**, **`request_id`**. On failure: structured **`error`**.

---

### `github_get_repo_ruleset_history`

Lists **version history** for one ruleset via [Get repository ruleset history](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#get-repository-ruleset-history) (`GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history`). Each row includes **`version_id`**, **`actor`** (who changed it), and **`updated_at`**.

#### Inputs

- `owner` (required), `name` (required), **`ruleset_id`** (required)
- `per_page` (optional) — 1–100; default **100** when omitted
- `page` (optional)
- `all_pages` (optional), `max_pages` (optional)

#### Output

On success: echoed **`ruleset_id`**, **`versions`** (array), **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.

---

### `github_create_repo_ruleset`

Creates a ruleset via [Create a repository ruleset](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#create-a-repository-ruleset) (`POST /repos/{owner}/{repo}/rulesets`). Requires permission to manage repository rules (typically **Admin** on the repo).

#### Inputs

- `owner` (required), `name` (required) — repository
- **`ruleset`** (required) — object with:
  - **`name`** (required), **`enforcement`** (required): `disabled` \| `active` \| `evaluate`
  - **`target`** (optional): `branch` \| `tag` \| `push` (GitHub default `branch`)
  - **`bypass_actors`**, **`conditions`**, **`rules`** (optional) — same shapes as the GitHub API; additional properties are allowed on **`ruleset`** for forward compatibility

#### Output

On success: **`http_status`** (**201**), **`ruleset`** (created object), **`request_id`**. On failure: structured **`error`** (including validation **422** from GitHub).

---

### `github_update_repo_ruleset`

Updates a ruleset via [Update a repository ruleset](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#update-a-repository-ruleset) (`PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}`). Send at least one field in **`ruleset`** (same shapes as create; all keys optional individually, but the body must not be empty). Requires permission to manage repository rules.

#### Inputs

- `owner` (required), `name` (required), **`ruleset_id`** (required)
- **`ruleset`** (required) — partial update: any of `name`, `enforcement`, `target`, `bypass_actors`, `conditions`, `rules`, plus extra properties allowed via passthrough

#### Output

On success: **`http_status`** (**200**), **`ruleset`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**, **422**).

---

### `github_delete_repo_ruleset`

Deletes a ruleset via [Delete a repository ruleset](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#delete-a-repository-ruleset) (`DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id}`). Requires permission to manage repository rules.

#### Inputs

- `owner` (required), `name` (required), **`ruleset_id`** (required)

#### Output

On success: **`http_status`** (**204**), echoed **`owner`**, **`repo`**, **`full_name`**, **`ruleset_id`**, **`request_id`**. On failure: structured **`error`** (e.g. **404** if the ruleset or repo is missing).
