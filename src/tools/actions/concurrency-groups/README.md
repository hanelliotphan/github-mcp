# Actions concurrency groups tools

Tools for viewing [GitHub Actions concurrency groups](https://docs.github.com/en/rest/actions/concurrency-groups?apiVersion=2026-03-10), which ensure only a single job or workflow using the same group runs at a time.

These endpoints are not yet exposed by the Octokit REST client, so the tools call them through `octokit.request(...)` with the raw route templates.

Response conventions (success/failure envelope, `request_id`, pagination fields) match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Tools

### `github_list_concurrency_groups_for_repo`

- **Endpoint:** `GET /repos/{owner}/{repo}/actions/concurrency_groups`
- **Inputs:** `owner`, `name`, plus cursor pagination (`per_page` 1–100 default 100, `after`, `all_pages`, `max_pages`).
- **Output:** `total_count` and `concurrency_groups` rows (`group_name`, `group_url`, `last_acquired_at`).
- **Access:** Anyone with read access; classic tokens need `repo` scope for private repos.

### `github_get_concurrency_group`

- **Endpoint:** `GET /repos/{owner}/{repo}/actions/concurrency_groups/{concurrency_group_name}`
- **Inputs:** `owner`, `name`, `concurrency_group_name`, optional `ahead_of_run` or `ahead_of_job` (mutually exclusive).
- **Output:** `concurrency_group` object (`group_name`, `group_url`, `total_count`, `group_members`). Returns 404 if the group is inactive or does not exist.
- **Access:** Anyone with read access; classic tokens need `repo` scope for private repos.

### `github_list_concurrency_groups_for_workflow_run`

- **Endpoint:** `GET /repos/{owner}/{repo}/actions/runs/{run_id}/concurrency_groups`
- **Inputs:** `owner`, `name`, `run_id`, plus cursor pagination (`per_page` 1–100 default 100, `before`, `after`, `all_pages`, `max_pages`).
- **Output:** `total_count` and `concurrency_groups` rows (`group_name`, `group_url`, `group_members`). Groups derived from run configuration are included even with empty `group_members`.
- **Access:** Anyone with read access; classic tokens need `repo` scope for private repos.
