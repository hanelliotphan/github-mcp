# Organization artifact attestations MCP tools

Tool implementations wrap [REST API endpoints for org artifact attestations](https://docs.github.com/en/rest/orgs/attestations?apiVersion=2026-03-10) (`/orgs/{org}/attestations/...`). They are registered from `src/index.ts`. Success payloads follow the shared MCP shape (`request_id`, etc.); failures use the structured **error** envelope.

## Tools

- [`github_list_org_attestations_bulk_subject_digests`](README.md#github_list_org_attestations_bulk_subject_digests)

---

### `github_list_org_attestations_bulk_subject_digests`

Calls [List attestations by bulk subject digests](https://docs.github.com/en/rest/orgs/attestations?apiVersion=2026-03-10#list-attestations-by-bulk-subject-digests) (`POST /orgs/{org}/attestations/bulk-list`).

#### Inputs

- **`org`** (required) — organization login
- **`subject_digests`** (required, non-empty, max **100** entries) — subject digest strings (e.g. `sha256:…` per GitHub)
- **`predicate_type`** (optional) — `provenance`, `sbom`, `release`, or a custom predicate type string
- **`per_page`** (optional) — **1–100** (GitHub default **30**)
- **`before`**, **`after`** (optional) — cursor pagination from `Link` headers

#### Output

On success (**200**): **`org`**, **`attestations_subject_digests`** (map of digest → attestations or null), **`page_info`** (`has_next`, `has_previous`, `next`, `previous` when present), **`http_status`**, **`request_id`**. On failure: structured **`error`**.

Attestations should be **cryptographically verified** for security; see GitHub’s [artifact attestations](https://docs.github.com/en/rest/orgs/attestations?apiVersion=2026-03-10#list-attestations-by-bulk-subject-digests) documentation and `gh attestation verify`.
