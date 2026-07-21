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

Implementations live under `src/tools/` (`actions/`, `repositories/`, `organizations/`, and nested feature folders). Documentation is split for readability:

- **[Organization tools](src/tools/organizations/README.md)** — list organizations (`GET /organizations`), list orgs for the authenticated user (`GET /user/orgs`), list public org memberships for a user (`GET /users/{username}/orgs`), list org GitHub App installations (`GET /orgs/{org}/installations`), [API Insights](src/tools/organizations/api-insights/README.md) (`GET /orgs/{org}/insights/api/subject-stats`, `summary-stats`, `summary-stats/{actor_type}/{actor_id}`, `summary-stats/users/{user_id}`, `time-stats`, `time-stats/{actor_type}/{actor_id}`, `time-stats/users/{user_id}`, `user-stats/{user_id}`, route stats by actor, …), [artifact metadata](src/tools/organizations/artifact-metadata/README.md) (`POST /orgs/{org}/artifacts/metadata/deployment-record`, `GET …/artifacts/{subject_digest}/metadata/deployment-records`, `GET …/metadata/storage-records`, `…/deployment-record/cluster/{cluster}`, `POST …/metadata/storage-record`, …), [org attestations](src/tools/organizations/artifact-attestations/README.md) (`GET /orgs/{org}/attestations/repositories`, `GET /orgs/{org}/attestations/{subject_digest}`, `POST /orgs/{org}/attestations/bulk-list`, `DELETE …/attestations/{attestation_id}`, `DELETE …/attestations/digest/{subject_digest}`, `POST …/attestations/delete-request`, …), [org blocking](src/tools/organizations/blocking-users/README.md) (`GET /orgs/{org}/blocks`, `GET/PUT/DELETE …/blocks/{username}`), [org custom properties](src/tools/organizations/custom-properties/README.md) (`GET /orgs/{org}/properties/schema`, `GET …/schema/{custom_property_name}`, `PATCH …/schema`), get/set org immutable releases settings (`GET` / `PUT /orgs/{org}/settings/immutable-releases`), list / replace / add / remove selected repos for immutable releases (`GET` / `PUT` / `PUT …/{repository_id}` / `DELETE …/{repository_id}` under `/orgs/{org}/settings/immutable-releases/repositories`), get, update, and delete an org (`GET` / `PATCH` / `DELETE /orgs/{org}`; delete is guarded with `confirm` / `dry_run`).
- **[Repository tools overview](src/tools/repositories/README.md)** — tools registered from the top level of `repositories/` (create/delete/update repo, lists, settings, dispatch, dependency alerts, CODEOWNERS, etc.), plus the shared response conventions.
- **[Contents](src/tools/repositories/contents/README.md)** — repository files, READMEs, create/update/delete file contents, tar/zip archive download URLs.
- **[Autolinks](src/tools/repositories/autolinks/README.md)** — list, get, create, and delete repository autolinks.
- **[Custom properties](src/tools/repositories/custom-properties/README.md)** — get, create, and update organization custom property values on repositories.
- **[Forks](src/tools/repositories/forks/README.md)** — list and create repository forks.
- **[Rules](src/tools/repositories/rules/README.md)** — branch rules; list, get, create, and update repository rulesets.
- **[Rule suites](src/tools/repositories/rule-suites/README.md)** — ruleset evaluation history.
- **[Attestations](src/tools/repositories/attestations/README.md)** — artifact attestations.
- **[Actions artifacts](src/tools/actions/artifacts/README.md)** — list (repo and workflow run), get, delete, and download GitHub Actions artifacts (`GET/DELETE /repos/{owner}/{repo}/actions/artifacts/...`, `GET …/actions/runs/{run_id}/artifacts`).
- **[Actions cache](src/tools/actions/cache/README.md)** — cache usage (repo, org, and by-repository for an org), list caches, and delete caches by key or id (`GET /repos/{owner}/{repo}/actions/cache/usage`, `GET /orgs/{org}/actions/cache/usage[-by-repository]`, `GET/DELETE …/actions/caches`).
- **[Actions concurrency groups](src/tools/actions/concurrency-groups/README.md)** — list concurrency groups for a repo or workflow run, and get a concurrency group with its queue (`GET /repos/{owner}/{repo}/actions/concurrency_groups[/{group}]`, `GET …/actions/runs/{run_id}/concurrency_groups`).
- **[GitHub-hosted runners](src/tools/actions/hosted-runners/README.md)** — list/create/get/update/delete hosted runners, GitHub-owned/partner images, limits, machine specs, platforms, and custom images/versions (`GET/POST/PATCH/DELETE /orgs/{org}/actions/hosted-runners...`).
- **[Actions OIDC](src/tools/actions/oidc/README.md)** — get/set the OIDC subject claim customization template for an org or repo (`GET/PUT /orgs/{org}/actions/oidc/customization/sub`, `GET/PUT /repos/{owner}/{repo}/actions/oidc/customization/sub`).

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