# Organization custom properties MCP tools

Tool implementations wrap [REST API endpoints for organization custom properties](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10) (`/orgs/{org}/properties/...`). They are registered from `src/index.ts`.

Repository-scoped custom property value tools live under [`repositories/custom-properties`](../../repositories/custom-properties/README.md).

## Tools

- [`github_get_org_custom_properties_schema`](README.md#github_get_org_custom_properties_schema)

---

### `github_get_org_custom_properties_schema`

Calls [Get all custom properties for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#get-all-custom-properties-for-an-organization) (`GET /orgs/{org}/properties/schema`).

#### Inputs

- **`org`** (required) — organization login

#### Output

On success (**200**): **`org`**, **`properties`** (array of organization custom property objects: **`property_name`**, **`value_type`**, optional **`required`**, **`default_value`**, **`description`**, **`allowed_values`**, **`values_editable_by`**, **`require_explicit_values`**, **`source_type`**, **`url`**, … per GitHub), **`http_status`**, **`request_id`**. On failure: structured **`error`** (**403**, **404**, etc.).

Organization **members** can read the schema.
