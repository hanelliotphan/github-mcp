# Search MCP tools

Tool implementations wrap [REST API endpoints for search](https://docs.github.com/en/rest/search/search?apiVersion=2026-03-10) under **Search**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`). Search responses include **`total_count`**, **`incomplete_results`**, and **`items`**. GitHub search returns at most **1,000** results.

## Tools

| Tool | Notes |
| --- | --- |
| `github_search_code` | Auth required; 10 req/min; `sort`/`order` closing down |
| `github_search_commits` | |
| `github_search_issues` | Optional `advanced_search`, `search_type` |
| `github_search_labels` | Requires `repository_id` |
| `github_search_repositories` | |
| `github_search_topics` | |
| `github_search_users` | |
