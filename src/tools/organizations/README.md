# Organization MCP tools

Implementations in this folder wrap [GitHub REST organizations](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10) endpoints. They are registered from `src/index.ts`. Success payloads follow the shared MCP shape (`request_id`, etc.); failures use the structured **error** envelope.

Nested **[API Insights](api-insights/README.md)** tools (`/orgs/{org}/insights/api/...`) live in [`api-insights/`](api-insights/).

**[Artifact metadata](artifact-metadata/README.md)** tools (`/orgs/{org}/artifacts/...`) live in [`artifact-metadata/`](artifact-metadata/).

**[Organization artifact attestations](artifact-attestations/README.md)** tools (`/orgs/{org}/attestations/...`) live in [`artifact-attestations/`](artifact-attestations/).

**[Blocking users](blocking-users/README.md)** tools (`/orgs/{org}/blocks`, `/orgs/{org}/blocks/{username}`) live in [`blocking-users/`](blocking-users/).

**[Organization members](members/README.md)** tools (`/orgs/{org}/failed_invitations`, …) live in [`members/`](members/).

**[Organization custom properties](custom-properties/README.md)** tools (`GET` / `PATCH /orgs/{org}/properties/schema`, …) live in [`custom-properties/`](custom-properties/).

**[Organization issue fields](issue-fields/README.md)** tools (`GET /orgs/{org}/issue-fields`, …) live in [`issue-fields/`](issue-fields/).

**[Organization issue types](issue-types/README.md)** tools (`GET /orgs/{org}/issue-types`, …) live in [`issue-types/`](issue-types/).

## Tools

