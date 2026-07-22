# Check runs MCP tools

Tool implementations wrap [REST API endpoints for check runs](https://docs.github.com/en/rest/checks/runs?apiVersion=2026-03-10) under **Checks**. They are registered from `src/index.ts`.

Creating/updating/rerequesting check runs requires a **GitHub App**. OAuth apps and users can view check runs.

MCP `name` is the repository; use `check_name` for the check run title (API `name`).

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_create_check_run` | `POST /repos/{owner}/{repo}/check-runs` |
| `github_get_check_run` | `GET /repos/{owner}/{repo}/check-runs/{check_run_id}` |
| `github_update_check_run` | `PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}` |
| `github_list_check_run_annotations` | `GET .../check-runs/{check_run_id}/annotations` |
| `github_rerequest_check_run` | `POST .../check-runs/{check_run_id}/rerequest` |
| `github_list_check_runs_for_suite` | `GET .../check-suites/{check_suite_id}/check-runs` |
| `github_list_check_runs_for_ref` | `GET .../commits/{ref}/check-runs` |
