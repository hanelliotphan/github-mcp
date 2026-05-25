# Organization network configurations MCP tools

Tool implementations wrap [REST API endpoints for network configurations](https://docs.github.com/en/rest/orgs/network-configurations?apiVersion=2026-03-10) (`/orgs/{org}/settings/network-configurations`, …). They are registered from `src/index.ts`.

Classic OAuth apps and personal access tokens (classic) need **`read:network_configurations`** to list or read configurations and **`write:network_configurations`** to create, update, or delete (per GitHub). Success payloads follow the shared MCP shape; failures use the structured **error** envelope.

## Tools

- [`github_list_org_network_configurations`](README.md#github_list_org_network_configurations)
- [`github_create_org_network_configuration`](README.md#github_create_org_network_configuration)

---

### `github_list_org_network_configurations`

Calls [List hosted compute network configurations for an organization](https://docs.github.com/en/rest/orgs/network-configurations?apiVersion=2026-03-10#list-hosted-compute-network-configurations-for-an-organization) (`GET /orgs/{org}/settings/network-configurations`).

#### Inputs

- **`org`** (required) — organization login
- **`per_page`** (optional) — **1–100**; default **100** when omitted (MCP default; GitHub REST default is **30**)
- **`page`** (optional) — page number (default **1**)
- **`all_pages`** (optional) — follow `next` links up to **`max_pages`** (default **100**)
- **`max_pages`** (optional) — **1–500**

#### Output

On success (**200**): **`org`**, **`total_count`**, **`network_configurations`** (hosted compute network configuration objects), **`http_status`**, **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, optional **`truncated`**. On failure: structured **`error`**.

---

### `github_create_org_network_configuration`

Calls [Create a hosted compute network configuration for an organization](https://docs.github.com/en/rest/orgs/network-configurations?apiVersion=2026-03-10#create-a-hosted-compute-network-configuration-for-an-organization) (`POST /orgs/{org}/settings/network-configurations`). Classic tokens need **`write:network_configurations`**.

#### Inputs

- **`org`** (required) — organization login
- **`name`** (required) — **1–100** characters; letters, digits, `.`, `-`, `_` only
- **`network_settings_ids`** (required) — array with **exactly one** network settings resource id
- **`compute_service`** (optional) — **`none`** or **`actions`**
- **`failover_network_settings_ids`** (optional) — array with **exactly one** failover network settings id
- **`failover_network_enabled`** (optional) — boolean

#### Output

On success (**201**): **`org`**, **`network_configuration`** (created object with `id`, `name`, `compute_service`, …), **`http_status`**, **`request_id`**. On failure: structured **`error`**.
