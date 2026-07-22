# Branches MCP tools

Tool implementations wrap [REST API endpoints for branches](https://docs.github.com/en/rest/branches/branches?apiVersion=2026-03-10) under **Branches**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_list_repo_branches` | `GET /repos/{owner}/{repo}/branches` | Optional `protected`; page Link pagination |
| `github_get_repo_branch` | `GET /repos/{owner}/{repo}/branches/{branch}` | Branch details |
| `github_rename_repo_branch` | `POST /repos/{owner}/{repo}/branches/{branch}/rename` | Requires `new_name` |
| `github_sync_fork_branch_with_upstream` | `POST /repos/{owner}/{repo}/merge-upstream` | Sync fork branch with upstream |
| `github_merge_repo_branch` | `POST /repos/{owner}/{repo}/merges` | **201** merge commit or **204** already merged |

### `github_list_repo_branches`

Lists branches via [List branches](https://docs.github.com/en/rest/branches/branches?apiVersion=2026-03-10#list-branches).

#### Inputs

- **`owner`**, **`name`** (required)
- **`protected`** (optional)
- **`per_page`**, **`page`**, **`all_pages`**, **`max_pages`** (optional)

#### Output

On success: **`branches`**, **`pagination`**, **`request_id`**. On failure: structured **`error`**.

### `github_get_repo_branch`

[Get a branch](https://docs.github.com/en/rest/branches/branches?apiVersion=2026-03-10#get-a-branch).

### `github_rename_repo_branch`

[Rename a branch](https://docs.github.com/en/rest/branches/branches?apiVersion=2026-03-10#rename-a-branch).

### `github_sync_fork_branch_with_upstream`

[Sync a fork branch with the upstream repository](https://docs.github.com/en/rest/branches/branches?apiVersion=2026-03-10#sync-a-fork-branch-with-the-upstream-repository).

### `github_merge_repo_branch`

[Merge a branch](https://docs.github.com/en/rest/branches/branches?apiVersion=2026-03-10#merge-a-branch). **204** when already merged.
