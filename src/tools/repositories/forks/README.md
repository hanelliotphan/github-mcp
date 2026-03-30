# Repository forks MCP tools

Tool implementations in this folder wrap [GitHub REST repository forks](https://docs.github.com/en/rest/repos/forks?apiVersion=2026-03-10) endpoints. They are registered from `src/index.ts`. Responses use the same shared shape as other repository tools: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope (see the parent [../README.md](../README.md) for general conventions).

**List tools with pagination** return `pages_fetched` and echo the effective cursor (`page` / `per_page`, plus `sort` where applicable). Set **`all_pages`: `true`** to follow GitHub `Link: rel="next"` automatically up to **`max_pages`** (default **100**, max **500**). If **`truncated`** is `true`, raise `max_pages` or call again using **`pagination.next`**. Shared helpers live in `src/utils/github-paginate-all.ts`.

## Tools

- [`github_list_repo_forks`](README.md#github_list_repo_forks)
- [`github_create_repo_fork`](README.md#github_create_repo_fork)

---

### `github_create_repo_fork`

Creates a fork via [Create a fork](https://docs.github.com/en/rest/repos/forks?apiVersion=2026-03-10#create-a-fork) (`POST /repos/{owner}/{repo}/forks`). The authenticated user receives the fork (or the target **organization** when set). GitHub responds with **HTTP 202 Accepted** and creates the fork **asynchronously**—wait briefly before cloning or relying on git objects.

#### Inputs

- `owner` (required), `name` (required) — source repository
- `organization` (optional) — fork into this organization (requires appropriate org permission)
- `fork_name` (optional) — name for the new repository (omit to keep the same name as the source)
- `default_branch_only` (optional) — when true, fork only the default branch

#### Output

On success: **`http_status`** (typically `202`), normalized **`repo`** metadata, **`request_id`**. On failure: structured **`error`**.

---

### `github_list_repo_forks`

Lists forks of a repository via [List forks](https://docs.github.com/en/rest/repos/forks?apiVersion=2026-03-10#list-forks) (`GET /repos/{owner}/{repo}/forks`). Requires **read** access to the repository. **`sort`** can be `newest` (default), `oldest`, `stargazers`, or `watchers`.

#### Inputs

- `owner` (required), `name` (required)
- `sort` (optional) — `newest` \| `oldest` \| `stargazers` \| `watchers`
- `per_page` (optional) — 1–100; default **100** when omitted (MCP default)
- `page` (optional)
- `all_pages` (optional), `max_pages` (optional) — same behavior as other paginated list tools

#### Output

On success: **`forks`** (normalized fork rows), **`sort`**, **`pagination`**, **`request_id`**, **`page`**, **`per_page`**, **`pages_fetched`**, and optionally **`truncated`**. On failure: structured **`error`**.
