# Repository forks MCP tools

Tool implementations in this folder wrap [GitHub REST repository forks](https://docs.github.com/en/rest/repos/forks?apiVersion=2026-03-10) endpoints. They are registered from `src/index.ts`. Responses use the same shared shape as other repository tools: **success** payloads include `request_id` when GitHub returns `x-github-request-id`; failures use a structured **error** envelope (see the parent [../README.md](../README.md) for general conventions).

**List tools with pagination** return `pages_fetched` and echo the effective cursor (`page` / `per_page`, plus `sort` where applicable). Set **`all_pages`: `true`** to follow GitHub `Link: rel="next"` automatically up to **`max_pages`** (default **100**, max **500**). If **`truncated`** is `true`, raise `max_pages` or call again using **`pagination.next`**. Shared helpers live in `src/utils/github-paginate-all.ts`.

## Tools

- [`github_list_repo_forks`](README.md#github_list_repo_forks)

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
