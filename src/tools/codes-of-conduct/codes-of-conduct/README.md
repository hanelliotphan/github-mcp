# Codes of conduct MCP tools

Tool implementations wrap [REST API endpoints for codes of conduct](https://docs.github.com/en/rest/codes-of-conduct/codes-of-conduct?apiVersion=2026-03-10) under **Codes of conduct**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_codes_of_conduct` | |
| `github_get_code_of_conduct` | |
