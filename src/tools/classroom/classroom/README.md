# GitHub Classroom MCP tools

Tool implementations wrap [REST API endpoints for GitHub Classroom](https://docs.github.com/en/rest/classroom/classroom?apiVersion=2026-03-10) under **Classroom**. They are registered from `src/index.ts`.

These endpoints are **closing down** and will be removed after **2026-08-28** (see the GitHub Classroom sunset notice). They only return data for Classroom administrators.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| `github_list_classrooms` | `GET /classrooms` | Page Link pagination |
| `github_get_classroom` | `GET /classrooms/{classroom_id}` | |
| `github_list_classroom_assignments` | `GET /classrooms/{classroom_id}/assignments` | Page Link pagination |
| `github_get_classroom_assignment` | `GET /assignments/{assignment_id}` | |
| `github_list_accepted_classroom_assignments` | `GET /assignments/{assignment_id}/accepted_assignments` | Page Link pagination |
| `github_get_classroom_assignment_grades` | `GET /assignments/{assignment_id}/grades` | |
