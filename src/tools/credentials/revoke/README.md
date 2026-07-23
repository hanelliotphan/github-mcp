# Credentials revocation MCP tools

Tool implementations wrap [REST API endpoints for credential revocation](https://docs.github.com/en/rest/credentials/revoke?apiVersion=2026-03-10) under **Credentials > Revocation**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_revoke_credentials` | Calls `POST /credentials/revoke` **without** auth (GitHub returns 403 if authenticated). |
