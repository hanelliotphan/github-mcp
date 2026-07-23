# Copilot Spaces collaborators MCP tools

Tool implementations wrap [Copilot Spaces collaborators](https://docs.github.com/en/rest/copilot-spaces/collaborators?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_copilot_space_collaborators` | List collaborators for an organization Copilot Space (GET /orgs/{org}/copilot-spaces/{space_number}/collaborators). |
| `github_add_org_copilot_space_collaborator` | Add a collaborator to an organization Copilot Space (POST /orgs/{org}/copilot-spaces/{space_number}/collaborators). |
| `github_set_org_copilot_space_collaborator_role` | Set a collaborator role for an organization Copilot Space (PUT /orgs/{org}/copilot-spaces/{space_number}/collaborators/{actor_type}/{actor_identifier}). |
| `github_remove_org_copilot_space_collaborator` | Remove a collaborator from an organization Copilot Space (DELETE /orgs/{org}/copilot-spaces/{space_number}/collaborators/{actor_type}/{actor_identifier}). |
| `github_list_user_copilot_space_collaborators` | List collaborators for a user Copilot Space (GET /users/{username}/copilot-spaces/{space_number}/collaborators). |
| `github_add_user_copilot_space_collaborator` | Add a collaborator to a user Copilot Space (POST /users/{username}/copilot-spaces/{space_number}/collaborators). |
| `github_set_user_copilot_space_collaborator_role` | Set a collaborator role for a user Copilot Space (PUT /users/{username}/copilot-spaces/{space_number}/collaborators/{actor_type}/{actor_identifier}). |
| `github_remove_user_copilot_space_collaborator` | Remove a collaborator from a user Copilot Space (DELETE /users/{username}/copilot-spaces/{space_number}/collaborators/{actor_type}/{actor_identifier}). |
