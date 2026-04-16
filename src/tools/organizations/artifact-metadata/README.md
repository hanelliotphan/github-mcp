# Organization artifact metadata MCP tools

Wrappers for [REST API endpoints for artifact metadata](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10) (`/orgs/{org}/artifacts/...`). These endpoints support [linked artifacts](https://docs.github.com/en/code-security/concepts/supply-chain-security/linked-artifacts) and org-level supply-chain metadata. Implementations live under `src/tools/organizations/artifact-metadata/` and are registered from `src/index.ts`.

## Tools

- [`github_create_org_artifact_deployment_record`](README.md#github_create_org_artifact_deployment_record)

---

### `github_create_org_artifact_deployment_record`

Calls [Create an artifact deployment record](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#create-an-artifact-deployment-record) (`POST /orgs/{org}/artifacts/metadata/deployment-record`). Creates or updates a deployment row for an artifact identified by **`digest`**; idempotency is scoped by org, environments, **`cluster`**, and **`deployment_name`** per GitHub.

#### Inputs

- **`org`** (required) — organization login
- **`name`** (required) — artifact name
- **`digest`** (required) — artifact digest (e.g. `sha256:…`)
- **`status`** (required) — `deployed` or `decommissioned`
- **`logical_environment`** (required) — deployment stage
- **`deployment_name`** (required) — unique deployment id within the cluster
- **`version`**, **`physical_environment`**, **`cluster`** (optional)
- **`tags`** (optional) — string key/value map
- **`runtime_risks`** (optional) — up to 20 of: `critical-resource`, `internet-exposed`, `lateral-movement`, `sensitive-data`
- **`github_repository`** (optional) — repo name in the org when no provenance attestation supplies it
- **`return_records`** (optional) — if false, GitHub may omit detailed rows (default **true** on GitHub)

#### Output

On success: **`http_status`** (**200**), echoed **`org`**, **`total_count`**, **`deployment_records`** (array of objects), **`request_id`**. On failure: structured **`error`** (**403**, **404**, etc.).
