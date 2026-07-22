# Commit comments MCP tools

Tool implementations wrap [Commit comments](https://docs.github.com/en/rest/commits/comments?apiVersion=2026-03-10) under **Comments**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_commit_comments` | |
| `github_get_commit_comment` | |
| `github_update_commit_comment` | body required |
| `github_delete_commit_comment` | HTTP 204 |
| `github_list_commit_comments` | |
| `github_create_commit_comment` | body required; optional path, position, line |
