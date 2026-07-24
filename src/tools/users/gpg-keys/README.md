# GPG keys MCP tools

Tool implementations wrap [GPG keys](https://docs.github.com/en/rest/users/gpg-keys?apiVersion=2026-03-10) under **Users**.

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_authenticated_user_gpg_keys` | `GET /user/gpg_keys` |
| `github_create_authenticated_user_gpg_key` | `POST /user/gpg_keys` |
| `github_get_authenticated_user_gpg_key` | `GET /user/gpg_keys/{gpg_key_id}` |
| `github_delete_authenticated_user_gpg_key` | `DELETE /user/gpg_keys/{gpg_key_id}` |
| `github_list_user_gpg_keys` | `GET /users/{username}/gpg_keys` |
