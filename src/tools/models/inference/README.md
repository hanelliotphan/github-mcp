# Models inference MCP tools

Tool implementations wrap [REST API endpoints for models inference](https://docs.github.com/en/rest/models/inference?apiVersion=2026-03-10) under **Models → Inference**. They are registered from `src/index.ts`.

These endpoints use **`https://models.github.ai`** (not `api.github.com`) and require **`models: read`**. Streaming responses are not supported via these MCP tools (`stream` must be omitted or `false`).

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_create_model_chat_completion` | User-attributed chat completions |
| `github_create_org_model_chat_completion` | Org-attributed; org must have models enabled |
