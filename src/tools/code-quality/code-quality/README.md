# Code quality MCP tools

Tool implementations wrap [REST API endpoints for code quality](https://docs.github.com/en/rest/code-quality/code-quality?apiVersion=2026-03-10) under **Code quality**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_list_repo_code_quality_findings` | `GET /repos/{owner}/{repo}/code-quality/findings` | Cursor `before`/`after`; optional `direction`/`state` |
| `github_get_repo_code_quality_finding` | `GET .../findings/{finding_number}` | |
| `github_get_repo_code_quality_setup` | `GET /repos/{owner}/{repo}/code-quality/setup` | |
| `github_update_repo_code_quality_setup` | `PATCH /repos/{owner}/{repo}/code-quality/setup` | **200** or **202** |

### Access

Classic tokens need the `repo` scope (or `public_repo` for public repositories only).
