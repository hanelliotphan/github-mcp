# Events MCP tools

Tool implementations wrap [REST API endpoints for events](https://docs.github.com/en/rest/issues/events?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_issue_events` | |
| `github_get_issue_event` | |
| `github_list_issue_events` | |
