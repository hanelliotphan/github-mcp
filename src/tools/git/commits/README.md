# Git commits MCP tools

Tool implementations wrap [Git commits](https://docs.github.com/en/rest/git/commits?apiVersion=2026-03-10) under **Git database** (low-level Git commit objects, not REST Commits). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_create_repo_git_commit` | `POST /repos/{owner}/{repo}/git/commits` |
| `github_get_repo_git_commit` | `GET /repos/{owner}/{repo}/git/commits/{commit_sha}` |
