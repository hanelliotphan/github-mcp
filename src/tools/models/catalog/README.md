# Models catalog MCP tools

Tool implementations wrap [REST API endpoints for models catalog](https://docs.github.com/en/rest/models/catalog?apiVersion=2026-03-10) under **Models → Catalog**. They are registered from `src/index.ts`.

These endpoints use **`https://models.github.ai`** (not `api.github.com`).

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_models` | Catalog of available model IDs and capabilities |
