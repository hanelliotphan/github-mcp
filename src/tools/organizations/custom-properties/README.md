# Organization custom properties MCP tools

Tool implementations wrap [REST API endpoints for organization custom properties](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10) (`/orgs/{org}/properties/...`). They are registered from `src/index.ts`.

Repository-scoped custom property value tools live under [`repositories/custom-properties`](../../repositories/custom-properties/README.md).

## Tools

- [`github_get_org_custom_properties`](README.md#github_get_org_custom_properties)
- [`github_get_org_custom_property`](README.md#github_get_org_custom_property)
- [`github_create_update_org_custom_property`](README.md#github_create_update_org_custom_property)
- [`github_create_update_org_custom_properties`](README.md#github_create_update_org_custom_properties)
- [`github_delete_org_custom_property`](README.md#github_delete_org_custom_property)

---

### `github_get_org_custom_properties`

Calls [Get all custom properties for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#get-all-custom-properties-for-an-organization) (`GET /orgs/{org}/properties/schema`).

#### Inputs

- **`org`** (required) — organization login

#### Output

On success (**200**): **`org`**, **`properties`** (array of organization custom property objects: **`property_name`**, **`value_type`**, optional **`required`**, **`default_value`**, **`description`**, **`allowed_values`**, **`values_editable_by`**, **`require_explicit_values`**, **`source_type`**, **`url`**, … per GitHub), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**403**, **404**, etc.).

Organization **members** can read definitions.

---

### `github_get_org_custom_property`

Calls [Get a custom property for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#get-a-custom-property-for-an-organization) (`GET /orgs/{org}/properties/schema/{custom_property_name}`).

#### Inputs

- **`org`** (required) — organization login
- **`custom_property_name`** (required) — property name (GitHub path segment)

#### Output

On success (**200**): **`org`**, **`custom_property_name`**, **`property`** (single definition object), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**403**, **404**, etc.).

---

### `github_create_update_org_custom_property`

Calls [Create or update a custom property for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#create-or-update-a-custom-property-for-an-organization) (`PUT /orgs/{org}/properties/schema/{custom_property_name}`).

#### Inputs

- **`org`** (required) — organization login
- **`custom_property_name`** (required) — property name (GitHub path segment)
- **`value_type`** (required) — `string`, `single_select`, `multi_select`, `true_false`, or `url`
- Optional: **`required`**, **`default_value`** (string, string array, or null), **`description`**, **`allowed_values`** (max **200** strings), **`values_editable_by`** (`org_actors`, `org_and_repo_actors`, or null), **`require_explicit_values`**

#### Output

On success (**200**): same shape as **`github_get_org_custom_property`** — **`org`**, **`custom_property_name`**, **`property`**, **`http_status`**, **`request_id`**. On failure: structured **`error`** (**403**, **404**, etc.).

---

### `github_delete_org_custom_property`

Calls [Remove a custom property for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#remove-a-custom-property-for-an-organization) (`DELETE /orgs/{org}/properties/schema/{custom_property_name}`).

#### Inputs

- **`org`** (required) — organization login
- **`custom_property_name`** (required) — property name to remove (GitHub path segment)

#### Output

On success (**204** No Content): **`org`**, **`custom_property_name`**, **`http_status`**, **`request_id`**. On failure: structured **`error`** (**403**, **404**, etc.).

---

### `github_create_update_org_custom_properties`

Calls [Create or update custom properties for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#create-or-update-custom-properties-for-an-organization) (`PATCH /orgs/{org}/properties/schema`).

#### Inputs

- **`org`** (required) — organization login
- **`properties`** (required, non-empty array) — each object must include **`property_name`** and **`value_type`** (`string`, `single_select`, `multi_select`, `true_false`, `url`). Optional: **`url`**, **`source_type`**, **`required`**, **`default_value`** (string, string array, or null), **`description`**, **`allowed_values`** (max **200** strings), **`values_editable_by`** (`org_actors`, `org_and_repo_actors`, or null), **`require_explicit_values`**. Sent as the GitHub **`properties`** array on **`PATCH /orgs/{org}/properties/schema`**.

#### Output

On success (**200**): same shape as **`github_get_org_custom_properties`** — **`org`**, **`properties`** (full updated list), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**403**, **404**, etc.).

Existing properties are **replaced** when matched by name; omitted optional fields may reset to GitHub defaults per their documentation.
