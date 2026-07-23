# Git blobs MCP tools

Tool implementations wrap [Git blobs](https://docs.github.com/en/rest/git/blobs?apiVersion=2026-03-10) under **Git database**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_create_repo_git_blob` | `POST /repos/{owner}/{repo}/git/blobs` |
| `github_get_repo_git_blob` | `GET /repos/{owner}/{repo}/git/blobs/{file_sha}` |
