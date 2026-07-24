# Attestations MCP tools

Tool implementations wrap [Artifact attestations](https://docs.github.com/en/rest/users/attestations?apiVersion=2026-03-10) under **Users**.

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_user_attestations` | `GET /users/{username}/attestations/{subject_digest}` |
| `github_list_user_attestations_bulk_subject_digests` | `POST /users/{username}/attestations/bulk-list` |
| `github_delete_user_attestations_bulk` | `POST /users/{username}/attestations/delete-request` |
| `github_delete_user_attestation_by_subject_digest` | `DELETE /users/{username}/attestations/digest/{subject_digest}` |
| `github_delete_user_attestation_by_id` | `DELETE /users/{username}/attestations/{attestation_id}` |
