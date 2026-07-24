# Git SSH keys MCP tools

Tool implementations wrap [Git SSH keys](https://docs.github.com/en/rest/users/keys?apiVersion=2026-03-10) under **Users**.

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_authenticated_user_public_ssh_keys` | `GET /user/keys` |
| `github_create_authenticated_user_public_ssh_key` | `POST /user/keys` |
| `github_get_authenticated_user_public_ssh_key` | `GET /user/keys/{key_id}` |
| `github_delete_authenticated_user_public_ssh_key` | `DELETE /user/keys/{key_id}` |
| `github_list_user_public_keys` | `GET /users/{username}/keys` |
