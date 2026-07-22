# Activity notifications tools

Tools for managing [GitHub notifications](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10). Notifications are returned as "threads" describing the current discussion of an issue, pull request, or commit.

These endpoints require a **classic personal access token** with the **`notifications`** or **`repo`** scope (the `repo` scope is needed to access issues and commits from their respective endpoints). Notifications are optimized for polling with the `Last-Modified`/`X-Poll-Interval` headers. List endpoints support pagination (`per_page`, `page`, `all_pages`, `max_pages`). Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_list_notifications_for_authenticated_user` | `GET /notifications` |
| `github_mark_notifications_as_read` | `PUT /notifications` |
| `github_get_thread` | `GET /notifications/threads/{thread_id}` |
| `github_mark_thread_as_read` | `PATCH /notifications/threads/{thread_id}` |
| `github_mark_thread_as_done` | `DELETE /notifications/threads/{thread_id}` |
| `github_get_thread_subscription_for_authenticated_user` | `GET /notifications/threads/{thread_id}/subscription` |
| `github_set_thread_subscription` | `PUT /notifications/threads/{thread_id}/subscription` |
| `github_delete_thread_subscription` | `DELETE /notifications/threads/{thread_id}/subscription` |
| `github_list_repo_notifications_for_authenticated_user` | `GET /repos/{owner}/{repo}/notifications` |
| `github_mark_repo_notifications_as_read` | `PUT /repos/{owner}/{repo}/notifications` |
