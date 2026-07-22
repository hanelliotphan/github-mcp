# Cost centers MCP tools

Tool implementations wrap [Cost centers](https://docs.github.com/en/rest/billing/cost-centers?apiVersion=2026-03-10) under **Billing → Cost centers**. They are registered from `src/index.ts`.

Accessible to **enterprise owners**, **billing managers**, and **organization owners** (mutations typically require enterprise admin).

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_enterprise_cost_centers` | `GET /enterprises/{enterprise}/settings/billing/cost-centers` |
| `github_create_enterprise_cost_center` | `POST /enterprises/{enterprise}/settings/billing/cost-centers` |
| `github_get_enterprise_cost_center` | `GET /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}` |
| `github_update_enterprise_cost_center` | `PATCH /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}` |
| `github_delete_enterprise_cost_center` | `DELETE /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}` |
| `github_add_resources_to_enterprise_cost_center` | `POST …/cost-centers/{cost_center_id}/resource` |
| `github_remove_resources_from_enterprise_cost_center` | `DELETE …/cost-centers/{cost_center_id}/resource` |
