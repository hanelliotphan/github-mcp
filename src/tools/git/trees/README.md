# Git trees MCP tools

Tool implementations wrap [Git trees](https://docs.github.com/en/rest/git/trees?apiVersion=2026-03-10) under **Git database**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_create_repo_git_tree` | `POST /repos/{owner}/{repo}/git/trees` |
| `github_get_repo_git_tree` | `GET /repos/{owner}/{repo}/git/trees/{tree_sha}` |
