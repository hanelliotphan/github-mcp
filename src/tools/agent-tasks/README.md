# Agent tasks tools

Tools for starting and managing [Copilot cloud agent tasks](https://docs.github.com/en/rest/agent-tasks/agent-tasks?apiVersion=2026-03-10).

These endpoints are in **public preview** and subject to change. They require a fine-grained personal access token or GitHub App **user** access token with the **"Agent tasks"** repository permission (read, or read and write to start a task). GitHub App **installation** access tokens are not supported. Starting a task also requires Copilot Business or Copilot Enterprise.

List endpoints support pagination (`per_page`, `page`, `all_pages`, `max_pages`) and return a `tasks` array plus optional `total_active_count` / `total_archived_count`. Response conventions match the rest of the server; see the [repository tools overview](../repositories/README.md).

| Tool | Endpoint |
| --- | --- |
| `github_list_agent_tasks_for_repo` | `GET /agents/repos/{owner}/{repo}/tasks` |
| `github_start_agent_task` | `POST /agents/repos/{owner}/{repo}/tasks` |
| `github_get_agent_task_for_repo` | `GET /agents/repos/{owner}/{repo}/tasks/{task_id}` |
| `github_list_agent_tasks` | `GET /agents/tasks` |
| `github_get_agent_task` | `GET /agents/tasks/{task_id}` |
