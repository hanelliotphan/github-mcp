# SBOMs MCP tools

Tool implementations wrap [REST API endpoints for software bill of materials (SBOM)](https://docs.github.com/en/rest/dependency-graph/sboms?apiVersion=2026-03-10) under **Dependency graph > SBOMs**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Notes |
| --- | --- |
| `github_export_repo_sbom` | Synchronous SPDX JSON export. |
| `github_generate_repo_sbom_report` | Starts async generation; returns `sbom_url` / `sbom_uuid`. |
| `github_fetch_repo_sbom_report` | Poll; `202` still processing, `302` → `sbom_download_url` (`redirect: manual`). |
