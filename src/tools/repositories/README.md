# Repository MCP tools

TypeScript tool implementations in this folder are registered from the server entrypoint (`src/index.ts`). Each tool wraps a [GitHub REST repositories API](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10) call (or related endpoint). Responses use a shared shape: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope.

Tools whose code lives in subfolders are documented in **[`contents/README.md`](contents/README.md)** (files, READMEs, archives), **[`autolinks/README.md`](autolinks/README.md)**, **[`custom-properties/README.md`](custom-properties/README.md)**, **[`forks/README.md`](forks/README.md)**, **[`rules/README.md`](rules/README.md)**, **[`rule-suites/README.md`](rule-suites/README.md)**, **[`webhooks/README.md`](webhooks/README.md)**, and **[`attestations/README.md`](attestations/README.md)**.

**List tools with pagination** (org/user/authenticated repos, public repo feed, tags, branch rules, rulesets, repository webhooks, teams, topics, contributors, activities, **repository attestations** by subject digest) return `pages_fetched` and echo the effective cursor (`page` / `per_page`, or `since`, or `per_page` plus cursor `pagination`). Set **`all_pages`: `true`** to follow GitHub `Link: rel="next"` automatically up to **`max_pages`** (default **100**, max **500**). If **`truncated`** is `true`, raise `max_pages` or call again using **`pagination.next`**. Shared helpers live in `src/utils/github-paginate-all.ts`.

## Tool index

Documentation for tools whose implementations live in subfolders:

- **[`contents/`](contents/README.md)** — file and directory content, READMEs, create/update/delete files, tar/zip archive download URLs (`github_get_repo_content`, `github_get_repo_readme`, `github_get_repo_readme_in_directory`, `github_create_update_file_contents`, `github_delete_file`, `github_download_repo_archive_tar`, `github_download_repo_archive_zip`).
- **[`autolinks/`](autolinks/README.md)** — `github_list_repo_autolinks`.
- **[`custom-properties/`](custom-properties/README.md)** — `github_get_repo_custom_property_values`, `github_create_update_repo_custom_property_values`.
- **[`forks/`](forks/README.md)** — `github_list_repo_forks`, `github_create_repo_fork`.
- **[`rules/`](rules/README.md)** — `github_get_repo_branch_rules`, `github_list_repo_rulesets`, `github_get_repo_ruleset`, `github_get_repo_ruleset_history`, `github_get_repo_ruleset_version`, `github_create_repo_ruleset`, `github_update_repo_ruleset`, `github_delete_repo_ruleset`.
- **[`rule-suites/`](rule-suites/README.md)** — `github_list_repo_rule_suites`, `github_get_repo_rule_suite` (ruleset evaluation history, not ruleset definitions).
- **[`webhooks/`](webhooks/README.md)** — `github_list_repo_webhooks`, `github_get_repo_webhook`, `github_create_repo_webhook`.
- **[`attestations/`](attestations/README.md)** — `github_create_repo_attestation`, `github_list_repo_attestations`.

**Repositories** (implementations in this directory)

