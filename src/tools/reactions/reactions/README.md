# Reactions MCP tools

Tool implementations wrap [REST API endpoints for reactions](https://docs.github.com/en/rest/reactions/reactions?apiVersion=2026-03-10) under **Reactions**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`). Repo parameter: MCP **`name`** → API **`repo`**.

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_commit_comment_reactions` | Page pagination; optional `content` |
| `github_create_commit_comment_reaction` | **200** if already present |
| `github_delete_commit_comment_reaction` | HTTP **204** |
| `github_list_issue_comment_reactions` | Page pagination; optional `content` |
| `github_create_issue_comment_reaction` | **200** if already present |
| `github_delete_issue_comment_reaction` | HTTP **204** |
| `github_list_issue_reactions` | Page pagination; optional `content` |
| `github_create_issue_reaction` | **200** if already present |
| `github_delete_issue_reaction` | HTTP **204** |
| `github_list_pull_request_review_comment_reactions` | Page pagination; optional `content` |
| `github_create_pull_request_review_comment_reaction` | **200** if already present |
| `github_delete_pull_request_review_comment_reaction` | HTTP **204** |
| `github_list_release_reactions` | No `-1` / `confused` content |
| `github_create_release_reaction` | No `-1` / `confused` content |
| `github_delete_release_reaction` | HTTP **204** |
