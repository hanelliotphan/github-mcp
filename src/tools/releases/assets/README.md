# Release assets MCP tools

Tool implementations wrap [REST API endpoints for release assets](https://docs.github.com/en/rest/releases/assets?apiVersion=2026-03-10) under **Releases → Assets**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`). Repo parameter: MCP **`name`** → API **`repo`**. Asset file name: MCP **`asset_name`** → API **`name`**.

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_release_assets` | Page pagination |
| `github_get_repo_release_asset` | Metadata only (not binary stream) |
| `github_update_repo_release_asset` | Optional `asset_name`, `label`, `state` |
| `github_delete_repo_release_asset` | HTTP **204** |
| `github_upload_repo_release_asset` | `data_base64`; max **25 MiB** decoded |
