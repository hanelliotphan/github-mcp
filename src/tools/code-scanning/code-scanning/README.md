# Code scanning MCP tools

Tool implementations wrap [REST API endpoints for code scanning](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10) under **Code scanning**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_org_code_scanning_alerts` | |
| `github_list_repo_code_scanning_alerts` | |
| `github_list_code_scanning_alert_instances` | |
| `github_list_repo_code_scanning_analyses` | |
| `github_get_code_scanning_alert` | |
| `github_update_code_scanning_alert` | |
| `github_get_code_scanning_autofix` | |
| `github_create_code_scanning_autofix` | |
| `github_commit_code_scanning_autofix` | |
| `github_get_code_scanning_analysis` | |
| `github_delete_code_scanning_analysis` | |
| `github_list_codeql_databases` | |
| `github_get_codeql_database` | |
| `github_delete_codeql_database` | |
| `github_create_codeql_variant_analysis` | |
| `github_get_codeql_variant_analysis` | |
| `github_get_codeql_variant_analysis_repo_task` | |
| `github_get_code_scanning_default_setup` | |
| `github_update_code_scanning_default_setup` | |
| `github_upload_code_scanning_sarif` | |
| `github_get_code_scanning_sarif` | |
