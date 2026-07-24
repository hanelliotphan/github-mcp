# Blocking MCP tools

Tool implementations wrap [Blocking users](https://docs.github.com/en/rest/users/blocking?apiVersion=2026-03-10) under **Users**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_blocked_users` | `GET /user/blocks` |
| `github_check_user_blocked` | `GET /user/blocks/{username}` |
| `github_block_user` | `PUT /user/blocks/{username}` |
| `github_unblock_user` | `DELETE /user/blocks/{username}` |
