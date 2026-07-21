# GitHub Actions artifacts MCP tools

Tools for [GitHub REST: Actions artifacts](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10) (`/repos/{owner}/{repo}/actions/artifacts`, …). They are registered from `src/index.ts`. Success payloads follow the shared MCP shape (`request_id`, etc.); failures use the structured **error** envelope.

Artifacts let you share data between jobs in a workflow and store data after a workflow completes.

## Tools

- [`github_list_artifacts_for_repo`](README.md#github_list_artifacts_for_repo)
- [`github_get_artifact`](README.md#github_get_artifact)
- [`github_delete_artifact`](README.md#github_delete_artifact)
- [`github_download_artifact`](README.md#github_download_artifact)
- [`github_list_workflow_run_artifacts`](README.md#github_list_workflow_run_artifacts)

---

### `github_list_artifacts_for_repo`

Lists artifacts via [List artifacts for a repository](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10#list-artifacts-for-a-repository) (`GET /repos/{owner}/{repo}/actions/artifacts`).

#### Inputs

- **`owner`** (required), **`name`** (required)
- **`artifact_name`** (optional) — filter to artifacts with this exact name (GitHub's `name` query parameter)
- **`per_page`** (optional) — 1–100; default **100** when omitted (GitHub's REST default is **30**)
- **`page`** (optional), **`all_pages`** (optional), **`max_pages`** (optional)

#### Output

On success (**200**): echoed **`owner`**, **`repo`**, **`full_name`**, **`total_count`**, **`artifacts`** (`id`, `name`, `size_in_bytes`, `archive_download_url`, `expired`, `created_at`, `expires_at`, `workflow_run`, …), **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.

#### Access

Anyone with **read** access to the repository. Classic OAuth apps and PATs need the **`repo`** scope for private repositories.

---

### `github_get_artifact`

Retrieves one artifact via [Get an artifact](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10#get-an-artifact) (`GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}`).

#### Inputs

- **`owner`** (required), **`name`** (required), **`artifact_id`** (required) — from `github_list_artifacts_for_repo` or `github_list_workflow_run_artifacts`

#### Output

On success (**200**): echoed **`owner`**, **`repo`**, **`full_name`**, **`artifact_id`**, **`artifact`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Anyone with **read** access. Classic tokens need the **`repo`** scope for private repositories.

---

### `github_delete_artifact`

Deletes an artifact via [Delete an artifact](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10#delete-an-artifact) (`DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}`).

#### Inputs

- **`owner`** (required), **`name`** (required), **`artifact_id`** (required)

#### Output

On success (**204**): echoed **`owner`**, **`repo`**, **`full_name`**, **`artifact_id`**, **`http_status`**, **`request_id`**. On failure: structured **`error`**.

#### Access

Classic OAuth apps and PATs need the **`repo`** scope.

---

### `github_download_artifact`

Returns a temporary archive download URL via [Download an artifact](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10#download-an-artifact) (`GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}`). GitHub responds with **302** and a `Location` URL — this tool returns that URL without downloading. The URL **expires after 1 minute**.

#### Inputs

- **`owner`** (required), **`name`** (required), **`artifact_id`** (required)
- **`archive_format`** (optional) — must be **`zip`** (default)

#### Output

On success (**302**): echoed **`owner`**, **`repo`**, **`full_name`**, **`artifact_id`**, **`archive_format`**, **`archive_download_url`** (the `Location` URL), **`http_status`**, **`request_id`**. On failure (e.g. **410 Gone** for an expired artifact): structured **`error`**.

#### Access

Classic OAuth apps and PATs need the **`repo`** scope.

---

### `github_list_workflow_run_artifacts`

Lists artifacts for a run via [List workflow run artifacts](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10#list-workflow-run-artifacts) (`GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts`).

#### Inputs

- **`owner`** (required), **`name`** (required), **`run_id`** (required)
- **`artifact_name`** (optional) — filter to artifacts with this exact name
- **`direction`** (optional) — **`asc`** or **`desc`** (default **`desc`**)
- **`per_page`** (optional) — 1–100; default **100** when omitted
- **`page`** (optional), **`all_pages`** (optional), **`max_pages`** (optional)

#### Output

On success (**200**): echoed **`owner`**, **`repo`**, **`full_name`**, **`run_id`**, **`total_count`**, **`artifacts`**, **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.

#### Access

Anyone with **read** access. Classic tokens need the **`repo`** scope for private repositories.
