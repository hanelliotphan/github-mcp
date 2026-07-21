# Actions workflows tools

Tools for viewing and managing [workflows](https://docs.github.com/en/rest/actions/workflows?apiVersion=2026-03-10) in GitHub Actions. A workflow is a configurable automated process made up of one or more jobs.

Read tools work for anyone with read access; classic OAuth apps and PATs need the **`repo`** scope for private repositories. Write tools (enable, disable, dispatch) require the **`repo`** scope. Every `workflow_id` argument accepts either the numeric id or the workflow file name (e.g. `main.yaml`). The list endpoint supports pagination (`per_page`, `page`, `all_pages`, `max_pages`) and returns `total_count` and `workflows`. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_list_repo_workflows` | `GET /repos/{owner}/{repo}/actions/workflows` |
| `github_get_workflow` | `GET …/workflows/{workflow_id}` |
| `github_disable_workflow` | `PUT …/workflows/{workflow_id}/disable` |
| `github_create_workflow_dispatch` | `POST …/workflows/{workflow_id}/dispatches` |
| `github_enable_workflow` | `PUT …/workflows/{workflow_id}/enable` |
| `github_get_workflow_usage` | `GET …/workflows/{workflow_id}/timing` |
