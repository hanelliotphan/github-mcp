# Actions cache tools

Tools for interacting with the [GitHub Actions cache](https://docs.github.com/en/rest/actions/cache?apiVersion=2026-03-10) for repositories and organizations.

Response conventions (success/failure envelope, `request_id`, pagination fields) match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Tools

### `github_get_actions_cache_usage_for_repo`

- **Endpoint:** `GET /repos/{owner}/{repo}/actions/cache/usage`
- **Inputs:** `owner`, `name` (repo).
- **Output:** `usage` object (`full_name`, `active_caches_size_in_bytes`, `active_caches_count`).
- **Access:** Anyone with read access; classic tokens need `repo` scope for private repos.

### `github_get_actions_cache_usage_for_org`

- **Endpoint:** `GET /orgs/{org}/actions/cache/usage`
- **Inputs:** `org`.
- **Output:** `usage` object (`total_active_caches_size_in_bytes`, `total_active_caches_count`).
- **Access:** Organization owner; classic tokens need `admin:org` scope.

### `github_get_actions_cache_usage_by_repo_for_org`

- **Endpoint:** `GET /orgs/{org}/actions/cache/usage-by-repository`
- **Inputs:** `org`, plus pagination (`per_page` 1–100 default 100, `page`, `all_pages`, `max_pages`).
- **Output:** `total_count` and `repository_cache_usages` rows (`full_name`, `active_caches_size_in_bytes`, `active_caches_count`).
- **Access:** Organization owner; classic tokens need `admin:org` scope.

### `github_list_actions_caches`

- **Endpoint:** `GET /repos/{owner}/{repo}/actions/caches`
- **Inputs:** `owner`, `name`, optional `ref`, `key`, `sort` (`created_at`|`last_accessed_at`|`size_in_bytes`), `direction` (`asc`|`desc`), plus pagination.
- **Output:** `total_count` and `actions_caches` rows (`id`, `ref`, `key`, `version`, `last_accessed_at`, `created_at`, `size_in_bytes`).
- **Access:** Anyone with read access; classic tokens need `repo` scope for private repos.

### `github_delete_actions_cache_by_key`

- **Endpoint:** `DELETE /repos/{owner}/{repo}/actions/caches?key=`
- **Inputs:** `owner`, `name`, `key`, optional `ref`.
- **Output:** `total_count` and `actions_caches` for the deleted caches.
- **Access:** Classic tokens need `repo` scope.

### `github_delete_actions_cache_by_id`

- **Endpoint:** `DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}`
- **Inputs:** `owner`, `name`, `cache_id`.
- **Output:** Confirmation (HTTP 204 No Content).
- **Access:** Classic tokens need `repo` scope.
