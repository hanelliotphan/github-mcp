# Check suites MCP tools

Tool implementations wrap [REST API endpoints for check suites](https://docs.github.com/en/rest/checks/suites?apiVersion=2026-03-10) under **Checks**. They are registered from `src/index.ts`.

Creating/rerequesting check suites requires a **GitHub App**. Setting preferences requires repository admin.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_create_check_suite` | `POST /repos/{owner}/{repo}/check-suites` | **200** existing / **201** created |
| `github_set_check_suites_preferences` | `PATCH /repos/{owner}/{repo}/check-suites/preferences` | Admin; `auto_trigger_checks` |
| `github_get_check_suite` | `GET /repos/{owner}/{repo}/check-suites/{check_suite_id}` | |
| `github_rerequest_check_suite` | `POST .../check-suites/{check_suite_id}/rerequest` | GitHub App |
| `github_list_check_suites_for_ref` | `GET .../commits/{ref}/check-suites` | Optional `app_id`/`check_name`; pagination |
