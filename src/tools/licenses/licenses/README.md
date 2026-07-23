# Licenses MCP tools

Tool implementations wrap [REST API endpoints for licenses](https://docs.github.com/en/rest/licenses/licenses?apiVersion=2026-03-10) under **Licenses**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_commonly_used_licenses` | Optional `featured`; pagination |
| `github_get_license` | SPDX-style `license` key |
| `github_get_repo_license` | Optional `ref`; returns detected license file |