- [`github_list_organizations`](README.md#github_list_organizations)
- [`github_list_orgs_for_authenticated_user`](README.md#github_list_orgs_for_authenticated_user)
- [`github_list_orgs_for_user`](README.md#github_list_orgs_for_user)
- [`github_list_org_app_installations`](README.md#github_list_org_app_installations)
- [`github_get_org`](README.md#github_get_org)
- [`github_list_org_issue_fields`](issue-fields/README.md#github_list_org_issue_fields)
- [`github_create_org_issue_field`](issue-fields/README.md#github_create_org_issue_field)
- [`github_update_org_issue_field`](issue-fields/README.md#github_update_org_issue_field)
- [`github_delete_org_issue_field`](issue-fields/README.md#github_delete_org_issue_field)
- [`github_list_org_issue_types`](issue-types/README.md#github_list_org_issue_types)
- [`github_create_org_issue_type`](issue-types/README.md#github_create_org_issue_type)
- [`github_update_org_issue_type`](issue-types/README.md#github_update_org_issue_type)
- [`github_delete_org_issue_type`](issue-types/README.md#github_delete_org_issue_type)
- [`github_get_org_custom_properties`](custom-properties/README.md#github_get_org_custom_properties)
- [`github_get_org_custom_property`](custom-properties/README.md#github_get_org_custom_property)
- [`github_create_update_org_custom_properties`](custom-properties/README.md#github_create_update_org_custom_properties)
- [`github_get_org_immutable_releases_settings`](README.md#github_get_org_immutable_releases_settings)
- [`github_set_org_immutable_releases_settings`](README.md#github_set_org_immutable_releases_settings)
- [`github_list_immutable_releases_for_org_repos`](README.md#github_list_immutable_releases_for_org_repos)
- [`github_enable_immutable_releases_for_org_repo`](README.md#github_enable_immutable_releases_for_org_repo)
- [`github_enable_or_disable_org_security_feature`](README.md#github_enable_or_disable_org_security_feature)
- [`github_create_org_artifact_deployment_record`](artifact-metadata/README.md#github_create_org_artifact_deployment_record)
- [`github_list_org_artifact_deployment_records`](artifact-metadata/README.md#github_list_org_artifact_deployment_records)
- [`github_create_org_metadata_storage_record`](artifact-metadata/README.md#github_create_org_metadata_storage_record)
- [`github_list_org_metadata_storage_records`](artifact-metadata/README.md#github_list_org_metadata_storage_records)
- [`github_set_org_cluster_deployment_records`](artifact-metadata/README.md#github_set_org_cluster_deployment_records)
- [`github_list_org_attestation_repos`](artifact-attestations/README.md#github_list_org_attestation_repos)
- [`github_list_org_attestations`](artifact-attestations/README.md#github_list_org_attestations)
- [`github_list_org_attestations_bulk_subject_digests`](artifact-attestations/README.md#github_list_org_attestations_bulk_subject_digests)
- [`github_delete_org_attestation_by_id`](artifact-attestations/README.md#github_delete_org_attestation_by_id)
- [`github_delete_org_attestation_by_subject_digest`](artifact-attestations/README.md#github_delete_org_attestation_by_subject_digest)
- [`github_delete_org_attestations_bulk`](artifact-attestations/README.md#github_delete_org_attestations_bulk)
- [`github_list_org_blocked_users`](blocking-users/README.md#github_list_org_blocked_users)
- [`github_list_org_failed_invitations`](members/README.md#github_list_org_failed_invitations)
- [`github_list_org_pending_invitations`](members/README.md#github_list_org_pending_invitations)
- [`github_create_org_invitation`](members/README.md#github_create_org_invitation)
- [`github_cancel_org_invitation`](members/README.md#github_cancel_org_invitation)
- [`github_check_org_blocked_user`](blocking-users/README.md#github_check_org_blocked_user)
- [`github_block_org_user`](blocking-users/README.md#github_block_org_user)
- [`github_unblock_org_user`](blocking-users/README.md#github_unblock_org_user)
- [`github_disable_immutable_releases_for_org_repo`](README.md#github_disable_immutable_releases_for_org_repo)
- [`github_set_immutable_releases_for_org_repos`](README.md#github_set_immutable_releases_for_org_repos)
- [`github_update_org`](README.md#github_update_org)
- [`github_delete_org`](README.md#github_delete_org)

---

### `github_delete_org`

Deletes an organization via [Delete an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#delete-an-organization) (`DELETE /orgs/{org}`). This **deletes all repositories** in the org; the login cannot be reused for **90 days**. Read GitHub’s [Terms of Service](https://docs.github.com/site-policy/github-terms/github-terms-of-service) first.

**Guards:** set **`confirm`: `true`** to perform the delete, or **`dry_run`: `true`** to validate arguments without calling the API. If neither is set, the tool returns a **400** validation error (same pattern as `github_delete_repo`).

#### Inputs

- **`org`** (required)
- **`dry_run`** (optional, default `false`)
- **`confirm`** (optional, default `false`)

#### Output

On success: echoed **`org`**, **`request_id`**, and typically **`http_status`** **202** (omitted on dry run). On failure: structured **`error`** (e.g. **403**, **404**, **451**).

---

### `github_update_org`

Updates an organization via [Update an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#update-an-organization) (`PATCH /orgs/{org}`). Send a non-empty **`patch`** object; only include keys you want to change. Validated keys include **`billing_email`**, **`company`**, **`email`**, **`twitter_username`**, **`location`**, **`name`**, **`description`** (max 160 chars, nullable), **`blog`**, project flags, **`default_repository_permission`**, member repository-creation and Pages settings, **`web_commit_signoff_required`**, deploy keys flag, and deprecated “new repository” security toggles (GitHub recommends code security configurations instead). Additional properties are forwarded when the API accepts them.

#### Inputs

- **`org`** (required) — organization login
- **`patch`** (required) — non-empty object of fields to set

#### Output

On success: **`http_status`** (**200**), echoed **`org`**, updated **`organization`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **409**, **422**).

---

### `github_get_org`

Fetches one organization via [Get an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#get-an-organization) (`GET /orgs/{org}`). The JSON includes at least public profile fields; **sensitive or owner-only fields** depend on the token (classic: e.g. **`admin:org`** for full org details per GitHub; fine-grained: org permissions as documented).

#### Inputs

- **`org`** (required) — organization login (not case sensitive)

#### Output

On success: **`http_status`** (**200**), echoed **`org`**, **`organization`**, **`request_id`**. On failure: structured **`error`** (e.g. **404**).

---

### `github_get_org_immutable_releases_settings`

Reads the org-wide immutable releases policy via [Get immutable releases settings for an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#get-immutable-releases-settings-for-an-organization) (`GET /orgs/{org}/settings/immutable-releases`). OAuth and classic personal access tokens typically need **`admin:org`** per GitHub.

#### Inputs

- **`org`** (required) — organization login

#### Output

On success: **`http_status`** (**200**), **`enforced_repositories`** (`all`, `none`, or `selected`), **`selected_repositories_url`** (often present when enforcement is `selected`), echoed **`org`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**).

---

### `github_set_org_immutable_releases_settings`

Updates the org-wide immutable releases policy via [Set immutable releases settings for an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#set-immutable-releases-settings-for-an-organization) (`PUT /orgs/{org}/settings/immutable-releases`). Success is typically **`http_status`** **204** (no response body). OAuth and classic personal access tokens typically need **`admin:org`** per GitHub.

#### Inputs

- **`org`** (required) — organization login
- **`enforced_repositories`** (required) — `all`, `none`, or `selected`
- **`selected_repository_ids`** (optional) — numeric repository ids; **only** when **`enforced_repositories`** is **`selected`**. Omit when switching to `all` or `none`, or when only changing policy mode.

#### Output

On success: **`http_status`**, echoed **`org`**, **`enforced_repositories`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **422**). If **`selected_repository_ids`** is sent while **`enforced_repositories`** is not **`selected`**, the tool returns a **400** validation error without calling GitHub.

---

### `github_list_immutable_releases_for_org_repos`

Lists repositories under **selected** immutable-releases enforcement via [List selected repositories for immutable releases enforcement](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-selected-repositories-for-immutable-releases-enforcement) (`GET /orgs/{org}/settings/immutable-releases/repositories`). Meaningful when **`enforced_repositories`** is **`selected`** on the org policy (`github_get_org_immutable_releases_settings`). OAuth and classic personal access tokens typically need **`admin:org`** per GitHub.

Pagination uses **`page`** and **`per_page`** (1–100; default **100** when omitted; GitHub’s REST default is **30**).

#### Inputs

- **`org`** (required) — organization login
- `page` (optional, default **1**)
- `per_page` (optional, 1–100; default **100** when omitted)
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: **`org`**, **`total_count`**, **`repositories`**, **`page`**, **`per_page`**, **`pages_fetched`**, **`pagination`**, optional **`truncated`**, **`request_id`**. On failure: structured **`error`**.

---

### `github_enable_immutable_releases_for_org_repo`

Adds a single repository to the **selected** enforcement list via [Enable a selected repository for immutable releases in an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#enable-a-selected-repository-for-immutable-releases-in-an-organization) (`PUT /orgs/{org}/settings/immutable-releases/repositories/{repository_id}`). The org must use **`enforced_repositories`: `selected`**. For replacing the entire list, use **`github_set_immutable_releases_for_org_repos`**. OAuth and classic personal access tokens typically need **`admin:org`** per GitHub.

#### Inputs

- **`org`** (required) — organization login
- **`repository_id`** (required) — numeric GitHub repository id (not the repo name)

#### Output

On success: **`http_status`** (typically **204**), echoed **`org`**, **`repository_id`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **422**).

---

### `github_enable_or_disable_org_security_feature`

Calls [Enable or disable a security feature for an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#enable-or-disable-a-security-feature-for-an-organization) (`POST /orgs/{org}/{security_product}/{enablement}`) to start enabling or disabling one security product across **all eligible** repositories. GitHub’s docs describe this endpoint as **closing down** in favor of [**code security configurations**](https://docs.github.com/en/code-security/code-security-overview); prefer those for new defaults.

Caller must be an **organization owner** or a member of a team with the **security manager** role. Classic PATs typically need **`admin:org`**, **`write:org`**, or **`repo`** per GitHub.

#### Inputs

- **`org`** (required) — organization login
- **`security_product`** (required) — one of: `dependency_graph`, `dependabot_alerts`, `dependabot_security_updates`, `advanced_security`, `code_scanning_default_setup`, `secret_scanning`, `secret_scanning_push_protection`
- **`enablement`** (required) — `enable_all` or `disable_all`
- **`query_suite`** (optional) — `default` or `extended`; **only** when **`security_product`** is **`code_scanning_default_setup`**. Otherwise omit (sending it returns a **400** validation error without calling GitHub).

#### Output

On success: **`http_status`** (typically **204**), echoed **`org`**, **`security_product`**, **`enablement`**, optional echoed **`query_suite`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **422** when enablement is blocked or in progress).

---

### `github_disable_immutable_releases_for_org_repo`

Removes a single repository from the **selected** enforcement list via [Disable a selected repository for immutable releases in an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#disable-a-selected-repository-for-immutable-releases-in-an-organization) (`DELETE /orgs/{org}/settings/immutable-releases/repositories/{repository_id}`). The org must use **`enforced_repositories`: `selected`**. OAuth and classic personal access tokens typically need **`admin:org`** per GitHub.

#### Inputs

- **`org`** (required) — organization login
- **`repository_id`** (required) — numeric GitHub repository id (not the repo name)

#### Output

On success: **`http_status`** (typically **204**), echoed **`org`**, **`repository_id`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **422**).

---

### `github_set_immutable_releases_for_org_repos`

Replaces the full set of repositories under **selected** enforcement via [Set selected repositories for immutable releases enforcement](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#set-selected-repositories-for-immutable-releases-enforcement) (`PUT /orgs/{org}/settings/immutable-releases/repositories`). The org must already use **`enforced_repositories`: `selected`** (`github_set_org_immutable_releases_settings`). OAuth and classic personal access tokens typically need **`admin:org`** per GitHub.

#### Inputs

- **`org`** (required) — organization login
- **`selected_repository_ids`** (required) — array of numeric repository ids GitHub should enforce; pass **`[]`** to clear the selection

#### Output

On success: **`http_status`** (typically **204**), echoed **`org`**, echoed **`selected_repository_ids`**, **`request_id`**. On failure: structured **`error`** (e.g. **403**, **422** when the org policy is not `selected`).

---

### `github_list_organizations`

Lists [all organizations](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-organizations) via `GET /organizations` in the order they were created. Returns **simple** organization objects (`login`, `id`, `url`, `avatar_url`, `description`, …). This is **not** the same as repositories for one org (`github_list_org_repos` in the parent [`repositories/`](../repositories/README.md) docs).

GitHub paginates with the **`since`** organization id cursor (like `github_list_public_repos` uses repository ids). Pass **`per_page`** (1–100; default **100** when omitted; GitHub’s REST default is **30**).

#### Inputs

- `since` (optional) — non-negative integer organization id cursor; omit for the first page
- `per_page` (optional, 1–100; default **100** when omitted)
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: `organizations`, `since` (cursor used on the last request, or `null`), `per_page`, `pages_fetched`, `pagination`, optional `truncated`, and `request_id`. On failure: structured `error`.

---

### `github_list_orgs_for_authenticated_user`

Lists organizations for the authenticated user via [List organizations for the authenticated user](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-organizations-for-the-authenticated-user) (`GET /user/orgs`). Returns the same **simple** organization shape as **`github_list_organizations`**, but only orgs your authorization can operate on (not the global public catalog).

Classic OAuth and PATs need at least **`user`** or **`read:org`**; insufficient scope yields **403**. Fine-grained tokens may receive **200** with an **empty** list per GitHub.

#### Inputs

- `page` (optional, default **1**)
- `per_page` (optional, 1–100; default **100** when omitted; GitHub’s REST default is **30**)
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: **`organizations`**, **`page`**, **`per_page`**, **`pages_fetched`**, **`pagination`**, optional **`truncated`**, **`request_id`**. On failure: structured **`error`** (e.g. **401**, **403**).

---

### `github_list_orgs_for_user`

Lists [public organization memberships](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-organizations-for-a-user) for a user account (`GET /users/{username}/orgs`). Returns the same **simple** organization shape as **`github_list_organizations`**. **Private** memberships are never included; for the authenticated user’s orgs (including private), use **`github_list_orgs_for_authenticated_user`**.

#### Inputs

- **`username`** (required) — GitHub user login (handle)
- `page` (optional, default **1**)
- `per_page` (optional, 1–100; default **100** when omitted; GitHub’s REST default is **30**)
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: echoed **`username`**, **`organizations`**, **`page`**, **`per_page`**, **`pages_fetched`**, **`pagination`**, optional **`truncated`**, **`request_id`**. On failure: structured **`error`** (e.g. **404** if the user does not exist).

---

### `github_list_org_app_installations`

Lists GitHub App installations via [List app installations for an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-app-installations-for-an-organization) (`GET /orgs/{org}/installations`). GitHub’s **`total_count`** includes installations on repositories in the organization. Callers must be **organization owners**; classic and fine-grained token requirements are documented on the endpoint page.

Pagination uses **`page`** and **`per_page`** (1–100; default **100** when omitted; GitHub’s REST default is **30**).

#### Inputs

- **`org`** (required) — organization login
- `page` (optional, default **1**)
- `per_page` (optional, 1–100; default **100** when omitted)
- `all_pages` (optional), `max_pages` (optional, 1–500; default **100** with `all_pages`)

#### Output

On success: **`org`**, **`total_count`**, **`installations`**, **`page`**, **`per_page`**, **`pages_fetched`**, **`pagination`**, optional **`truncated`**, **`request_id`**. On failure: structured **`error`** (e.g. **403** when not an owner).
