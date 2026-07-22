# Commit statuses MCP tools

Tool implementations wrap [Commit statuses](https://docs.github.com/en/rest/commits/statuses?apiVersion=2026-03-10) under **Statuses**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_combined_commit_status` | page/per_page only (no all_pages) |
| `github_list_commit_statuses` | |
| `github_create_commit_status` | state required; sha param (not ref) |
