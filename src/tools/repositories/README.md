# Repository MCP tools

TypeScript tool implementations in this folder are registered from the server entrypoint (`src/index.ts`). Each tool wraps a [GitHub REST repositories API](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10) call (or related endpoint). Responses use a shared shape: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope.

## Contents

**Repositories**

- [`github_create_personal_repo`](README.md#github_create_personal_repo)
- [`github_create_org_repo`](README.md#github_create_org_repo)
- [`github_delete_repo`](README.md#github_delete_repo)
- [`github_get_repo`](README.md#github_get_repo)
- [`github_update_repo`](README.md#github_update_repo)
- [`github_list_repo_activities`](README.md#github_list_repo_activities)
- [`github_list_repo_contributors`](README.md#github_list_repo_contributors)
- [`github_create_repo_dispatch`](README.md#github_create_repo_dispatch)
- [`github_check_immutable_releases`](README.md#github_check_immutable_releases)
- [`github_enable_immutable_releases`](README.md#github_enable_immutable_releases)
- [`github_disable_immutable_releases`](README.md#github_disable_immutable_releases)

**CODEOWNERS**

- [`github_list_codeowners_errors`](README.md#github_list_codeowners_errors)

**Dependency alerts & Dependabot security updates**

- [`github_check_dependabot_security_updates`](README.md#github_check_dependabot_security_updates)
- [`github_enable_vulnerability_alerts`](README.md#github_enable_vulnerability_alerts)
- [`github_enable_dependabot_security_updates`](README.md#github_enable_dependabot_security_updates)
- [`github_disable_dependabot_security_updates`](README.md#github_disable_dependabot_security_updates)

---

### `github_create_personal_repo`

Creates a repository under the authenticated user's personal GitHub account (not an organization).

#### Inputs

- `name` (required)
- `description` (optional)
- `private` (optional, default `false`)
- `auto_init` (optional, default `true`)
- `gitignore_template` (optional)
- `license_template` (optional)
- `dry_run` (optional, default `false`)

#### Output

Returns structured JSON with:

- success/failure status
- created repository metadata on success
- normalized error envelope on failure

### `github_create_org_repo`

Creates a repository under a GitHub **organization** (`org/name`).

#### Inputs

- `org` (required) — organization login, e.g. `acme-corp`
- `name` (required)
- `description` (optional)
- `private` (optional, default `false`)
- `auto_init` (optional, default `true`)
- `gitignore_template` (optional)
- `license_template` (optional)
- `dry_run` (optional, default `false`)

#### Output

Same shape as `github_create_personal_repo` (success payload with `repo`, or structured `error`).

### `github_delete_repo`

Deletes a repository. **Same API for personal and org repos:** `owner` is the user or organization login, `name` is the repo name (`DELETE /repos/{owner}/{repo}`).

#### Inputs

- `owner` (required) — user or organization login
- `name` (required) — repository name (not `full_name`)
- `dry_run` (optional, default `false`) — if `true`, only returns a preview; no deletion
- `confirm` (optional, default `false`) — must be `true` for a real delete when `dry_run` is `false`

#### Output

On success: `success`, `owner`, `repo`, `full_name`, `request_id`. On failure: structured `error`. **This operation is irreversible** once confirmed.

### `github_get_repo`

Fetches repository metadata via `GET /repos/{owner}/{repo}`. Works for both **user-owned** and **organization-owned** repositories (same endpoint; `owner` is the user or org login).

#### Inputs

- `owner` (required)
- `name` (required) — repository name

#### Output

On success: `success`, `repo` (normalized fields such as `full_name`, `description`, `default_branch`, counts, `topics`, `owner`, `license`, `permissions` when returned by the API), and `request_id`. On failure: structured `error` (including `not_found` for 404).

### `github_update_repo`

Updates repository settings with `PATCH /repos/{owner}/{repo}`. Same endpoint for user- or org-owned repos. See [GitHub REST: Update a repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#update-a-repository).

Only parameters you pass are sent in the PATCH body (omit fields you do not want to change). `owner` and `name` identify the repository; use **`new_name`** to rename (maps to API body `name`).

**Not supported in this tool:** `security_and_analysis`, `custom_properties`, and repository **topics** (topics use [Replace all repository topics](https://docs.github.com/en/rest/repos/repos#replace-all-repository-topics)).

#### Inputs (all optional except `owner`, `name`)

- `owner` (required), `name` (required) — target repo
- `dry_run` (optional, default `false`) — if `true`, returns `planned_request` only (`repo` is null)
- `new_name`, `description`, `homepage`, `private`, `visibility` (`public` \| `private`)
- `has_issues`, `has_projects`, `has_wiki`, `is_template`, `default_branch`
- Merge settings: `allow_squash_merge`, `allow_merge_commit`, `allow_rebase_merge`, `allow_auto_merge`, `delete_branch_on_merge`, `allow_update_branch`
- `squash_merge_commit_title` (`PR_TITLE` \| `COMMIT_OR_PR_TITLE`), `squash_merge_commit_message` (`PR_BODY` \| `COMMIT_MESSAGES` \| `BLANK`)
- `merge_commit_title` (`PR_TITLE` \| `MERGE_MESSAGE`), `merge_commit_message` (`PR_BODY` \| `PR_TITLE` \| `BLANK`)
- `archived`, `allow_forking`, `web_commit_signoff_required`

#### Output

On success: normalized `repo` after update and `request_id`. On `dry_run`: `repo` is null and `planned_request` shows the PATCH payload. On failure: structured `error`.

### `github_list_repo_activities`

Lists repository activity history via [List repository activities](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-repository-activities) (`GET /repos/{owner}/{repo}/activity`).

#### Inputs

- `owner` (required), `name` (required)
- `direction` (optional): `asc` \| `desc`
- `per_page` (optional): 1–100
- `before`, `after` (optional): cursor strings from the previous response’s `pagination` / `Link` header
- `ref` (optional): Git reference (branch name or `refs/heads/...`)
- `actor` (optional): GitHub login filter
- `time_period` (optional): `day` \| `week` \| `month` \| `quarter` \| `year`
- `activity_type` (optional): `push` \| `force_push` \| `branch_creation` \| `branch_deletion` \| `pr_merge` \| `merge_queue_merge`

#### Output

On success: `activities` (normalized rows), `pagination` (`next` / `prev` / `first` / `last` cursor objects parsed from the `Link` header, or `null`), and `request_id`. On failure: structured `error`.

### `github_list_repo_contributors`

Lists people who have contributed to the repository via [List repository contributors](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-repository-contributors) (`GET /repos/{owner}/{repo}/contributors`). Results are ordered by commit count (descending). Contributor data may be cached by GitHub (see API docs).

#### Inputs

- `owner` (required), `name` (required)
- `include_anonymous` (optional): if `true`, sends GitHub’s `anon=1` to include anonymous contributors
- `per_page` (optional): 1–100; when omitted, the tool sends **100** (applied in the handler so defaults work reliably with MCP clients)
- `page` (optional): page number for pagination

#### Output

On success: `contributors` (normalized rows: `login`, `id`, `contributions`, `html_url`, `avatar_url`, `type`, `name`, `email`), `pagination` (`next` / `prev` / `first` / `last` with `page` and `per_page` parsed from the `Link` header when present, or `null`), and `request_id`. Follow `pagination.next` (same `page` / `per_page` args on the next call) until `pagination` is null or the page is short. If the repository is empty, GitHub may respond with **204**; the tool returns success with an empty `contributors` array and `pagination: null`. On failure: structured `error`.

### `github_create_repo_dispatch`

Creates a [repository dispatch](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#create-a-repository-dispatch-event) event (`POST /repos/{owner}/{repo}/dispatches`). Use this to trigger `repository_dispatch` webhooks and GitHub Actions workflows that listen for your `event_type`. Classic personal access tokens need the **`repo`** scope; fine-grained tokens need contents or appropriate repository permissions per GitHub’s requirements.

#### Inputs

- `owner` (required), `name` (required) — target repository
- `event_type` (required) — custom event name (100 characters or fewer); must match what your workflow listens for under `on: repository_dispatch`
- `client_payload` (optional) — JSON object passed to the workflow; at most **10** top-level properties and total serialized size under **64KB** (GitHub limits; the tool validates before calling the API)

#### Output

On success (204): `owner`, `repo`, `full_name`, `event_type`, `request_id`. On failure: structured `error` (e.g. **404** if the repo is missing, **422** for invalid body from GitHub).

### `github_check_immutable_releases`

Checks whether [immutable releases](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#check-if-immutable-releases-are-enabled-for-a-repository) are enabled (`GET /repos/{owner}/{repo}/immutable-releases`). Requires **admin read** access on the repository.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success (HTTP 200): `enabled`, `enforced_by_owner`, `request_id`. If GitHub returns **404** (immutable releases not enabled for this repo), the tool still returns **success** with `enabled: false` and `enforced_by_owner: false`. On other errors: structured `error`.

### `github_enable_immutable_releases`

Enables [immutable releases](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#enable-immutable-releases) via `PUT /repos/{owner}/{repo}/immutable-releases`. Requires **admin** access. Future releases published after enabling become immutable per GitHub’s rules; GitHub may return **409 Conflict** in some situations.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success (204): `owner`, `repo`, `full_name`, `request_id`. On failure: structured `error`.

### `github_disable_immutable_releases`

Disables [immutable releases](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#disable-immutable-releases) via `DELETE /repos/{owner}/{repo}/immutable-releases`. Requires **admin** access. GitHub may return **409 Conflict** in some situations.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success (204): `owner`, `repo`, `full_name`, `request_id`. On failure: structured `error`.

### `github_list_codeowners_errors`

Lists syntax errors in the repository [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) file via [List CODEOWNERS errors](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-codeowners-errors) (`GET /repos/{owner}/{repo}/codeowners/errors`).

#### Inputs

- `owner` (required), `name` (required)
- `ref` (optional): branch, tag, or commit; defaults to the repository default branch

#### Output

On success: `errors` (array of `line`, `column`, `source`, `kind`, `suggestion`, `message`, `path`), and `request_id`. On failure: structured `error` (e.g. **404** if the CODEOWNERS file is not found for the given ref).

### `github_check_dependabot_security_updates`

Checks whether Dependabot security updates are configured via [Check if Dependabot security updates are enabled](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#check-if-dependabot-security-updates-are-enabled-for-a-repository) (`GET /repos/{owner}/{repo}/automated-security-fixes`). Requires admin **read** access.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success (HTTP 200): `enabled`, `paused`, `request_id`. If GitHub returns **404** (feature not enabled for the repo), the tool still returns **success** with `enabled: false`, `paused: false`. On other errors: structured `error`.

### `github_enable_vulnerability_alerts`

Enables dependency vulnerability alerts and the dependency graph via [Enable vulnerability alerts](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#enable-vulnerability-alerts) (`PUT /repos/{owner}/{repo}/vulnerability-alerts`). Requires **admin** access. Use this before `github_enable_dependabot_security_updates` when the API reports that vulnerability alerts must be enabled first.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success (204): `owner`, `repo`, `full_name`, `request_id`. On failure: structured `error`.

### `github_enable_dependabot_security_updates`

Enables Dependabot security updates via [Enable Dependabot security updates](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#enable-dependabot-security-updates) (`PUT /repos/{owner}/{repo}/automated-security-fixes`). Requires **admin** access.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success (204): `owner`, `repo`, `full_name`, `request_id`. On failure: structured `error` (e.g. **422** if vulnerability alerts are not enabled).

### `github_disable_dependabot_security_updates`

Disables Dependabot security updates via [Disable Dependabot security updates](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#disable-dependabot-security-updates) (`DELETE /repos/{owner}/{repo}/automated-security-fixes`). Requires **admin** access. Does **not** disable vulnerability alerts or the dependency graph.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success (204): `owner`, `repo`, `full_name`, `request_id`. On failure: structured `error`.
