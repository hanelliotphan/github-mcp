# GitHub Pages MCP tools

Tool implementations wrap [REST API endpoints for GitHub Pages](https://docs.github.com/en/rest/pages/pages?apiVersion=2026-03-10) under **Pages**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Octokit method |
| --- | --- |
| `github_get_repo_pages` | `getPages` |
| `github_create_repo_pages_site` | `createPagesSite` |
| `github_update_repo_pages_site` | `updateInformationAboutPagesSite` |
| `github_delete_repo_pages_site` | `deletePagesSite` |
| `github_list_repo_pages_builds` | `listPagesBuilds` |
| `github_request_repo_pages_build` | `requestPagesBuild` |
| `github_get_latest_repo_pages_build` | `getLatestPagesBuild` |
| `github_get_repo_pages_build` | `getPagesBuild` |
| `github_create_repo_pages_deployment` | `createPagesDeployment` |
| `github_get_repo_pages_deployment` | `getPagesDeployment` |
| `github_cancel_repo_pages_deployment` | `cancelPagesDeployment` |
| `github_get_repo_pages_health_check` | `getPagesHealthCheck` |
