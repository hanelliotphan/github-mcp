# Copilot Spaces MCP tools

Tool implementations wrap [Copilot Spaces](https://docs.github.com/en/rest/copilot-spaces/copilot-spaces?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_copilot_spaces` | List organization Copilot Spaces (GET /orgs/{org}/copilot-spaces). Cursor pagination. |
| `github_create_org_copilot_space` | Create an organization Copilot Space (POST /orgs/{org}/copilot-spaces). |
| `github_get_org_copilot_space` | Get an organization Copilot Space (GET /orgs/{org}/copilot-spaces/{space_number}). |
| `github_set_org_copilot_space` | Update an organization Copilot Space (PUT /orgs/{org}/copilot-spaces/{space_number}). |
| `github_delete_org_copilot_space` | Delete an organization Copilot Space (DELETE /orgs/{org}/copilot-spaces/{space_number}). |
| `github_list_user_copilot_spaces` | List Copilot Spaces for a user (GET /users/{username}/copilot-spaces). Cursor pagination. |
| `github_create_user_copilot_space` | Create a Copilot Space for a user (POST /users/{username}/copilot-spaces). |
| `github_get_user_copilot_space` | Get a Copilot Space for a user (GET /users/{username}/copilot-spaces/{space_number}). |
| `github_set_user_copilot_space` | Update a Copilot Space for a user (PUT /users/{username}/copilot-spaces/{space_number}). |
| `github_delete_user_copilot_space` | Delete a Copilot Space for a user (DELETE /users/{username}/copilot-spaces/{space_number}). |
