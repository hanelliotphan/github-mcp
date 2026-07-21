# Actions OIDC tools

Tools for managing [GitHub Actions OIDC](https://docs.github.com/en/rest/actions/oidc?apiVersion=2026-03-10) subject claim customization templates for organizations and repositories.

Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

## Tools

### `github_get_oidc_custom_sub_template_for_org`

- **Endpoint:** `GET /orgs/{org}/actions/oidc/customization/sub`
- **Inputs:** `org`.
- **Output:** `template` (`include_claim_keys`).
- **Access:** Organization owner; classic tokens need `read:org` scope.

### `github_update_oidc_custom_sub_template_for_org`

- **Endpoint:** `PUT /orgs/{org}/actions/oidc/customization/sub`
- **Inputs:** `org`, `include_claim_keys` (array of strings).
- **Output:** Confirmation (HTTP 201) echoing `include_claim_keys`.
- **Access:** Organization owner; classic tokens need `write:org` scope.

### `github_get_custom_oidc_sub_claim_for_repo`

- **Endpoint:** `GET /repos/{owner}/{repo}/actions/oidc/customization/sub`
- **Inputs:** `owner`, `name`.
- **Output:** `claim` (`use_default`, `include_claim_keys`).
- **Access:** Repository admin; classic tokens need `repo` scope.

### `github_set_custom_oidc_sub_claim_for_repo`

- **Endpoint:** `PUT /repos/{owner}/{repo}/actions/oidc/customization/sub`
- **Inputs:** `owner`, `name`, `use_default` (boolean), optional `include_claim_keys` (required when `use_default` is false).
- **Output:** Confirmation (HTTP 201).
- **Access:** Repository admin; classic tokens need `repo` scope.
