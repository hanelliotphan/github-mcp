# Github MCP - An MCP server to perform Github operations

An MCP server for GitHub operations using TypeScript.

## Prerequisites

- Node.js 20+
- npm 10+
- A GitHub token with access appropriate for what you run. Labels below match the wording used in GitHub **Settings** (classic scope checkboxes, collaborator **Role** options, fine-grained **Repository permissions** access dropdowns, and account/org permissions). See README files under each tool below for which tool needs which access.

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

Implementations live under `src/tools/`. Each link below has the full tool list and endpoint details for that area:

### Organizations

- **[Organization tools](src/tools/organizations/README.md)**
- **[API Insights](src/tools/organizations/api-insights/README.md)**
- **[Artifact metadata](src/tools/organizations/artifact-metadata/README.md)**
- **[Attestations](src/tools/organizations/artifact-attestations/README.md)**
- **[Blocking users](src/tools/organizations/blocking-users/README.md)**
- **[Custom properties](src/tools/organizations/custom-properties/README.md)**
- **[Issue fields](src/tools/organizations/issue-fields/README.md)**
- **[Issue types](src/tools/organizations/issue-types/README.md)**
- **[Members](src/tools/organizations/members/README.md)**
- **[Network configurations](src/tools/organizations/network-configurations/README.md)**
- **[Organization roles](src/tools/organizations/organization-roles/README.md)**
- **[Outside collaborators](src/tools/organizations/outside-collaborators/README.md)**
- **[Personal access tokens](src/tools/organizations/personal-access-tokens/README.md)**
- **[Rules](src/tools/organizations/rules/README.md)**
- **[Rule suites](src/tools/organizations/rule-suites/README.md)**
- **[Security managers](src/tools/organizations/security-managers/README.md)**
- **[Webhooks](src/tools/organizations/webhooks/README.md)**

### Repositories

- **[Repository tools overview](src/tools/repositories/README.md)**
- **[Contents](src/tools/repositories/contents/README.md)**
- **[Autolinks](src/tools/repositories/autolinks/README.md)**
- **[Custom properties](src/tools/repositories/custom-properties/README.md)**
- **[Forks](src/tools/repositories/forks/README.md)**
- **[Rules](src/tools/repositories/rules/README.md)**
- **[Rule suites](src/tools/repositories/rule-suites/README.md)**
- **[Attestations](src/tools/repositories/attestations/README.md)**
- **[Webhooks](src/tools/repositories/webhooks/README.md)**

### Actions

- **[Artifacts](src/tools/actions/artifacts/README.md)**
- **[Cache](src/tools/actions/cache/README.md)**
- **[Concurrency groups](src/tools/actions/concurrency-groups/README.md)**
- **[GitHub-hosted runners](src/tools/actions/hosted-runners/README.md)**
- **[OIDC](src/tools/actions/oidc/README.md)**
- **[Permissions](src/tools/actions/permissions/README.md)**
- **[Secrets](src/tools/actions/secrets/README.md)**
- **[Self-hosted runner groups](src/tools/actions/runner-groups/README.md)**
- **[Self-hosted runners](src/tools/actions/runners/README.md)**
- **[Variables](src/tools/actions/variables/README.md)**
- **[Workflow jobs](src/tools/actions/workflow-jobs/README.md)**
- **[Workflow runs](src/tools/actions/workflow-runs/README.md)**
- **[Workflows](src/tools/actions/workflows/README.md)**

### Activity

- **[Events](src/tools/activity/events/README.md)**
- **[Feeds](src/tools/activity/feeds/README.md)**
- **[Notifications](src/tools/activity/notifications/README.md)**
- **[Starring](src/tools/activity/starring/README.md)**
- **[Watching](src/tools/activity/watching/README.md)**

### Agent tasks & Agents

- **[Agent tasks](src/tools/agent-tasks/README.md)**
- **[Agents secrets](src/tools/agents/secrets/README.md)**
- **[Agents variables](src/tools/agents/variables/README.md)**