- [`github_create_personal_repo`](README.md#github_create_personal_repo)
- [`github_create_org_repo`](README.md#github_create_org_repo)
- [`github_list_org_repos`](README.md#github_list_org_repos)
- [`github_create_repo_from_template`](README.md#github_create_repo_from_template)
- [`github_delete_repo`](README.md#github_delete_repo)
- [`github_get_repo`](README.md#github_get_repo)
- [`github_update_repo`](README.md#github_update_repo)
- [`github_transfer_repo`](README.md#github_transfer_repo)
- [`github_list_repo_activities`](README.md#github_list_repo_activities)
- [`github_list_repo_contributors`](README.md#github_list_repo_contributors)
- [`github_list_repo_languages`](README.md#github_list_repo_languages)
- [`github_list_public_repos`](README.md#github_list_public_repos)
- [`github_list_authenticated_user_repos`](README.md#github_list_authenticated_user_repos)
- [`github_list_user_repos`](README.md#github_list_user_repos)
- [`github_list_repo_tags`](README.md#github_list_repo_tags)
- [`github_list_repo_teams`](README.md#github_list_repo_teams)
- [`github_list_repo_topics`](README.md#github_list_repo_topics)
- [`github_replace_repo_topics`](README.md#github_replace_repo_topics)
- [`github_create_repo_dispatch`](README.md#github_create_repo_dispatch)
- [`github_check_immutable_releases`](README.md#github_check_immutable_releases)
- [`github_enable_immutable_releases`](README.md#github_enable_immutable_releases)
- [`github_disable_immutable_releases`](README.md#github_disable_immutable_releases)

**CODEOWNERS**

- [`github_list_codeowners_errors`](README.md#github_list_codeowners_errors)

**Dependency alerts & Dependabot security updates**

- [`github_check_dependabot_security_updates`](README.md#github_check_dependabot_security_updates)
- [`github_check_private_vulnerability_reporting`](README.md#github_check_private_vulnerability_reporting)
- [`github_enable_private_vulnerability_reporting`](README.md#github_enable_private_vulnerability_reporting)
- [`github_disable_private_vulnerability_reporting`](README.md#github_disable_private_vulnerability_reporting)
- [`github_check_vulnerability_alerts`](README.md#github_check_vulnerability_alerts)
- [`github_enable_vulnerability_alerts`](README.md#github_enable_vulnerability_alerts)
- [`github_disable_vulnerability_alerts`](README.md#github_disable_vulnerability_alerts)
- [`github_enable_dependabot_security_updates`](README.md#github_enable_dependabot_security_updates)
- [`github_disable_dependabot_security_updates`](README.md#github_disable_dependabot_security_updates)

---

### `github_create_personal_repo`

Creates a repository under the authenticated user's personal GitHub account via [Create a repository for the authenticated user](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#create-a-repository-for-the-authenticated-user) (`POST /user/repos`). Boolean fields other than `private`, `auto_init`, and `is_template` are **omitted** when not provided so GitHub applies its defaults.

#### Inputs

- `name` (required)
- `description` (optional)
- `homepage` (optional)
- `private` (optional, default `false`)
- `has_issues`, `has_projects`, `has_wiki`, `has_discussions` (optional booleans)
- `auto_init` (optional, default `true`)
- `gitignore_template` (optional)
- `license_template` (optional)
- Merge settings (optional booleans): `allow_squash_merge`, `allow_merge_commit`, `allow_rebase_merge`, `allow_auto_merge`, `delete_branch_on_merge`
- Merge message defaults (optional, GitHub enums): `squash_merge_commit_title` (`PR_TITLE` \| `COMMIT_OR_PR_TITLE`), `squash_merge_commit_message` (`PR_BODY` \| `COMMIT_MESSAGES` \| `BLANK`), `merge_commit_title` (`PR_TITLE` \| `MERGE_MESSAGE`), `merge_commit_message` (`PR_BODY` \| `PR_TITLE` \| `BLANK`)
- `has_downloads` (optional boolean)
- `is_template` (optional, default `false`) — [template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)
- `dry_run` (optional, default `false`)

**Not supported:** `team_id` (GitHub only honors it for [organization repository creation](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#create-an-organization-repository); use `github_create_org_repo`). This tool does not send `custom_properties` (organization/custom-properties workflows).

#### Output

Returns structured JSON with:

- success/failure status
- created repository metadata on success
- normalized error envelope on failure

### `github_create_org_repo`

Creates a repository under a GitHub **organization** via [Create an organization repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#create-an-organization-repository) (`POST /orgs/{org}/repos`). Optional booleans other than `private`, `auto_init`, and `is_template` are **omitted** when not provided so GitHub applies its defaults.

#### Inputs

- `org` (required) — organization login, e.g. `acme-corp`
- `name` (required)
- `description` (optional)
- `homepage` (optional)
- `private` (optional, default `false`)
- `visibility` (optional) — `public` \| `private` (see GitHub docs when combining with `private`)
- `has_issues`, `has_projects`, `has_wiki`, `has_discussions` (optional booleans)
- `auto_init` (optional, default `true`)
- `gitignore_template` (optional)
- `license_template` (optional)
- `team_id` (optional, positive integer) — grant a team access to the new repository
- Merge settings (optional booleans): `allow_squash_merge`, `allow_merge_commit`, `allow_rebase_merge`, `allow_auto_merge`, `delete_branch_on_merge`
- `use_squash_pr_title_as_default` (optional boolean, **deprecated** by GitHub; prefer `squash_merge_commit_title`)
- Merge message defaults (optional, GitHub enums): `squash_merge_commit_title`, `squash_merge_commit_message`, `merge_commit_title`, `merge_commit_message` (same values as `github_create_personal_repo`)
- `has_downloads` (optional boolean)
- `is_template` (optional, default `false`) — [template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)
- `custom_properties` (optional object) — string keys; values must be string, number, boolean, or `null` (per org [custom properties](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization))
- `dry_run` (optional, default `false`)

#### Output

Same shape as `github_create_personal_repo` (success payload with `repo`, or structured `error`).

### `github_list_org_repos`

Lists [repositories for an organization](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-organization-repositories) via `GET /orgs/{org}/repos`. Which repositories you see depends on your token and org role (private repos need appropriate access).

**Manual pagination:** pass `page` / `per_page` (default **100** when `per_page` is omitted). The response always includes `page`, `per_page`, and `pages_fetched` (`1` for a single request). When more pages exist, `pagination` is parsed from the `Link` header—call again with `pagination.next.page` and the same `per_page` (and other filters) until `pagination.next` is absent.

**Fetch all pages in one tool call:** set `all_pages` to `true` to follow `next` links from page **1** until exhausted, up to `max_pages` (default **100** list requests, max **500**). On success with everything fetched, `pagination` is `null` and `pages_fetched` is the number of requests. If `truncated` is `true`, the cap was hit while more pages remained—use `pagination.next` on a follow-up call or increase `max_pages`.

#### Inputs

- `org` (required) — organization login
- `type` (optional) — `all` \| `public` \| `private` \| `forks` \| `sources` \| `member`
- `sort` (optional) — `created` \| `updated` \| `pushed` \| `full_name`
- `direction` (optional) — `asc` \| `desc`
- `per_page` (optional, 1–100; default **100** when omitted)
- `page` (optional, default 1) — ignored when `all_pages` is `true` (always starts at page 1)
- `all_pages` (optional, default `false`) — merge every page until done or `max_pages`
- `max_pages` (optional, 1–500; default **100**) — only applies when `all_pages` is `true`

#### Output

On success: `org`, `repositories` (same minimal fields as `github_list_user_repos`), `page`, `per_page`, `pages_fetched`, `pagination` (unless a full `all_pages` run completed), optional `truncated`, and `request_id`. On failure: structured `error` (e.g. **404** if the organization is not found).

### `github_create_repo_from_template`

Creates a new repository from a [repository template](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#create-a-repository-using-a-template) (`POST /repos/{template_owner}/{template_repo}/generate`). The source repository must have `is_template: true` (confirm with `github_get_repo`). Classic personal access tokens need **`public_repo`** or **`repo`** to generate a public repository from a public template, and **`repo`** for a private repository or private template.

#### Inputs

- `template_owner` (required), `template_name` (required) — template repository (`template_owner/template_name`)
- `name` (required) — name of the **new** repository
- `owner` (optional) — user or organization that will own the new repo; omit to create under the authenticated user
- `description` (optional)
- `include_all_branches` (optional, default `false`) — include all branches from the template, not only the default branch
- `private` (optional, default `false`)
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

### `github_transfer_repo`

Transfers a repository to another user or organization via [Transfer a repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#transfer-a-repository) (`POST /repos/{owner}/{repo}/transfer`). GitHub responds with **202 Accepted**; the payload may still reflect the previous owner until the transfer finishes, and **personal** repositories may require the new owner to accept the transfer.

#### Inputs

- `owner` (required), `name` (required) — source repository
- `new_owner` (required) — destination user or organization login
- `new_name` (optional) — rename as part of the transfer
- `team_ids` (optional) — numeric team IDs to grant access (organization-owned targets only)
- `dry_run` (optional, default `false`) — preview the request body only
- `confirm` (optional, default `false`) — must be `true` to perform a live transfer when `dry_run` is `false`

#### Output

On success: `success`, `new_owner`, normalized `repo` from the API response, `http_status` (typically `202`), and `request_id`. On `dry_run`: `repo` and `http_status` are null and `planned_request` describes the call. On failure: structured `error`.

### `github_list_repo_activities`

Lists repository activity history via [List repository activities](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-repository-activities) (`GET /repos/{owner}/{repo}/activity`). Cursor pagination (`after` / `before`). **`per_page` defaults to 100** when omitted (aligned with other list tools).

#### Inputs

- `owner` (required), `name` (required)
- `direction` (optional): `asc` \| `desc`
- `per_page` (optional): 1–100 (default **100** when omitted)
- `before`, `after` (optional): cursor strings from the previous response’s `pagination` / `Link` header
- `ref` (optional): Git reference (branch name or `refs/heads/...`)
- `actor` (optional): GitHub login filter
- `time_period` (optional): `day` \| `week` \| `month` \| `quarter` \| `year`
- `activity_type` (optional): `push` \| `force_push` \| `branch_creation` \| `branch_deletion` \| `pr_merge` \| `merge_queue_merge`
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `activities`, `per_page`, `pages_fetched`, `pagination` (or `null` after a full `all_pages` run), optional `truncated`, and `request_id`. On failure: structured `error`.

### `github_list_repo_contributors`

Lists people who have contributed to the repository via [List repository contributors](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-repository-contributors) (`GET /repos/{owner}/{repo}/contributors`). Results are ordered by commit count (descending). Contributor data may be cached by GitHub (see API docs).

#### Inputs

- `owner` (required), `name` (required)
- `include_anonymous` (optional): if `true`, sends GitHub’s `anon=1` to include anonymous contributors
- `per_page` (optional): 1–100; when omitted, the tool sends **100** (applied in the handler so defaults work reliably with MCP clients)
- `page` (optional): page number for pagination
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `contributors`, `page`, `per_page`, `pages_fetched`, `pagination`, optional `truncated`, and `request_id`. If the repository is empty, GitHub may respond with **204**; the tool returns success with an empty `contributors` array, `page` / `per_page` / `pages_fetched`, and `pagination: null`. On failure: structured `error`.

### `github_list_repo_languages`

Lists languages used in the repository via [List repository languages](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-repository-languages) (`GET /repos/{owner}/{repo}/languages`). Each language’s value is the number of **bytes** of code in that language (not lines). Requires read access to the repo.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success: `languages` (rows of `language` and `bytes`, sorted by bytes descending), `total_bytes` (sum of all language bytes), and `request_id`. If the repository has no detectable languages, the API returns an empty object; the tool returns an empty `languages` array and `total_bytes: 0`. On failure: structured `error`.

### `github_list_public_repos`

Lists [public repositories](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-public-repositories) globally via `GET /repositories` (all public repos in the order they were created). This is **not** scoped to a user or organization. GitHub paginates with the **`since`** repository id cursor (not `page` / `per_page`).

#### Inputs

- `since` (optional) — non-negative integer repository id cursor; omit for the first page
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `repositories`, `since` (cursor used on the last request, or `null`), `pages_fetched`, `pagination`, optional `truncated`, and `request_id`. On failure: structured `error` (e.g. **422** if the endpoint is rate-limited or validation fails).

### `github_list_authenticated_user_repos`

Lists [repositories for the authenticated user](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-repositories-for-the-authenticated-user) via `GET /user/repos`: repos you own, collaborate on, and can access through organization membership. Requires a valid token (**401** if unauthenticated). Pagination uses `page` / `per_page` (default **100** when `per_page` is omitted).

#### Inputs

- `visibility` (optional) — `all` \| `public` \| `private`
- `affiliation` (optional) — comma-separated subset of `owner`, `collaborator`, `organization_member`
- `type` (optional) — `all` \| `owner` \| `public` \| `private` \| `member` (**do not** combine with `visibility` or `affiliation`; GitHub returns **422**)
- `sort` (optional) — `created` \| `updated` \| `pushed` \| `full_name`
- `direction` (optional) — `asc` \| `desc`
- `per_page` (optional, 1–100; default **100** when omitted)
- `page` (optional, default 1) — ignored when `all_pages` is `true` (starts at page 1)
- `since` (optional) — ISO 8601 timestamp; only repos **updated** after this time
- `before` (optional) — ISO 8601 timestamp; only repos **updated** before this time
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `repositories`, `page`, `per_page`, `pages_fetched`, `pagination`, optional `truncated`, and `request_id`. On failure: structured `error` (e.g. **401**, **422** for invalid parameter combinations).

### `github_list_user_repos`

Lists [repositories for a user](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-repositories-for-a-user) via `GET /users/{username}/repos`. This endpoint lists **public** repositories for the given username by default (`type` defaults to `owner` on GitHub); use `type` to include `member` or `all` where applicable. Pagination uses `page` / `per_page` (default **100** when `per_page` is omitted).

#### Inputs

- `username` (required) — GitHub login (1–39 characters)
- `type` (optional) — `all` \| `owner` \| `member`
- `sort` (optional) — `created` \| `updated` \| `pushed` \| `full_name`
- `direction` (optional) — `asc` \| `desc`
- `per_page` (optional, 1–100; default **100** when omitted)
- `page` (optional, default 1) — ignored when `all_pages` is `true`
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `username`, `repositories`, `page`, `per_page`, `pages_fetched`, `pagination`, optional `truncated`, and `request_id`. On failure: structured `error`.

### `github_list_repo_tags`

Lists [repository tags](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-repository-tags) via `GET /repos/{owner}/{repo}/tags`. Requires read access to the repository.

#### Inputs

- `owner` (required), `name` (required)
- `per_page` (optional, 1–100; default **100** when omitted)
- `page` (optional, default 1)
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `tags`, `page`, `per_page`, `pages_fetched`, `pagination`, optional `truncated`, and `request_id`. If there are no tags, `tags` is an empty array. On failure: structured `error`.

### `github_list_repo_teams`

Lists [repository teams](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#list-repository-teams) via `GET /repos/{owner}/{repo}/teams`. Lists teams that have access to the repo and are visible to the authenticated user. For a **public** repository, a team is listed only if it **explicitly** added that repository. Classic personal access tokens need **`public_repo`** or **`repo`** for a public repo, and **`repo`** for a private repo (per GitHub).

#### Inputs

- `owner` (required), `name` (required)
- `per_page` (optional, 1–100; default **100** when omitted)
- `page` (optional, default 1)
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `teams`, `page`, `per_page`, `pages_fetched`, `pagination`, optional `truncated`, and `request_id`. If no teams match, `teams` is an empty array. On failure: structured `error` (e.g. **404** if the repository is not found or not accessible).

### `github_list_repo_topics`

Returns [all repository topics](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#get-all-repository-topics) for a page via `GET /repos/{owner}/{repo}/topics` (`names` array). With `all_pages`, topic names from each page are **concatenated** into one `names` array. Classic personal access tokens need **`public_repo`** or **`repo`** for public repositories and **`repo`** for private repositories (per GitHub).

#### Inputs

- `owner` (required), `name` (required)
- `per_page` (optional, 1–100; default **100** when omitted), `page` (optional, default 1)
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `names`, `page`, `per_page`, `pages_fetched`, `pagination`, optional `truncated`, and `request_id`. On failure: structured `error` (e.g. **404** if the repository is not found or not accessible).

### `github_replace_repo_topics`

Replaces [all repository topics](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#replace-all-repository-topics) via `PUT /repos/{owner}/{repo}/topics` with body `names` (full replacement; pass `[]` to clear). At most **20** topic names (GitHub limit). Requires write access; classic personal access tokens need the **`repo`** scope.

#### Inputs

- `owner` (required), `name` (required)
- `names` (required) — array of topic strings (empty array clears all topics)

#### Output

On success (200): `owner`, `repo`, `full_name`, `names` (as returned by GitHub, typically lowercase), and `request_id`. On failure: structured `error` (e.g. **404** if the repository is not found, **422** for validation).

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

### `github_check_private_vulnerability_reporting`

Checks whether [private vulnerability reporting](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#check-if-private-vulnerability-reporting-is-enabled-for-a-repository) is enabled (`GET /repos/{owner}/{repo}/private-vulnerability-reporting`). Requires **admin read** access on the repository.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On HTTP **200**: `success: true`, `outcome: "retrieved"`, `enabled`, `request_id`. On HTTP **404**: `success: true`, `outcome: "not_available"` (GitHub did not return a body for this endpoint—**a private repository is one possible cause**, along with plan, org policy, or feature exposure—not the same as disabled; check **Settings → Security** in the web UI). Other errors: structured `error` (for example **422**).

### `github_enable_private_vulnerability_reporting`

Enables [private vulnerability reporting](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#enable-private-vulnerability-reporting-for-a-repository) via `PUT /repos/{owner}/{repo}/private-vulnerability-reporting`. Requires **admin** access on the repository.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On HTTP **204**: `success: true`, `outcome: "enabled"`, `owner`, `repo`, `full_name`, `request_id`. On HTTP **404**: `success: true`, `outcome: "not_available"` (GitHub did not apply enable via this endpoint—**a private repository is one possible cause**, with plan, org policy, or feature exposure; check **Settings → Security**). Other errors: structured `error` (for example **422**).

### `github_disable_private_vulnerability_reporting`

Disables [private vulnerability reporting](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#disable-private-vulnerability-reporting-for-a-repository) via `DELETE /repos/{owner}/{repo}/private-vulnerability-reporting`. Requires **admin** access on the repository.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On HTTP **204**: `success: true`, `outcome: "disabled"`, `owner`, `repo`, `full_name`, `request_id`. On HTTP **404**: `success: true`, `outcome: "not_available"` (GitHub did not apply disable via this endpoint—**a private repository is one possible cause**, with plan, org policy, or feature exposure; check **Settings → Security**). Other errors: structured `error` (for example **422**).

### `github_check_vulnerability_alerts`

Checks whether [dependency vulnerability alerts](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#check-if-vulnerability-alerts-are-enabled-for-a-repository) are enabled (`GET /repos/{owner}/{repo}/vulnerability-alerts`). Requires **admin read** access on the repository.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On HTTP **204**: `success: true`, `enabled: true`, `request_id`. On HTTP **404** (alerts not enabled, per GitHub): `success: true`, `enabled: false`, `request_id`. Other errors: structured `error`. Note: a **404** from GitHub is documented as “not enabled”; it can also occur if the repository is missing or inaccessible—use `github_get_repo` if you need to distinguish.

### `github_enable_vulnerability_alerts`

Enables dependency vulnerability alerts and the dependency graph via [Enable vulnerability alerts](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#enable-vulnerability-alerts) (`PUT /repos/{owner}/{repo}/vulnerability-alerts`). Requires **admin** access. Use this before `github_enable_dependabot_security_updates` when the API reports that vulnerability alerts must be enabled first.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success (204): `owner`, `repo`, `full_name`, `request_id`. On failure: structured `error`.

### `github_disable_vulnerability_alerts`

Disables dependency vulnerability alerts and the dependency graph via [Disable vulnerability alerts](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#disable-vulnerability-alerts) (`DELETE /repos/{owner}/{repo}/vulnerability-alerts`). Requires **admin** access.

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
