# Gitignore MCP tools

Tool implementations wrap [REST API endpoints for gitignore](https://docs.github.com/en/rest/gitignore/gitignore?apiVersion=2026-03-10) under **Gitignore**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_gitignore_templates` | No parameters; returns template name strings |
| `github_get_gitignore_template` | MCP `name` is the template name |
