# Git tags MCP tools

Tool implementations wrap [Git tags](https://docs.github.com/en/rest/git/tags?apiVersion=2026-03-10) under **Git database** (annotated tag objects, not refs). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_create_repo_git_tag` | `POST /repos/{owner}/{repo}/git/tags` |
| `github_get_repo_git_tag` | `GET /repos/{owner}/{repo}/git/tags/{tag_sha}` |