### Apps

- **[GitHub Apps](src/tools/apps/apps/README.md)**
- **[Installations](src/tools/apps/installations/README.md)**
- **[Marketplace](src/tools/apps/marketplace/README.md)**
- **[OAuth authorizations](src/tools/apps/oauth-applications/README.md)**
- **[Webhooks](src/tools/apps/webhooks/README.md)**

### Billing

- **[Billing](src/tools/billing/billing/README.md)**
- **[Budgets](src/tools/billing/budgets/README.md)**
- **[Cost centers](src/tools/billing/cost-centers/README.md)**
- **[Billing usage](src/tools/billing/usage/README.md)**
- **[Usage reports](src/tools/billing/usage-reports/README.md)**

### Branches

- **[Branches](src/tools/branches/branches/README.md)**
- **[Protected branches](src/tools/branches/branch-protection/README.md)**

### Campaigns

- **[Security campaigns](src/tools/campaigns/campaigns/README.md)**

### Checks

- **[Check runs](src/tools/checks/runs/README.md)**
- **[Check suites](src/tools/checks/suites/README.md)**

### Classroom

- **[GitHub Classroom](src/tools/classroom/classroom/README.md)**

### Code quality

- **[Code quality](src/tools/code-quality/code-quality/README.md)**

### Code scanning

- **[Alert dismissal requests](src/tools/code-scanning/alert-dismissal-requests/README.md)**
- **[Code scanning](src/tools/code-scanning/code-scanning/README.md)**

### Code security

- **[Configurations](src/tools/code-security/configurations/README.md)**

### Codes of conduct

- **[Codes of conduct](src/tools/codes-of-conduct/codes-of-conduct/README.md)**

### Codespaces

- **[Codespaces](src/tools/codespaces/codespaces/README.md)**
- **[Organizations](src/tools/codespaces/organizations/README.md)**
- **[Organization secrets](src/tools/codespaces/organization-secrets/README.md)**
- **[Machines](src/tools/codespaces/machines/README.md)**
- **[Repository secrets](src/tools/codespaces/repository-secrets/README.md)**
- **[User secrets](src/tools/codespaces/secrets/README.md)**

### Collaborators

- **[Collaborators](src/tools/collaborators/collaborators/README.md)**
- **[Invitations](src/tools/collaborators/invitations/README.md)**

### Commits

- **[Commits](src/tools/commits/commits/README.md)**
- **[Comments](src/tools/commits/comments/README.md)**
- **[Statuses](src/tools/commits/statuses/README.md)**

### Copilot

- **[Cloud agent repository management](src/tools/copilot/copilot-cloud-agent-management/README.md)**
- **[Cloud agent management](src/tools/copilot/copilot-coding-agent-management/README.md)**
- **[Content exclusion management](src/tools/copilot/copilot-content-exclusion-management/README.md)**
- **[Custom agents](src/tools/copilot/copilot-custom-agents/README.md)**
- **[Usage metrics](src/tools/copilot/copilot-usage-metrics/README.md)**
- **[User management](src/tools/copilot/copilot-user-management/README.md)**

### Copilot Spaces

- **[Collaborators](src/tools/copilot-spaces/collaborators/README.md)**
- **[Copilot Spaces](src/tools/copilot-spaces/copilot-spaces/README.md)**
- **[Resources](src/tools/copilot-spaces/resources/README.md)**

### Credentials

- **[Revocation](src/tools/credentials/revoke/README.md)**

### Dependabot

- **[Alert dismissal requests](src/tools/dependabot/alert-dismissal-requests/README.md)**
- **[Alerts](src/tools/dependabot/alerts/README.md)**
- **[Repository access](src/tools/dependabot/repository-access/README.md)**
- **[Secrets](src/tools/dependabot/secrets/README.md)**

### Dependency graph

