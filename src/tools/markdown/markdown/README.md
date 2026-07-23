# Markdown MCP tools

Tool implementations wrap [REST API endpoints for Markdown](https://docs.github.com/en/rest/markdown/markdown?apiVersion=2026-03-10) under **Markdown**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_render_markdown` | Optional `mode` (`markdown` \| `gfm`) and `context` |
| `github_render_markdown_raw` | Plain Markdown only; body ≤ 400 KB |
