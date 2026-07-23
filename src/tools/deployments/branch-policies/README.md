# Deployment branch policies MCP tools

Tool implementations wrap [REST API endpoints for branch-policies](https://docs.github.com/en/rest/deployments/branch-policies?apiVersion=2026-03-10) under **Deployments**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_environment_deployment_branch_policies` | `per_page` / `page` / `all_pages` / `max_pages`; returns `total_count` + `branch_policies` |
| `github_create_repo_environment_deployment_branch_policy` | Required `policy_name`; optional `type` (`branch`|`tag`) |
| `github_get_repo_environment_deployment_branch_policy` | — |
| `github_update_repo_environment_deployment_branch_policy` | Required `policy_name` |
| `github_delete_repo_environment_deployment_branch_policy` | HTTP **204** |
