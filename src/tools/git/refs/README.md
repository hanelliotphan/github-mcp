# Git refs MCP tools

Tool implementations wrap [Git references](https://docs.github.com/en/rest/git/refs?apiVersion=2026-03-10) under **Git database**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_repo_git_matching_refs` | `GET /repos/{owner}/{repo}/git/matching-refs/{ref}` |
| `github_get_repo_git_ref` | `GET /repos/{owner}/{repo}/git/ref/{ref}` |
| `github_create_repo_git_ref` | `POST /repos/{owner}/{repo}/git/refs` |
| `github_update_repo_git_ref` | `PATCH /repos/{owner}/{repo}/git/refs/{ref}` |
| `github_delete_repo_git_ref` | `DELETE /repos/{owner}/{repo}/git/refs/{ref}` |
