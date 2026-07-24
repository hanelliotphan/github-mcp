# Followers MCP tools

Tool implementations wrap [Followers](https://docs.github.com/en/rest/users/followers?apiVersion=2026-03-10) under **Users**.

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_authenticated_user_followers` | `GET /user/followers` |
| `github_list_authenticated_user_following` | `GET /user/following` |
| `github_check_authenticated_user_follows_user` | `GET /user/following/{username}` |
| `github_follow_user` | `PUT /user/following/{username}` |
| `github_unfollow_user` | `DELETE /user/following/{username}` |
| `github_list_user_followers` | `GET /users/{username}/followers` |
| `github_list_user_following` | `GET /users/{username}/following` |
| `github_check_user_follows_user` | `GET /users/{username}/following/{target_user}` |
