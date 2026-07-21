# Actions workflow jobs tools

Tools for viewing [workflow jobs](https://docs.github.com/en/rest/actions/workflow-jobs?apiVersion=2026-03-10) in GitHub Actions. A workflow job is a set of steps that execute on the same runner.

Anyone with read access to the repository can use these tools; classic OAuth apps and PATs need the **`repo`** scope for private repositories. The log download tool returns the HTTP `302` `Location` URL (expires after 1 minute) without downloading. List endpoints support pagination (`per_page`, `page`, `all_pages`, `max_pages`). Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_get_job_for_workflow_run` | `GET /repos/{owner}/{repo}/actions/jobs/{job_id}` |
| `github_download_job_logs_for_workflow_run` | `GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs` |
| `github_list_jobs_for_workflow_run_attempt` | `GET …/runs/{run_id}/attempts/{attempt_number}/jobs` |
| `github_list_jobs_for_workflow_run` | `GET …/runs/{run_id}/jobs` |
