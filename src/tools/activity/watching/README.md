# Activity watching tools

Tools for [watching repositories](https://docs.github.com/en/rest/activity/watching?apiVersion=2026-03-10)—subscribing to notifications for activity in a repository.

In REST responses, `subscribers_count` corresponds to the number of watchers (whereas `watchers`, `watchers_count`, and `stargazers_count` reflect stars). Note: as of July 2026, access to the subscribers/subscriptions listing endpoints is limited to repository admins and collaborators, and `github_list_repos_watched_by_user` is deprecated (returns empty responses during the deprecation period). `github_get_repo_subscription` maps GitHub's 200/404 responses to a boolean `subscribed` field. List endpoints support pagination (`per_page`, `page`, `all_pages`, `max_pages`). Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_list_watchers` | `GET /repos/{owner}/{repo}/subscribers` |
| `github_get_repo_subscription` | `GET /repos/{owner}/{repo}/subscription` |
| `github_set_repo_subscription` | `PUT /repos/{owner}/{repo}/subscription` |
| `github_delete_repo_subscription` | `DELETE /repos/{owner}/{repo}/subscription` |
| `github_list_watched_repos_for_authenticated_user` | `GET /user/subscriptions` |
| `github_list_repos_watched_by_user` | `GET /users/{username}/subscriptions` |
