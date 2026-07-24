# Users MCP tools

Tool implementations wrap [Users](https://docs.github.com/en/rest/users/users?apiVersion=2026-03-10) under **Users**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_get_authenticated_user` | `GET /user` |
| `github_update_authenticated_user` | `PATCH /user` |
| `github_get_user_by_id` | `GET /user/{account_id}` |
| `github_list_users` | `GET /users` |
| `github_get_user` | `GET /users/{username}` |
| `github_get_user_hovercard` | `GET /users/{username}/hovercard` |
