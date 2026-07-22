# Security campaigns MCP tools

Tool implementations wrap [REST API endpoints for security campaigns](https://docs.github.com/en/rest/campaigns/campaigns?apiVersion=2026-03-10) under **Campaigns**. They are registered from `src/index.ts`.

These endpoints only interact with **published** campaigns (drafts are not available via the API).

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_list_org_campaigns` | `GET /orgs/{org}/campaigns` | Optional `direction`/`state`/`sort`; page Link pagination |
| `github_create_org_campaign` | `POST /orgs/{org}/campaigns` | Requires `name`, `description`, `ends_at` |
| `github_get_org_campaign` | `GET /orgs/{org}/campaigns/{campaign_number}` | Campaign summary |
| `github_update_org_campaign` | `PATCH /orgs/{org}/campaigns/{campaign_number}` | Optional name, managers, state, etc. |
| `github_delete_org_campaign` | `DELETE /orgs/{org}/campaigns/{campaign_number}` | **204** on success |

### Access

Organization **owner** or **security manager**. Classic PATs need the `security_events` scope.
