# Timeline MCP tools

Tool implementations wrap [REST API endpoints for timeline](https://docs.github.com/en/rest/issues/timeline?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_issue_timeline_events` | |
