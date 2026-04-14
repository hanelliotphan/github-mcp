# Github MCP - An MCP server to perform Github operations

An MCP server for GitHub operations using TypeScript.

## Prerequisites

- Node.js 20+
- npm 10+
- A GitHub token with access appropriate for what you run. Labels below match the wording used in GitHub **Settings** (classic scope checkboxes, collaborator **Role** options, fine-grained **Repository permissions** access dropdowns, and account/org permissions). See [src/tools/repositories/README.md](src/tools/repositories/README.md), [src/tools/organizations/README.md](src/tools/organizations/README.md), and the READMEs under [`contents/`](src/tools/repositories/contents/README.md), [`autolinks/`](src/tools/repositories/autolinks/README.md), [`custom-properties/`](src/tools/repositories/custom-properties/README.md), [`forks/`](src/tools/repositories/forks/README.md), [`rules/`](src/tools/repositories/rules/README.md), [`rule-suites/`](src/tools/repositories/rule-suites/README.md), [`webhooks/`](src/tools/repositories/webhooks/README.md), and [`attestations/`](src/tools/repositories/attestations/README.md) for which tool needs which access.

#### Repository → Settings → Collaborators and teams → Role

These are the options in the **Role** dropdown when you add a collaborator or change a person’s access ([repository roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)):

- Read
- Admin

#### User → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)

These are the scope rows with checkboxes; the line after each scope name is the description GitHub shows next to that checkbox ([scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes)):

- **`repo`** — Full control of private repositories
- **`delete_repo`** — Delete repositories

#### Fine-grained personal access token → Permissions → Repository permissions

Each row is a **Repository permission** name with an **Access** dropdown. Values below match the dropdown options in the token form ([fine-grained permissions](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token)):

- **Metadata** — Read-only
- **Contents** — Read-only
- **Administration** — read and write

#### Fine-grained personal access token → Permissions → Account permissions or Organization permissions

- **Create repositories**

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

Implementations live under `src/tools/` (`repositories/`, `organizations/`, and nested feature folders). Documentation is split for readability:

- **[Organization tools](src/tools/organizations/README.md)** — list organizations (`GET /organizations`), list org GitHub App installations (`GET /orgs/{org}/installations`), get/set org immutable releases settings (`GET` / `PUT /orgs/{org}/settings/immutable-releases`), get, update, and delete an org (`GET` / `PATCH` / `DELETE /orgs/{org}`; delete is guarded with `confirm` / `dry_run`).
- **[Repository tools overview](src/tools/repositories/README.md)** — tools registered from the top level of `repositories/` (create/delete/update repo, lists, settings, dispatch, dependency alerts, CODEOWNERS, etc.), plus the shared response conventions.
- **[Contents](src/tools/repositories/contents/README.md)** — repository files, READMEs, create/update/delete file contents, tar/zip archive download URLs.
- **[Autolinks](src/tools/repositories/autolinks/README.md)** — repository autolinks.
- **[Custom properties](src/tools/repositories/custom-properties/README.md)** — get, create, and update organization custom property values on repositories.
- **[Forks](src/tools/repositories/forks/README.md)** — list and create repository forks.
- **[Rules](src/tools/repositories/rules/README.md)** — branch rules; list, get, create, and update repository rulesets.
- **[Rule suites](src/tools/repositories/rule-suites/README.md)** — ruleset evaluation history.
- **[Attestations](src/tools/repositories/attestations/README.md)** — artifact attestations.

Static MCP tool descriptors (JSON: tool name, description, argument schema) live under [`mcps/user-github-mcp/tools/`](mcps/user-github-mcp/tools/) in the **same subfolders as** `src/tools` (e.g. `tools/repositories/webhooks/`, `tools/organizations/`), with [`mcps/user-github-mcp/SERVER_METADATA.json`](mcps/user-github-mcp/SERVER_METADATA.json) for server metadata. They mirror the registered tools in `src/index.ts` for clients that consume filesystem-based schemas.

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