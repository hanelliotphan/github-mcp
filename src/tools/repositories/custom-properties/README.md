# Repository custom properties MCP tools

Tool implementations in this folder wrap [GitHub REST repository custom properties](https://docs.github.com/en/rest/repos/custom-properties?apiVersion=2026-03-10) endpoints. They are registered from `src/index.ts`. Responses use the same shared shape as other repository tools: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope (see the parent [../README.md](../README.md) for general conventions).

## Tools

- [`github_get_repo_custom_property_values`](README.md#github_get_repo_custom_property_values)
- [`github_create_update_repo_custom_property_values`](README.md#github_create_update_repo_custom_property_values)

---

### `github_get_repo_custom_property_values`

Lists custom property names and values assigned to a repository via [Get all custom property values for a repository](https://docs.github.com/en/rest/repos/custom-properties?apiVersion=2026-03-10#get-all-custom-property-values-for-a-repository) (`GET /repos/{owner}/{repo}/properties/values`). Applies to properties defined by the **owning organization**; see GitHub’s docs on [managing custom properties for repositories](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization). **Users with read access** to the repository may use this endpoint.

#### Inputs

- `owner` (required), `name` (required)

#### Output

On success: **`property_values`** — array of `{ property_name, value }` where **`value`** is a string, array of strings, or `null` per GitHub’s schema — plus **`request_id`**. On failure: structured **`error`** (e.g. **403**, **404**).

### `github_create_update_repo_custom_property_values`

Sets or clears custom property values via [Create or update custom property values for a repository](https://docs.github.com/en/rest/repos/custom-properties?apiVersion=2026-03-10#create-or-update-custom-property-values-for-a-repository) (`PATCH /repos/{owner}/{repo}/properties/values`). **`value`** may be a string, string array, or **`null`** to unset that property on the repo. Requires **repository admin** or the repository-level **edit custom property values** fine-grained permission; property definitions must already exist on the **owning organization**.

#### Inputs

- `owner` (required), `name` (required)
- `properties` (required) — non-empty array of `{ property_name, value }`

#### Output

On success: **`http_status`** (typically **204**), echo **`properties`**, and **`request_id`**. On failure: structured **`error`** (e.g. **403**, **404**, **422**).
