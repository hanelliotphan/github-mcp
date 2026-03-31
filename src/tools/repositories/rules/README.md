# Repository rules MCP tools

This folder implements tools for [GitHub REST: repository rules](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10): **branch-level active rules**, **ruleset definitions** for the repo, and related reads. **Ruleset evaluation history** (rule suites) lives under [`rule-suites/`](../rule-suites/README.md).

Tools are registered from `src/index.ts`. Responses follow shared conventions: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope (see the parent [../README.md](../README.md)).

**Pagination:** set **`per_page`** (1–100, default **100** when omitted) and **`page`**, or use **`all_pages`: `true`** with optional **`max_pages`** (default **100**, max **500**) to follow `Link: rel="next"`. If **`truncated`** is `true`, continue with **`pagination.next`** or raise **`max_pages`**. Helpers live in `src/utils/github-paginate-all.ts`.

## Tools

- [`github_get_repo_branch_rules`](README.md#github_get_repo_branch_rules)
- [`github_list_repo_rulesets`](README.md#github_list_repo_rulesets)

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
