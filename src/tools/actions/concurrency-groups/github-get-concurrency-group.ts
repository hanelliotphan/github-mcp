import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ConcurrencyGroupItem,
    GetConcurrencyGroupFailure,
    GetConcurrencyGroupSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetConcurrencyGroupTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_concurrency_group",
        "Get a specific GitHub Actions concurrency group for a repository, including all instances in its queue (GET /repos/{owner}/{repo}/actions/concurrency_groups/{concurrency_group_name}). " +
            "Returns `group_name`, `group_url`, `total_count`, and `group_members` (`run_id`, `run_name`, `status`, …). Returns **404** if the group is inactive or does not exist. " +
            "Optionally pass **`ahead_of_run`** or **`ahead_of_job`** (mutually exclusive) to filter to items ahead of the given run/job in the queue plus that item itself. " +
            "Anyone with **read** access can use this; classic tokens need **`repo`** scope for private repositories. " +
            "See [Get a concurrency group for a repository](https://docs.github.com/en/rest/actions/concurrency-groups?apiVersion=2026-03-10#get-a-concurrency-group-for-a-repository).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            concurrency_group_name: z
                .string()
                .min(1)
                .describe("The name of the concurrency group."),
            ahead_of_run: z
                .number()
                .int()
                .positive()
                .optional()
                .describe("Filter to items ahead of this workflow run ID in the queue. Mutually exclusive with ahead_of_job."),
            ahead_of_job: z
                .number()
                .int()
                .positive()
                .optional()
                .describe("Filter to items ahead of this job ID in the queue. Mutually exclusive with ahead_of_run.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.request(
                    "GET /repos/{owner}/{repo}/actions/concurrency_groups/{concurrency_group_name}",
                    {
                        owner: input.owner,
                        repo: input.name,
                        concurrency_group_name: input.concurrency_group_name,
                        ...(input.ahead_of_run ? { ahead_of_run: input.ahead_of_run } : {}),
                        ...(input.ahead_of_job ? { ahead_of_job: input.ahead_of_job } : {})
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetConcurrencyGroupSuccess = {
                    success: true,
                    message: "Concurrency group retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    concurrency_group_name: input.concurrency_group_name,
                    concurrency_group: JSON.parse(JSON.stringify(response.data)) as ConcurrencyGroupItem,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetConcurrencyGroupFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
