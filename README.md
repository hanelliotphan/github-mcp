# Github MCP - An MCP server to perform Github operations

An MCP server for GitHub operations using TypeScript. Below are the available tools:

- `github_create_personal_repo`
- `github_create_org_repo`
- `github_delete_repo`

## Prerequisites

- Node.js 20+
- npm 10+
- A GitHub token with permission for the operations you use: **create** and/or **delete** repositories. Creation needs appropriate repo/org access; deletion typically needs **admin** on the repo and classic PATs need the **`delete_repo`** scope ([GitHub docs](https://docs.github.com/en/rest/repos/repos#delete-a-repository)). Fine-grained PATs need delete permission for that repository. Org policies may block deletes (403) even when creation is allowed.

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