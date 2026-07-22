# Repository invitations MCP tools

Tool implementations wrap [Repository invitations](https://docs.github.com/en/rest/collaborators/invitations?apiVersion=2026-03-10) under **Collaborators**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_invitations` | |
| `github_update_repo_invitation` | |
| `github_delete_repo_invitation` | |
| `github_list_user_repository_invitations` | |
| `github_accept_repository_invitation` | |
| `github_decline_repository_invitation` | |
