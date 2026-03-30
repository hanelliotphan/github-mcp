# Repository contents MCP tools

Tool implementations in this folder wrap [GitHub REST repository contents](https://docs.github.com/en/rest/repos/contents?apiVersion=2026-03-10) endpoints (files, READMEs, archives). They are registered from `src/index.ts`. Responses use the same shared shape as other repository tools: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope (see the parent [../README.md](../README.md) for general conventions).

## Tools

- [`github_get_repo_content`](README.md#github_get_repo_content)
- [`github_get_repo_readme`](README.md#github_get_repo_readme)
- [`github_get_repo_readme_in_directory`](README.md#github_get_repo_readme_in_directory)
- [`github_create_update_file_contents`](README.md#github_create_update_file_contents)
- [`github_delete_file`](README.md#github_delete_file)
- [`github_download_repo_archive_tar`](README.md#github_download_repo_archive_tar)
- [`github_download_repo_archive_zip`](README.md#github_download_repo_archive_zip)

---

### `github_get_repo_content`

Fetches a file, directory listing, symlink, or submodule via [Get repository content](https://docs.github.com/en/rest/repos/contents?apiVersion=2026-03-10#get-repository-content) (`GET /repos/{owner}/{repo}/contents/{path}`). Requires **Contents** read access (or **`repo`** scope for classic tokens). Omit **`path`** or use an empty string for the **repository root**.

#### Inputs

- `owner` (required), `name` (required)
- `path` (optional) — file or directory path within the repo; default is root (`""`)
- `ref` (optional) — branch, tag, or commit SHA; defaults to the repository’s default branch
- `decode_content` (optional, default `false`) — when `true`, file responses include **`decoded_content`**: UTF-8 text decoded from GitHub’s base64 `content` (whitespace in the base64 string is stripped first). Set to `null` when decoding was requested but the response is not a base64 file body (e.g. symlink, submodule, or missing `content`). Binary files are still decoded to a string and may contain replacement characters; use the raw `content` field if you need lossless base64.

#### Output

On success: **`decode_content`** echoes whether UTF-8 decoding was applied (the tool accepts boolean or string forms of the request argument, e.g. `true` or `"true"`). **`data`** is either an **array** of directory entries (GitHub returns at most **1,000** per directory; use the [Git Trees API](https://docs.github.com/en/rest/git/trees) for more) or a **single object** for a file (base64 `content` when applicable), symlink, or submodule. When **`decode_content`** is `true`, file objects also include **`decoded_content`** as described above. On failure: structured `error`. See GitHub’s docs for file size limits (e.g. files **> 100 MB** are not supported on this endpoint).

### `github_get_repo_readme`

Fetches the repository’s preferred README via [Get a repository README](https://docs.github.com/en/rest/repos/contents?apiVersion=2026-03-10#get-a-repository-readme) (`GET /repos/{owner}/{repo}/readme`). GitHub picks the README from the root or standard locations per the docs. Requires read access to the repo. Same **`decode_content`** behavior as `github_get_repo_content` for the file payload (`data` is always a single file object).

#### Inputs

- `owner` (required), `name` (required)
- `ref` (optional) — branch, tag, or commit SHA; defaults to the repository’s default branch
- `decode_content` (optional, default `false`) — when `true`, adds **`decoded_content`** (UTF-8 from base64 `content`) on the file object

#### Output

On success: **`decode_content`**, **`data`** (README file metadata and `content` / optional `decoded_content`), and **`request_id`**. On failure: structured `error` (e.g. **404** if no README is found).

### `github_get_repo_readme_in_directory`

Fetches a README under a directory via [Get a repository README for a directory](https://docs.github.com/en/rest/repos/contents?apiVersion=2026-03-10#get-a-repository-readme-for-a-directory) (`GET /repos/{owner}/{repo}/readme/{dir}`). The **`dir`** path is where GitHub looks for README files (per GitHub’s search rules). Same **`decode_content`** / **`data`** shape as `github_get_repo_readme`.

#### Inputs

- `owner` (required), `name` (required)
- `dir` (required) — directory path within the repo (leading slashes are stripped; must not be empty)
- `ref` (optional) — branch, tag, or commit SHA
- `decode_content` (optional, default `false`)

#### Output

Same as `github_get_repo_readme`: **`decode_content`**, **`data`**, **`request_id`**, or structured **`error`** (e.g. **404**).

### `github_create_update_file_contents`

Creates or updates a single file via [Create or update file contents](https://docs.github.com/en/rest/repos/contents?apiVersion=2026-03-10#create-or-update-file-contents) (`PUT /repos/{owner}/{repo}/contents/{path}`). Requires **Contents** write access (classic token: **`repo`**; editing `.github/workflows/**` also needs **`workflow`**). Do not use this tool in parallel with `github_delete_file` on the same path.

#### Inputs

- `owner` (required), `name` (required)
- `path` (required) — file path in the repository (leading slashes are stripped)
- `message` (required) — commit message
- `content` (required) — file body as UTF-8 text by default
- `content_is_base64` (optional, default `false`) — if `true`, `content` is treated as already Base64-encoded (whitespace stripped before sending)
- `sha` (optional) — **required when replacing an existing file**: current blob SHA (e.g. from `github_get_repo_content` on that path)
- `branch` (optional) — branch to commit on; default is the repository default branch
- `committer` (optional) — `{ name, email, date? }` (if present, `name` and `email` are required)
- `author` (optional) — same shape as `committer`

#### Output

On success: `http_status` (**201** create, **200** update), `result` with `content` and `commit` objects from GitHub, and `request_id`. On failure: structured `error` (e.g. **409** conflict, **422** validation).

### `github_delete_file`

Deletes a file via [Delete a file](https://docs.github.com/en/rest/repos/contents?apiVersion=2026-03-10#delete-a-file) (`DELETE /repos/{owner}/{repo}/contents/{path}`). Requires **Contents** write access (classic: **`repo`**; paths under `.github/workflows` also need **`workflow`**). **`sha`** is required (current blob SHA, e.g. from `github_get_repo_content`). Do not use this and `github_create_update_file_contents` concurrently on the same path.

#### Inputs

- `owner` (required), `name` (required)
- `path` (required) — file path in the repository (leading slashes are stripped)
- `message` (required) — commit message
- `sha` (required) — blob SHA of the file being deleted
- `branch` (optional)
- `committer` (optional) — `{ name, email }`
- `author` (optional) — `{ name, email }`

#### Output

On success: `http_status`, `result` (`content` and `commit` from GitHub), and `request_id`. On failure: structured `error`.

### `github_download_repo_archive_tar`

Resolves a **temporary download URL** for a repository **tar.gz** archive via [Download a repository archive (tar)](https://docs.github.com/en/rest/repos/contents?apiVersion=2026-03-10#download-a-repository-archive-tar) (`GET /repos/{owner}/{repo}/tarball/{ref}`). GitHub answers with **HTTP 302** and a **`Location`** header pointing at the archive (e.g. on `codeload.github.com`). This tool uses **`redirect: manual`** so it returns **`archive_download_url`** without streaming the archive through MCP. Requires read access to the repo; for **private** repos, the URL expires after a short time (per GitHub).

#### Inputs

- `owner` (required), `name` (required)
- `ref` (required) — branch, tag, or commit SHA to archive

#### Output

On success: **`http_status`** (**302**), **`archive_download_url`** (the `Location` URL), echo **`ref`**, and **`request_id`**. On failure: structured **`error`** (e.g. **404** if the repo or ref is missing). If the API response is not a 302 with `Location`, the tool returns an **`unknown_error`**-style payload describing the unexpected status.

### `github_download_repo_archive_zip`

Same behavior as **`github_download_repo_archive_tar`**, but for a **zip** archive via [Download a repository archive (zip)](https://docs.github.com/en/rest/repos/contents?apiVersion=2026-03-10#download-a-repository-archive-zip) (`GET /repos/{owner}/{repo}/zipball/{ref}`). Uses **`redirect: manual`** and returns **`archive_download_url`** from the **302** **`Location`** header. Per GitHub, **private** repo links are short-lived; an **empty** repository may yield **404** when the redirect is followed.

#### Inputs

- `owner` (required), `name` (required)
- `ref` (required) — branch, tag, or commit SHA to archive

#### Output

Same shape as **`github_download_repo_archive_tar`**: **`http_status`**, **`archive_download_url`**, **`ref`**, **`request_id`**, or structured **`error`**.
