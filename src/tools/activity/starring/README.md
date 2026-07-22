# Activity starring tools

Tools for [starring (bookmarking) repositories](https://docs.github.com/en/rest/activity/starring?apiVersion=2026-03-10).

Stars show an approximate level of interest and have no effect on notifications or the activity feed. Note: as of July 2026, access to the stargazers listing endpoint is limited to repository admins and collaborators. List endpoints support pagination (`per_page`, `page`, `all_pages`, `max_pages`). `github_check_repo_is_starred_by_authenticated_user` maps GitHub's 204/404 responses to a boolean `starred` field. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_list_stargazers` | `GET /repos/{owner}/{repo}/stargazers` |
| `github_list_repos_starred_by_authenticated_user` | `GET /user/starred` |
| `github_check_repo_is_starred_by_authenticated_user` | `GET /user/starred/{owner}/{repo}` |
| `github_star_repo_for_authenticated_user` | `PUT /user/starred/{owner}/{repo}` |
| `github_unstar_repo_for_authenticated_user` | `DELETE /user/starred/{owner}/{repo}` |
| `github_list_repos_starred_by_user` | `GET /users/{username}/starred` |
