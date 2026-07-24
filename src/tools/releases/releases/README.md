# Releases MCP tools

Tool implementations wrap [REST API endpoints for releases](https://docs.github.com/en/rest/releases/releases?apiVersion=2026-03-10) under **Releases → Releases**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`). Repo parameter: MCP **`name`** → API **`repo`**. Release title: MCP **`release_name`** → API **`name`**.

## Tools

| Tool | Notes |
| --- | --- |
| `github_list_repo_releases` | Page pagination |
| `github_create_repo_release` | Requires `tag_name` |
| `github_generate_repo_release_notes` | Does not create a release |
| `github_get_latest_repo_release` | Latest non-draft, non-prerelease |
| `github_get_repo_release_by_tag` | |
| `github_get_repo_release` | By `release_id` |
| `github_update_repo_release` | |
| `github_delete_repo_release` | HTTP **204** |
