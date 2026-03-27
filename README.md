# Github MCP - An MCP server to perform Github operations

An MCP server for GitHub operations using TypeScript. Below are the available tools:

- `github_create_personal_repo`
- `github_create_org_repo`

## Prerequisites

- Node.js 20+
- npm 10+
- A GitHub token with permission to **create repositories** (personal and/or org, depending on which tools you use). For org repos, the token needs access to create repositories in that organization (classic PAT: `repo` scope or organization SSO authorization when required; fine-grained: org + repository creation permission for that org).

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
