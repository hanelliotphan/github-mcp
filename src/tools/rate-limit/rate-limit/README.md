# Rate limit MCP tools

Tool implementations wrap [REST API endpoints for rate limits](https://docs.github.com/en/rest/rate-limit/rate-limit?apiVersion=2026-03-10) under **Rate limit**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_rate_limit` | `GET /rate_limit` (does not consume rate limit) |
