# Copilot user management MCP tools

Tool implementations wrap [Copilot user management](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10). They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_org_copilot_billing` | Get Copilot seat information and settings for an organization (GET /orgs/{org}/copilot/billing). |
| `github_list_org_copilot_seats` | List all Copilot seat assignments for an organization (GET /orgs/{org}/copilot/billing/seats). |
| `github_add_org_copilot_seats_for_teams` | Add teams to the Copilot subscription for an organization (POST /orgs/{org}/copilot/billing/selected_teams). |
| `github_remove_org_copilot_seats_for_teams` | Remove teams from the Copilot subscription for an organization (DELETE /orgs/{org}/copilot/billing/selected_teams). |
| `github_add_org_copilot_seats_for_users` | Add users to the Copilot subscription for an organization (POST /orgs/{org}/copilot/billing/selected_users). |
| `github_remove_org_copilot_seats_for_users` | Remove users from the Copilot subscription for an organization (DELETE /orgs/{org}/copilot/billing/selected_users). |
| `github_get_org_copilot_seat_details_for_user` | Get Copilot seat assignment details for a user (GET /orgs/{org}/members/{username}/copilot). |
