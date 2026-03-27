# Github MCP - An MCP server to perform Github operations

An MCP server for GitHub operations using TypeScript. Below are the available tools:

- `github_create_personal_repo`
- `github_create_org_repo`
- `github_delete_repo`
- `github_get_repo`
- `github_update_repo`

## Prerequisites

- Node.js 20+
- npm 10+
- A GitHub token with permission for the operations you use: **read** (`github_get_repo`), **update** (`github_update_repo`), **create**, and/or **delete** repositories. **Update** requires permission to change repo settings (often **admin** on the repo; classic PATs typically need `repo` scope). **Read** needs access to the repo (public repos work without auth for metadata; private repos need `repo` or appropriate fine-grained repository read access). Creation needs appropriate repo/org access; deletion typically needs **admin** on the repo and classic PATs need the **`delete_repo`** scope ([GitHub docs](https://docs.github.com/en/rest/repos/repos#delete-a-repository)). Fine-grained PATs need matching permissions per operation. Org policies may block deletes (403) even when creation is allowed.

## Setup

1. Install dependencies:
    ```bash
    npm install
    ```
2. Configure environment (`.env` only):
    Create a `.env` file in the project root and set:
    ```bash
    GITHUB_TOKEN=ghp_your_github_token
    ```
    Do not pass token values in MCP client config.
3. Build:
    ```bash
    npm run build
    ```
4. Run:
    ```bash
    npm start
    ```

## Development

```bash
npm run dev
```

## Tools

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

## MCP Client Config (using `.env` only)

This server reads `GITHUB_TOKEN` from `<your_home_directory>/github-mcp/.env`.
Do not include an `env` block in MCP client configs for this project.

### Cursor

```json
{
  "mcpServers": {
    "github-mcp": {
      "command": "node",
      "args": ["<your_home_directory>/github-mcp/dist/index.js"]
    }
  }
}
```

### Claude Desktop

```json
{
  "mcpServers": {
    "github-mcp": {
      "command": "node",
      "args": ["<your_home_directory>/github-mcp/dist/index.js"]
    }
  }
}
```

## Dedications

I dedicate this project to my 16-year-old self, my mother, PVNA, and those that have imprinted in my heart for me to keep going to this point.

Many thanks to Cursor for helping a lot with this project as well.