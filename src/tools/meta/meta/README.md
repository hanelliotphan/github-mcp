# Meta MCP tools

Tool implementations wrap [REST API endpoints for meta data](https://docs.github.com/en/rest/meta/meta?apiVersion=2026-03-10) under **Meta**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_api_root` | Hypermedia links (`GET /`) |
| `github_get_meta` | IP ranges and domains (`GET /meta`) |
| `github_get_octocat` | Optional speech text `s` |
| `github_list_api_versions` | Supported API version dates |
| `github_get_zen` | Random Zen of GitHub sentence |
