# Actions self-hosted runner groups tools

Tools for managing [self-hosted runner groups](https://docs.github.com/en/rest/actions/self-hosted-runner-groups?apiVersion=2026-03-10) for GitHub Actions at the organization level.

All tools require the authenticated user to be an organization owner; classic OAuth apps and PATs need the `admin:org` scope. `create` returns HTTP `201`, `get`/`update` return `200`, and all `delete`/`set`/`add`/`remove` tools return `204`. Because the current Octokit release does not expose these operations as typed methods, the tools call the REST API directly via `octokit.request`. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_list_self_hosted_runner_groups_for_org` | `GET /orgs/{org}/actions/runner-groups` |
| `github_create_self_hosted_runner_group_for_org` | `POST /orgs/{org}/actions/runner-groups` |
| `github_get_self_hosted_runner_group_for_org` | `GET …/runner-groups/{runner_group_id}` |
| `github_update_self_hosted_runner_group_for_org` | `PATCH …/runner-groups/{runner_group_id}` |
| `github_delete_self_hosted_runner_group_from_org` | `DELETE …/runner-groups/{runner_group_id}` |
| `github_list_github_hosted_runners_in_group_for_org` | `GET …/runner-groups/{runner_group_id}/hosted-runners` |
| `github_list_repo_access_to_self_hosted_runner_group_in_org` | `GET …/runner-groups/{runner_group_id}/repositories` |
| `github_set_repo_access_to_self_hosted_runner_group_in_org` | `PUT …/runner-groups/{runner_group_id}/repositories` |
| `github_add_repo_access_to_self_hosted_runner_group_in_org` | `PUT …/runner-groups/{runner_group_id}/repositories/{repository_id}` |
| `github_remove_repo_access_to_self_hosted_runner_group_in_org` | `DELETE …/runner-groups/{runner_group_id}/repositories/{repository_id}` |
| `github_list_self_hosted_runners_in_group_for_org` | `GET …/runner-groups/{runner_group_id}/runners` |
| `github_set_self_hosted_runners_in_group_for_org` | `PUT …/runner-groups/{runner_group_id}/runners` |
| `github_add_self_hosted_runner_to_group_for_org` | `PUT …/runner-groups/{runner_group_id}/runners/{runner_id}` |
| `github_remove_self_hosted_runner_from_group_for_org` | `DELETE …/runner-groups/{runner_group_id}/runners/{runner_id}` |
