# Code security configurations MCP tools

Tool implementations wrap [REST API endpoints for code security configurations](https://docs.github.com/en/rest/code-security/configurations?apiVersion=2026-03-10) under **Code security > Configurations**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_enterprise_code_security_configurations` | |
| `github_create_enterprise_code_security_configuration` | |
| `github_list_enterprise_code_security_default_configurations` | |
| `github_get_enterprise_code_security_configuration` | |
| `github_update_enterprise_code_security_configuration` | |
| `github_delete_enterprise_code_security_configuration` | |
| `github_attach_enterprise_code_security_configuration` | |
| `github_set_enterprise_code_security_configuration_as_default` | |
| `github_list_enterprise_code_security_configuration_repositories` | |
| `github_list_org_code_security_configurations` | |
| `github_create_org_code_security_configuration` | |
| `github_list_org_code_security_default_configurations` | |
| `github_detach_org_code_security_configurations` | |
| `github_get_org_code_security_configuration` | |
| `github_update_org_code_security_configuration` | |
| `github_delete_org_code_security_configuration` | |
| `github_attach_org_code_security_configuration` | |
| `github_set_org_code_security_configuration_as_default` | |
| `github_list_org_code_security_configuration_repositories` | |
| `github_get_repo_code_security_configuration` | |
