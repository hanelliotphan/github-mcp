# Emojis MCP tools

Tool implementations wrap [REST API endpoints for emojis](https://docs.github.com/en/rest/emojis/emojis?apiVersion=2026-03-10) under **Emojis**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_get_emojis` | No parameters; returns shortcode → image URL map |
