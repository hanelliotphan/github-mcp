# Organization private registries MCP tools

Tool implementations wrap [REST API endpoints for organization private registry configurations](https://docs.github.com/en/rest/private-registries/organization-configurations?apiVersion=2026-03-10) under **Private registries → Organization configurations**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

Create/update accept plaintext **`value`** (LibSodium-encrypted via the org public key) or pre-encrypted **`encrypted_value`** + **`key_id`**.

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_private_registries` | `total_count` + `configurations`; pagination |
| `github_create_org_private_registry` | Optional auto-encrypt `value` |
| `github_get_org_private_registries_public_key` | For manual encryption |
| `github_get_org_private_registry` | By `secret_name` |
| `github_update_org_private_registry` | PATCH; **204** |
| `github_delete_org_private_registry` | **204** |
