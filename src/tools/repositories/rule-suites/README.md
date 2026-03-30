# Rulesets — evaluation history MCP tools

GitHub’s product surface is **rulesets** (branch/repo rules). This folder implements tools against the **ruleset evaluation** API (`…/rulesets/rule-suites` in REST — GitHub still names that resource “rule suites”). It does **not** list ruleset definitions; for that, use the repo rulesets list API separately.

Tool implementations wrap [GitHub REST: repository rule suites](https://docs.github.com/en/rest/repos/rule-suites?apiVersion=2026-03-10) (evaluation history). They are registered from `src/index.ts`. Responses use the same shared shape as other repository tools: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope (see the parent [../README.md](../README.md) for general conventions).

**List tools with pagination** return `pages_fetched` and echo the effective cursor (`page` / `per_page`, plus filter fields where applicable). Set **`all_pages`: `true`** to follow GitHub `Link: rel="next"` automatically up to **`max_pages`** (default **100**, max **500**). If **`truncated`** is `true`, raise `max_pages` or call again using **`pagination.next`**. Shared helpers live in `src/utils/github-paginate-all.ts`.

## Tools

- [`github_list_repo_rule_suites`](README.md#github_list_repo_rule_suites)
- [`github_get_repo_rule_suite`](README.md#github_get_repo_rule_suite)

---

### `github_get_repo_rule_suite`

Fetches one evaluation suite by ID via [Get a repository rule suite](https://docs.github.com/en/rest/repos/rule-suites?apiVersion=2026-03-10#get-a-repository-rule-suite) (`GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}`). The response includes **`rule_evaluations`** (per-rule results). Use **`id`** from `github_list_repo_rule_suites` as **`rule_suite_id`**.

#### Inputs

- `owner` (required), `name` (required)
- `rule_suite_id` (required) — integer ID of the suite

#### Output

On success: **`rule_suite`** (summary fields plus **`rule_evaluations`**), **`request_id`**. On failure: structured **`error`**.

---

### `github_list_repo_rule_suites`

Lists **ruleset evaluation** history for a repository via [List repository rule suites](https://docs.github.com/en/rest/repos/rule-suites?apiVersion=2026-03-10#list-repository-rule-suites) (`GET /repos/{owner}/{repo}/rulesets/rule-suites`). Requires access to view **ruleset** insights for the repository.

#### Inputs

- `owner` (required), `name` (required)
- `ref` (optional) — limit to evaluations for this ref (branch, tag, or full ref prefix)
- `time_period` (optional) — `hour` \| `day` \| `week` \| `month`; default **`day`**
- `actor_name` (optional) — filter by GitHub login that triggered the evaluation
- `rule_suite_result` (optional) — `pass` \| `fail` \| `bypass` \| `all`; default **`all`**
- `per_page` (optional) — 1–100; default **100** when omitted (MCP default)
- `page` (optional)
- `all_pages` (optional), `max_pages` (optional) — same behavior as other paginated list tools

#### Output

On success: **`rule_suites`** (evaluation rows; REST field name), echoed filters (**`time_period`**, **`rule_suite_result`**, optional **`ref`** / **`actor_name`**), **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.
