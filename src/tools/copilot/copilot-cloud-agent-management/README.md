# Copilot cloud agent repository management MCP tools

Tool implementations wrap [Copilot cloud agent repository management](https://docs.github.com/en/rest/copilot/copilot-cloud-agent-management?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_repo_copilot_cloud_agent_configuration` | Get Copilot cloud agent configuration for a repository (GET /repos/{owner}/{repo}/copilot/cloud-agent/configuration). |
