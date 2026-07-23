# Deployment protection rules MCP tools

Tool implementations wrap [REST API endpoints for protection-rules](https://docs.github.com/en/rest/deployments/protection-rules?apiVersion=2026-03-10) under **Deployments**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_environment_deployment_protection_rules` | No pagination; returns `total_count` + `custom_deployment_protection_rules` |
| `github_create_repo_environment_deployment_protection_rule` | Required `integration_id` |
| `github_list_repo_environment_available_deployment_protection_rule_apps` | Pagination; returns `total_count` + `available_custom_deployment_protection_rule_integrations` |
| `github_get_repo_environment_deployment_protection_rule` | — |
| `github_delete_repo_environment_deployment_protection_rule` | HTTP **204** via `disableDeploymentProtectionRule` |
