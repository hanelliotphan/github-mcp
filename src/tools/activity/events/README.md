# Activity events tools

Tools for reading [GitHub events](https://docs.github.com/en/rest/activity/events?apiVersion=2026-03-10), which power the various activity streams on the site.

These endpoints are **not built for real-time use**—event latency can range from 30 seconds to 6 hours. Public timelines include up to 300 events from the past 30 days. Some endpoints return private events only when you are authenticated as the target user (a fine-grained token needs the "Events" user permission read). All endpoints support pagination (`per_page`, `page`, `all_pages`, `max_pages`) and return an `events` array. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_list_public_events` | `GET /events` |
| `github_list_public_events_for_repo_network` | `GET /networks/{owner}/{repo}/events` |
| `github_list_public_org_events` | `GET /orgs/{org}/events` |
| `github_list_repo_events` | `GET /repos/{owner}/{repo}/events` |
| `github_list_events_for_authenticated_user` | `GET /users/{username}/events` |
| `github_list_org_events_for_authenticated_user` | `GET /users/{username}/events/orgs/{org}` |
| `github_list_public_events_for_user` | `GET /users/{username}/events/public` |
| `github_list_received_events_for_user` | `GET /users/{username}/received_events` |
| `github_list_received_public_events_for_user` | `GET /users/{username}/received_events/public` |
