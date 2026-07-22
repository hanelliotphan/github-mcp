# Copilot custom agents MCP tools

Tool implementations wrap [Copilot custom agents](https://docs.github.com/en/rest/copilot/copilot-custom-agents?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_enterprise_copilot_custom_agents` | List custom agents for an enterprise (GET /enterprises/{enterprise}/copilot/custom-agents). |
| `github_get_enterprise_copilot_custom_agents_source` | Get the source organization for custom agents in an enterprise (GET /enterprises/{enterprise}/copilot/custom-agents/source). |
| `github_set_enterprise_copilot_custom_agents_source` | Set the source organization for custom agents in an enterprise (PUT /enterprises/{enterprise}/copilot/custom-agents/source). |
| `github_delete_enterprise_copilot_custom_agents_source` | Delete the custom agents source for an enterprise (DELETE /enterprises/{enterprise}/copilot/custom-agents/source). |
