# Usage reports MCP tools

Tool implementations wrap [Usage reports](https://docs.github.com/en/rest/billing/usage-reports?apiVersion=2026-03-10) under **Billing → Usage reports**. They are registered from `src/index.ts`.

Requires enterprise **admin** or **billing manager**. Create returns **202**; poll get until `status` is `completed` (then use `download_urls`).

## Tools

| Tool | Endpoint |
| --- | --- |
| `github_list_enterprise_usage_report_exports` | `GET /enterprises/{enterprise}/settings/billing/reports` |
| `github_create_enterprise_usage_report_export` | `POST /enterprises/{enterprise}/settings/billing/reports` |
| `github_get_enterprise_usage_report_export` | `GET /enterprises/{enterprise}/settings/billing/reports/{report_id}` |
