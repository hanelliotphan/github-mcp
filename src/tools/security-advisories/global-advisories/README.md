# Global advisories MCP tools

Tool implementations wrap [REST API endpoints for global security advisories](https://docs.github.com/en/rest/security-advisories/global-advisories?apiVersion=2026-03-10) under **Security advisories → Global advisories**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_global_security_advisories` | Cursor pagination; optional filters (`ghsa_id`, `type`, `cve_id`, `ecosystem`, `severity`, `cwes`, `affects`, date ranges, EPSS, sort) |
| `github_get_global_security_advisory` | Requires `ghsa_id` |
