# Repository statistics MCP tools

Tool implementations wrap [REST API endpoints for repository statistics](https://docs.github.com/en/rest/metrics/statistics?apiVersion=2026-03-10) under **Metrics → Statistics**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

Several endpoints may return **202** while stats compute in the background — treat that as success with a null payload and retry.

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_repo_code_frequency_stats` | Weekly additions/deletions; **422** if 10k+ commits |
| `github_get_repo_commit_activity_stats` | Last year by week |
| `github_get_repo_contributors_stats` | Per-contributor totals and weeks |
| `github_get_repo_participation_stats` | Owner vs all weekly counts |
| `github_get_repo_punch_card_stats` | Hourly counts by weekday |
