# Organization artifact metadata MCP tools

Wrappers for [REST API endpoints for artifact metadata](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10) (`/orgs/{org}/artifacts/...`). These endpoints support [linked artifacts](https://docs.github.com/en/code-security/concepts/supply-chain-security/linked-artifacts) and org-level supply-chain metadata. Implementations live under `src/tools/organizations/artifact-metadata/` and are registered from `src/index.ts`.

## Tools

- [`github_create_org_artifact_deployment_record`](README.md#github_create_org_artifact_deployment_record)
- [`github_list_org_artifact_deployment_records`](README.md#github_list_org_artifact_deployment_records)
- [`github_create_org_metadata_storage_record`](README.md#github_create_org_metadata_storage_record)
- [`github_set_org_cluster_deployment_records`](README.md#github_set_org_cluster_deployment_records)

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

---

### `github_list_org_artifact_deployment_records`

Calls [List artifact deployment records](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#list-artifact-deployment-records) (`GET /orgs/{org}/artifacts/{subject_digest}/metadata/deployment-records`).

#### Inputs

- **`org`** (required) — organization login
- **`subject_digest`** (required) — subject digest, typically `sha256:` plus 64 hex characters per GitHub

#### Output

On success: **`http_status`** (**200**), echoed **`org`**, **`subject_digest`**, **`total_count`**, **`deployment_records`**, **`request_id`**. On failure: structured **`error`**.

---

### `github_create_org_metadata_storage_record`

Calls [Create artifact metadata storage record](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#create-artifact-metadata-storage-record) (`POST /orgs/{org}/artifacts/metadata/storage-record`). Registers where a digest is stored in a registry.

#### Inputs

- **`org`** (required) — organization login
- **`name`** (required) — subject name
- **`digest`** (required) — digest (`algorithm:hex-encoded-digest`)
- **`registry_url`** (required) — registry base URL
- **`version`**, **`artifact_url`**, **`path`**, **`repository`** (optional)
- **`status`** (optional) — `active`, `eol`, or `deleted` (GitHub default **active**)
- **`github_repository`** (optional) — repo name in the org when no provenance attestation supplies it
- **`return_records`** (optional) — GitHub default **true**

#### Output

On success: **`http_status`** (**200**), echoed **`org`**, **`total_count`**, **`storage_records`**, **`request_id`**. On failure: structured **`error`**.

---

### `github_set_org_cluster_deployment_records`

Calls [Set cluster deployment records](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#set-cluster-deployment-records) (`POST /orgs/{org}/artifacts/metadata/deployment-record/cluster/{cluster}`). Sends **`logical_environment`**, optional **`physical_environment`**, and a **`deployments`** array (each row: **`name`**, **`digest`**, **`deployment_name`**, plus optional **`version`**, **`status`**, **`github_repository`**, **`tags`**, **`runtime_risks`**). Response shape matches [create deployment record](#github_create_org_artifact_deployment_record).

#### Inputs

- **`org`** (required) — organization login
- **`cluster`** (required) — cluster path segment
- **`logical_environment`** (required) — deployment stage
- **`physical_environment`** (optional)
- **`deployments`** (required, non-empty) — deployment objects (**`deployment_name`** unique within the array)
- **`return_records`** (optional) — GitHub default **true**

#### Output

On success: **`http_status`** (**200**), echoed **`org`**, **`cluster`**, **`total_count`**, **`deployment_records`**, **`request_id`**. On failure: structured **`error`**.
