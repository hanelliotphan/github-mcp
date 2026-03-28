# Github MCP - An MCP server to perform Github operations

An MCP server for GitHub operations using TypeScript.

## Prerequisites

- Node.js 20+
- npm 10+
- A GitHub token with permission for the operations you use: **read** (`github_get_repo`, listing activities and contributors), **immutable releases** (`github_check_immutable_releases` requires **admin read**; `github_enable_immutable_releases` and `github_disable_immutable_releases` require **admin** per GitHub), **update** (`github_update_repo`), **create**, **repository dispatch** (`github_create_repo_dispatch`; classic PATs need **`repo`** scope), and/or **delete** repositories. **Update** requires permission to change repo settings (often **admin** on the repo; classic PATs typically need `repo` scope). **Read** needs access to the repo (public repos work without auth for metadata; private repos need `repo` or appropriate fine-grained repository read access). Creation needs appropriate repo/org access; deletion typically needs **admin** on the repo and classic PATs need the **`delete_repo`** scope ([GitHub docs](https://docs.github.com/en/rest/repos/repos#delete-a-repository)). Fine-grained PATs need matching permissions per operation. Org policies may block deletes (403) even when creation is allowed.
- **Security / Dependabot tools** (`github_check_dependabot_security_updates`, enable/disable automated security fixes, `github_enable_vulnerability_alerts`) require **admin** access on the repository (and appropriate token scopes). Enabling Dependabot security updates may return **422** until **vulnerability alerts** are enabled first—call `github_enable_vulnerability_alerts`, then `github_enable_dependabot_security_updates`. See [REST API endpoints for repositories](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10).

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

Implementations live in `src/tools/repositories/`. For each tool’s parameters, response shape, and links to GitHub REST docs, see **[src/tools/repositories/README.md](src/tools/repositories/README.md)**.

**Repositories**

- `github_create_personal_repo`
- `github_create_org_repo`
- `github_delete_repo`
- `github_get_repo`
- `github_update_repo`
- `github_list_repo_activities`
- `github_list_repo_contributors`
- `github_create_repo_dispatch`
- `github_check_immutable_releases`
- `github_enable_immutable_releases`
- `github_disable_immutable_releases`
- `github_list_codeowners_errors`

**Dependency alerts & Dependabot security updates**

- `github_check_dependabot_security_updates`
- `github_enable_vulnerability_alerts`
- `github_enable_dependabot_security_updates`
- `github_disable_dependabot_security_updates`

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