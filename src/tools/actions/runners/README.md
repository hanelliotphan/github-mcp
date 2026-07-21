# Actions self-hosted runners tools

Tools for managing [self-hosted runners](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10) for GitHub Actions at the organization and repository levels.

Organization tools require the authenticated user to have admin access; classic OAuth apps and PATs need the `admin:org` scope. Repository tools require admin access to the repository; classic tokens need the `repo` scope. List endpoints support pagination (`per_page` 1–100 default 100, `page`, `all_pages`, `max_pages`). Registration/remove/JIT tokens are returned by `POST` endpoints (HTTP `201`); `delete` returns `204`. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Organization

| Tool | Endpoint |
| --- | --- |
| `github_list_self_hosted_runners_for_org` | `GET /orgs/{org}/actions/runners` |
| `github_list_runner_applications_for_org` | `GET /orgs/{org}/actions/runners/downloads` |
| `github_generate_runner_jitconfig_for_org` | `POST /orgs/{org}/actions/runners/generate-jitconfig` |
| `github_create_registration_token_for_org` | `POST /orgs/{org}/actions/runners/registration-token` |
| `github_create_remove_token_for_org` | `POST /orgs/{org}/actions/runners/remove-token` |
| `github_get_self_hosted_runner_for_org` | `GET /orgs/{org}/actions/runners/{runner_id}` |
| `github_delete_self_hosted_runner_from_org` | `DELETE /orgs/{org}/actions/runners/{runner_id}` |
| `github_list_labels_for_self_hosted_runner_for_org` | `GET …/runners/{runner_id}/labels` |
| `github_add_custom_labels_to_self_hosted_runner_for_org` | `POST …/runners/{runner_id}/labels` |
| `github_set_custom_labels_for_self_hosted_runner_for_org` | `PUT …/runners/{runner_id}/labels` |
| `github_remove_all_custom_labels_from_self_hosted_runner_for_org` | `DELETE …/runners/{runner_id}/labels` |
| `github_remove_custom_label_from_self_hosted_runner_for_org` | `DELETE …/runners/{runner_id}/labels/{name}` |

## Repository

| Tool | Endpoint |
| --- | --- |
| `github_list_self_hosted_runners_for_repo` | `GET /repos/{owner}/{repo}/actions/runners` |
| `github_list_runner_applications_for_repo` | `GET /repos/{owner}/{repo}/actions/runners/downloads` |
| `github_generate_runner_jitconfig_for_repo` | `POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig` |
| `github_create_registration_token_for_repo` | `POST /repos/{owner}/{repo}/actions/runners/registration-token` |
| `github_create_remove_token_for_repo` | `POST /repos/{owner}/{repo}/actions/runners/remove-token` |
| `github_get_self_hosted_runner_for_repo` | `GET /repos/{owner}/{repo}/actions/runners/{runner_id}` |
| `github_delete_self_hosted_runner_from_repo` | `DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}` |
| `github_list_labels_for_self_hosted_runner_for_repo` | `GET …/runners/{runner_id}/labels` |
| `github_add_custom_labels_to_self_hosted_runner_for_repo` | `POST …/runners/{runner_id}/labels` |
| `github_set_custom_labels_for_self_hosted_runner_for_repo` | `PUT …/runners/{runner_id}/labels` |
| `github_remove_all_custom_labels_from_self_hosted_runner_for_repo` | `DELETE …/runners/{runner_id}/labels` |
| `github_remove_custom_label_from_self_hosted_runner_for_repo` | `DELETE …/runners/{runner_id}/labels/{label_name}` |
