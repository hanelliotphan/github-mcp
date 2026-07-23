# Copilot Spaces resources MCP tools

Tool implementations wrap [Copilot Spaces resources](https://docs.github.com/en/rest/copilot-spaces/resources?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_copilot_space_resources` | List resources for an organization Copilot Space (GET /orgs/{org}/copilot-spaces/{space_number}/resources). |
| `github_create_org_copilot_space_resource` | Create a resource for an organization Copilot Space (POST /orgs/{org}/copilot-spaces/{space_number}/resources). |
| `github_get_org_copilot_space_resource` | Get a resource for an organization Copilot Space (GET /orgs/{org}/copilot-spaces/{space_number}/resources/{space_resource_id}). |
| `github_set_org_copilot_space_resource` | Update a resource for an organization Copilot Space (PUT /orgs/{org}/copilot-spaces/{space_number}/resources/{space_resource_id}). |
| `github_delete_org_copilot_space_resource` | Delete a resource from an organization Copilot Space (DELETE /orgs/{org}/copilot-spaces/{space_number}/resources/{space_resource_id}). |
| `github_list_user_copilot_space_resources` | List resources for a user Copilot Space (GET /users/{username}/copilot-spaces/{space_number}/resources). |
| `github_create_user_copilot_space_resource` | Create a resource for a user Copilot Space (POST /users/{username}/copilot-spaces/{space_number}/resources). |
| `github_get_user_copilot_space_resource` | Get a resource for a user Copilot Space (GET /users/{username}/copilot-spaces/{space_number}/resources/{space_resource_id}). |
| `github_set_user_copilot_space_resource` | Update a resource for a user Copilot Space (PUT /users/{username}/copilot-spaces/{space_number}/resources/{space_resource_id}). |
| `github_delete_user_copilot_space_resource` | Delete a resource from a user Copilot Space (DELETE /users/{username}/copilot-spaces/{space_number}/resources/{space_resource_id}). |
