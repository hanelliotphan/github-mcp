# Activity feeds tools

Tool for reading [GitHub feeds](https://docs.github.com/en/rest/activity/feeds?apiVersion=2026-03-10).

`github_get_feeds` lists the feeds available to the authenticated user, returning a URL for each feed (timeline, user, current-user public/private/actor/organizations, and security advisories). You can then fetch a specific feed by requesting one of the returned URLs. Private feed URLs are only returned when authenticating via Basic Auth. Response conventions match the rest of the server; see the [repository tools overview](../../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_get_feeds` | `GET /feeds` |
