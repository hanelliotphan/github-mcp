# GitHub-hosted runners tools

Tools for interacting with [GitHub-hosted runners](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10) in an organization, including custom runner images.

Most of these endpoints require the authenticated user to be an organization owner; classic OAuth apps and PATs need the `manage_runners:org` scope. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Runners

| Tool | Endpoint |
| --- | --- |
| `github_list_hosted_runners_for_org` | `GET /orgs/{org}/actions/hosted-runners` |
| `github_create_hosted_runner_for_org` | `POST /orgs/{org}/actions/hosted-runners` |
| `github_get_hosted_runner_for_org` | `GET /orgs/{org}/actions/hosted-runners/{hosted_runner_id}` |
| `github_update_hosted_runner_for_org` | `PATCH /orgs/{org}/actions/hosted-runners/{hosted_runner_id}` |
| `github_delete_hosted_runner_for_org` | `DELETE /orgs/{org}/actions/hosted-runners/{hosted_runner_id}` (202 Accepted) |

## Images and specs

| Tool | Endpoint |
| --- | --- |
| `github_get_hosted_runners_github_owned_images_for_org` | `GET /orgs/{org}/actions/hosted-runners/images/github-owned` |
| `github_get_hosted_runners_partner_images_for_org` | `GET /orgs/{org}/actions/hosted-runners/images/partner` |
| `github_get_hosted_runners_limits_for_org` | `GET /orgs/{org}/actions/hosted-runners/limits` |
| `github_get_hosted_runners_machine_specs_for_org` | `GET /orgs/{org}/actions/hosted-runners/machine-sizes` |
| `github_get_hosted_runners_platforms_for_org` | `GET /orgs/{org}/actions/hosted-runners/platforms` |

## Custom images

| Tool | Endpoint |
| --- | --- |
| `github_list_custom_images_for_org` | `GET /orgs/{org}/actions/hosted-runners/images/custom` |
| `github_get_custom_image_for_org` | `GET …/images/custom/{image_definition_id}` |
| `github_delete_custom_image_from_org` | `DELETE …/images/custom/{image_definition_id}` (204) |
| `github_list_custom_image_versions_for_org` | `GET …/images/custom/{image_definition_id}/versions` |
| `github_get_custom_image_version_for_org` | `GET …/images/custom/{image_definition_id}/versions/{version}` |
| `github_delete_custom_image_version_from_org` | `DELETE …/images/custom/{image_definition_id}/versions/{version}` (204) |

The list endpoint (`github_list_hosted_runners_for_org`) supports page-based pagination (`per_page` 1–100 default 100, `page`, `all_pages`, `max_pages`). The image/spec list endpoints return a `total_count` plus an array without pagination parameters.
