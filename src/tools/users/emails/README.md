# Emails MCP tools

Tool implementations wrap [Emails](https://docs.github.com/en/rest/users/emails?apiVersion=2026-03-10) under **Users**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_set_authenticated_user_email_visibility` | `PATCH /user/email/visibility` |
| `github_list_authenticated_user_emails` | `GET /user/emails` |
| `github_add_authenticated_user_emails` | `POST /user/emails` |
| `github_delete_authenticated_user_emails` | `DELETE /user/emails` |
| `github_list_authenticated_user_public_emails` | `GET /user/public_emails` |
