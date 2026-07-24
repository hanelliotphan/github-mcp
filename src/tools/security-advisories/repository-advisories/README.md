# Repository advisories MCP tools

Tool implementations wrap [REST API endpoints for repository security advisories](https://docs.github.com/en/rest/security-advisories/repository-advisories?apiVersion=2026-03-10) under **Security advisories → Repository advisories**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_repository_security_advisories` | Cursor pagination; optional `direction`, `sort`, `state` |
| `github_list_repo_security_advisories` | Cursor pagination; optional `direction`, `sort`, `state` |
| `github_create_repo_security_advisory` | Requires `summary`, `description`, `vulnerabilities` (min 1) |
| `github_create_private_vulnerability_report` | Requires `summary`, `description` |
| `github_get_repo_security_advisory` | Requires `ghsa_id` |
| `github_update_repo_security_advisory` | Optional body fields; `state`, `collaborating_users`, `collaborating_teams` |
| `github_request_repo_security_advisory_cve` | Returns **202 Accepted** |
| `github_create_repo_security_advisory_temporary_fork` | Returns **202 Accepted** |
