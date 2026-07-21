# Actions workflow runs tools

Tools for viewing and managing [workflow runs](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10) in GitHub Actions. A workflow run is an instance of a workflow that runs when the workflow's triggering event occurs.

Read tools work for anyone with read access; classic OAuth apps and PATs need the **`repo`** scope for private repositories. Write tools (re-run, cancel, approve, delete, review deployments) require write access and the **`repo`** scope. Log download tools return the HTTP `302` `Location` URL (expires after 1 minute) without downloading. List endpoints support pagination (`per_page`, `page`, `all_pages`, `max_pages`) and return `total_count` and `workflow_runs`. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_list_workflow_runs_for_repo` | `GET /repos/{owner}/{repo}/actions/runs` |
| `github_get_workflow_run` | `GET …/runs/{run_id}` |
| `github_delete_workflow_run` | `DELETE …/runs/{run_id}` |
| `github_get_reviews_for_workflow_run` | `GET …/runs/{run_id}/approvals` |
| `github_approve_workflow_run` | `POST …/runs/{run_id}/approve` |
| `github_get_workflow_run_attempt` | `GET …/runs/{run_id}/attempts/{attempt_number}` |
| `github_download_workflow_run_attempt_logs` | `GET …/runs/{run_id}/attempts/{attempt_number}/logs` |
| `github_cancel_workflow_run` | `POST …/runs/{run_id}/cancel` |
| `github_review_custom_gates_for_workflow_run` | `POST …/runs/{run_id}/deployment_protection_rule` |
| `github_force_cancel_workflow_run` | `POST …/runs/{run_id}/force-cancel` |
| `github_download_workflow_run_logs` | `GET …/runs/{run_id}/logs` |
| `github_delete_workflow_run_logs` | `DELETE …/runs/{run_id}/logs` |
| `github_get_pending_deployments_for_workflow_run` | `GET …/runs/{run_id}/pending_deployments` |
| `github_review_pending_deployments_for_workflow_run` | `POST …/runs/{run_id}/pending_deployments` |
| `github_re_run_workflow` | `POST …/runs/{run_id}/rerun` |
| `github_re_run_workflow_failed_jobs` | `POST …/runs/{run_id}/rerun-failed-jobs` |
| `github_re_run_job_for_workflow_run` | `POST …/jobs/{job_id}/rerun` |
| `github_get_workflow_run_usage` | `GET …/runs/{run_id}/timing` |
| `github_list_workflow_runs` | `GET …/workflows/{workflow_id}/runs` |
