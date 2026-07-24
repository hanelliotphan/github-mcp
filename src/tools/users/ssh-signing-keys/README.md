# SSH signing keys MCP tools

Tool implementations wrap [SSH signing keys](https://docs.github.com/en/rest/users/ssh-signing-keys?apiVersion=2026-03-10) under **Users**.

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_authenticated_user_ssh_signing_keys` | `GET /user/ssh_signing_keys` |
| `github_create_authenticated_user_ssh_signing_key` | `POST /user/ssh_signing_keys` |
| `github_get_authenticated_user_ssh_signing_key` | `GET /user/ssh_signing_keys/{ssh_signing_key_id}` |
| `github_delete_authenticated_user_ssh_signing_key` | `DELETE /user/ssh_signing_keys/{ssh_signing_key_id}` |
| `github_list_user_ssh_signing_keys` | `GET /users/{username}/ssh_signing_keys` |
