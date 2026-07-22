# Copilot coding agent management MCP tools

Tool implementations wrap [Copilot coding agent management](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_set_enterprise_copilot_coding_agent_policy` | Set the Copilot cloud agent policy for an enterprise (PUT /enterprises/{enterprise}/copilot/policies/coding_agent). |
| `github_add_enterprise_copilot_coding_agent_organizations` | Add organizations to the enterprise Copilot cloud agent policy (POST /enterprises/{enterprise}/copilot/policies/coding_agent/organizations). |
| `github_remove_enterprise_copilot_coding_agent_organizations` | Remove organizations from the enterprise Copilot cloud agent policy (DELETE /enterprises/{enterprise}/copilot/policies/coding_agent/organizations). |
| `github_get_org_copilot_coding_agent_permissions` | Get Copilot cloud agent repository permissions for an organization (GET /orgs/{org}/copilot/coding-agent/permissions). |
| `github_set_org_copilot_coding_agent_permissions` | Set Copilot cloud agent repository permissions for an organization (PUT /orgs/{org}/copilot/coding-agent/permissions). |
| `github_list_org_copilot_coding_agent_repositories` | List repositories enabled for Copilot cloud agent in an organization (GET /orgs/{org}/copilot/coding-agent/permissions/repositories). |
| `github_set_org_copilot_coding_agent_repositories` | Replace selected repositories enabled for Copilot cloud agent (PUT /orgs/{org}/copilot/coding-agent/permissions/repositories). |
| `github_enable_org_copilot_coding_agent_repository` | Enable a repository for Copilot cloud agent in an organization (PUT /orgs/{org}/copilot/coding-agent/permissions/repositories/{repository_id}). |
| `github_disable_org_copilot_coding_agent_repository` | Disable a repository for Copilot cloud agent in an organization (DELETE /orgs/{org}/copilot/coding-agent/permissions/repositories/{repository_id}). |
