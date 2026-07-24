# Model embeddings MCP tools

Tool implementations wrap [REST API endpoints for model embeddings](https://docs.github.com/en/rest/models/embeddings?apiVersion=2026-03-10) under **Models → Embeddings**. They are registered from `src/index.ts`.

These endpoints use **`https://models.github.ai`** (not `api.github.com`) and require **`models: read`**.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_create_model_embeddings` | User-attributed embeddings |
| `github_create_org_model_embeddings` | Org-attributed; org must have models enabled |
