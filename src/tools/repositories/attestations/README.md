# Repository attestations MCP tools

Tool implementations in this folder wrap the [GitHub REST repository attestations API](https://docs.github.com/en/rest/repos/attestations?apiVersion=2026-03-10). They are registered from `src/index.ts`. Responses use the same shared shape as other repository tools: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope (see the parent [../README.md](../README.md) for general conventions).

**List tools with pagination** return `pages_fetched` and echo the effective cursor. Set **`all_pages`: `true`** to follow GitHub `Link: rel="next"` automatically up to **`max_pages`** (default **100**, max **500**). If **`truncated`** is `true`, raise `max_pages` or call again using **`pagination.next`**. Shared helpers live in `src/utils/github-paginate-all.ts`.

## Tools

- [`github_create_repo_attestation`](README.md#github_create_repo_attestation)
- [`github_list_repo_attestations`](README.md#github_list_repo_attestations)

---

### `github_create_repo_attestation`

Creates an [artifact attestation](https://docs.github.com/en/rest/repos/attestations?apiVersion=2026-03-10#create-an-attestation) via `POST /repos/{owner}/{repo}/attestations`. The request body is a **Sigstore bundle** (`bundle`: `mediaType`, `verificationMaterial`, `dsseEnvelope`, and any other fields required by the [bundle format](https://github.com/sigstore/protobuf-specs/blob/main/protos/sigstore_bundle.proto)). Implementation: `src/tools/repositories/attestations/github-create-repo-attestation.ts`.

The caller must supply a valid bundle (typically from the [attest](https://github.com/actions/attest) action or compatible tooling). Requires **write** access to the repository; fine-grained tokens need **`attestations:write`**.

#### Inputs

- `owner` (required), `name` (required) — target repository
- `bundle` (required) — one of:
  - a **JSON object** for the Sigstore bundle (same as before), or
  - a **string** of JSON (the full bundle serialized as a single string), or
  - a **string** filesystem path (absolute or relative to the MCP server process) to a `.json` file containing the bundle; the file is read on the machine running `github-mcp`

#### Output

On success (**201**): `owner`, `repo`, `full_name`, `attestation_id` (when GitHub returns an `id` in the response body), and `request_id`. On failure: structured `error` (e.g. **403**, **422**).

### `github_list_repo_attestations`

Lists [artifact attestations](https://docs.github.com/en/rest/repos/attestations?apiVersion=2026-03-10#list-attestations) for a repository via `GET /repos/{owner}/{repo}/attestations/{subject_digest}`. GitHub **does not** list every attestation in the repo in one call: you must supply the subject’s **SHA256 digest** in the form `sha256:HEX_DIGEST`. Cursor pagination uses `before` / `after` (from the `Link` header). Optional `predicate_type` filters by provenance, `sbom`, `release`, or a custom predicate. Requires **read** access; fine-grained tokens need **`attestations:read`**. Implementation: `src/tools/repositories/attestations/github-list-repo-attestations.ts`.

#### Inputs

- `owner` (required), `name` (required) — repository
- `subject_digest` (required) — `sha256:` plus 64 hex characters (identifies the attestation subject)
- `predicate_type` (optional) — filter per GitHub API
- `per_page` (optional) — 1–100; default **100** when omitted
- `before`, `after` (optional) — cursor cursors from a previous response’s `pagination` / `Link` header
- `all_pages` (optional) — if `true`, follow `rel="next"` up to `max_pages` (default **100**)
- `max_pages` (optional) — cap when using `all_pages` (max **500**)

#### Output

On success (**200**): `subject_digest`, `attestations` (each with `repository_id`, `bundle_url`, `initiator`, `bundle` when present), `pagination`, `request_id`, `per_page`, `pages_fetched`, and optionally `truncated`. On failure: structured `error`.