- **[Dependency review](src/tools/dependency-graph/dependency-review/README.md)**
- **[Dependency submission](src/tools/dependency-graph/dependency-submission/README.md)**
- **[SBOMs](src/tools/dependency-graph/sboms/README.md)**

### Deploy keys

- **[Deploy keys](src/tools/deploy-keys/deploy-keys/README.md)**

### Deployments

- **[Branch policies](src/tools/deployments/branch-policies/README.md)**
- **[Deployments](src/tools/deployments/deployments/README.md)**
- **[Environments](src/tools/deployments/environments/README.md)**
- **[Protection rules](src/tools/deployments/protection-rules/README.md)**
- **[Statuses](src/tools/deployments/statuses/README.md)**

### Emojis

- **[Emojis](src/tools/emojis/emojis/README.md)**

### Enterprise teams

- **[Enterprise team members](src/tools/enterprise-teams/enterprise-team-members/README.md)**
- **[Enterprise team organizations](src/tools/enterprise-teams/enterprise-team-organizations/README.md)**
- **[Enterprise teams](src/tools/enterprise-teams/enterprise-teams/README.md)**

### Git

- **[Blobs](src/tools/git/blobs/README.md)**
- **[Commits](src/tools/git/commits/README.md)**
- **[Refs](src/tools/git/refs/README.md)**
- **[Tags](src/tools/git/tags/README.md)**
- **[Trees](src/tools/git/trees/README.md)**

### Gitignore

- **[Gitignore](src/tools/gitignore/gitignore/README.md)**

### Interactions

- **[Organization interactions](src/tools/interactions/orgs/README.md)**
- **[Repository interactions](src/tools/interactions/repos/README.md)**
- **[User interactions](src/tools/interactions/user/README.md)**

### Issues

- **[Assignees](src/tools/issues/assignees/README.md)**
- **[Comments](src/tools/issues/comments/README.md)**
- **[Events](src/tools/issues/events/README.md)**
- **[Issue dependencies](src/tools/issues/issue-dependencies/README.md)**
- **[Issue field values](src/tools/issues/issue-field-values/README.md)**
- **[Issues](src/tools/issues/issues/README.md)**
- **[Labels](src/tools/issues/labels/README.md)**
- **[Milestones](src/tools/issues/milestones/README.md)**
- **[Sub-issues](src/tools/issues/sub-issues/README.md)**
- **[Timeline](src/tools/issues/timeline/README.md)**

### Licenses

- **[Licenses](src/tools/licenses/licenses/README.md)**

### Markdown

- **[Markdown](src/tools/markdown/markdown/README.md)**

### Meta

- **[Meta](src/tools/meta/meta/README.md)**

### Metrics

- **[Community](src/tools/metrics/community/README.md)**
- **[Statistics](src/tools/metrics/statistics/README.md)**
- **[Traffic](src/tools/metrics/traffic/README.md)**

### Models

- **[Catalog](src/tools/models/catalog/README.md)**
- **[Embeddings](src/tools/models/embeddings/README.md)**
- **[Inference](src/tools/models/inference/README.md)**

### Packages

- **[Packages](src/tools/packages/packages/README.md)**

### Pages

- **[Pages](src/tools/pages/pages/README.md)**

### Private registries

- **[Organization configurations](src/tools/private-registries/organization-configurations/README.md)**

### Projects

- **[Drafts](src/tools/projects/drafts/README.md)**
- **[Fields](src/tools/projects/fields/README.md)**
- **[Items](src/tools/projects/items/README.md)**


Static MCP tool descriptors (JSON: tool name, description, argument schema) live under [`mcps/user-github-mcp/tools/`](mcps/user-github-mcp/tools/) in the **same subfolders as** `src/tools`, with [`mcps/user-github-mcp/SERVER_METADATA.json`](mcps/user-github-mcp/SERVER_METADATA.json) for server metadata. They mirror the registered tools in `src/index.ts` for clients that consume filesystem-based schemas.

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