# Copilot content exclusion management MCP tools

Tool implementations wrap [Copilot content exclusion management](https://docs.github.com/en/rest/copilot/copilot-content-exclusion-management?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_org_copilot_content_exclusion` | Get Copilot content exclusion rules for an organization (GET /orgs/{org}/copilot/content_exclusion). |
| `github_set_org_copilot_content_exclusion` | Set Copilot content exclusion rules for an organization (PUT /orgs/{org}/copilot/content_exclusion). |
