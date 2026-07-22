# Commits MCP tools

Tool implementations wrap [Commits](https://docs.github.com/en/rest/commits/commits?apiVersion=2026-03-10) under **Commits**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_commits` | Optional sha, path, author, committer, since, until filters |
| `github_get_repo_commit` | Optional page/per_page for files pagination |
| `github_compare_repo_commits` | base + head refs; optional page/per_page |
| `github_list_branches_for_head_commit` | |
| `github_list_pull_requests_associated_with_commit` | |
