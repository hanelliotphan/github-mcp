import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AddCustomLabelsToSelfHostedRunnerForRepoFailure,
    AddCustomLabelsToSelfHostedRunnerForRepoSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoRegex = /^[A-Za-z0-9._-]{1,100}$/;

function parseLabels(data: unknown): { total_count: number; labels: Record<string, unknown>[] } {
    if (data && typeof data === "object" && "labels" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.labels) ? o.labels : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, labels: rows.map((r) => JSON.parse(JSON.stringify(r)) as Record<string, unknown>) };
    }
    return { total_count: 0, labels: [] };
}

export function registerGithubAddCustomLabelsToSelfHostedRunnerForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_custom_labels_to_self_hosted_runner_for_repo",
        "Add custom labels to a self-hosted runner configured in a repository (POST /repos/{owner}/{repo}/actions/runners/{runner_id}/labels). " +
            "Provide **`labels`** (1–100 custom label names) to append to the runner's existing labels. Returns the full updated label set. " +
            "The authenticated user must have **admin** access to the repository; classic OAuth apps and PATs need the **`repo`** scope. " +
            "See [Add custom labels to a self-hosted runner for a repository](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#add-custom-labels-to-a-self-hosted-runner-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerRegex, "owner must be a valid GitHub login"),
            name: z.string().min(1).max(100).regex(repoRegex, "name must be a valid repository name"),
            runner_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner."),
            labels: z
                .array(z.string().min(1))
                .min(1)
                .max(100)
                .describe("The names of the custom labels to add to the runner (1–100).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.addCustomLabelsToSelfHostedRunnerForRepo({
                    owner: input.owner,
                    repo: input.name,
                    runner_id: input.runner_id,
                    labels: input.labels
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseLabels(response.data);
                const successPayload: AddCustomLabelsToSelfHostedRunnerForRepoSuccess = {
                    success: true,
                    message: "Custom labels added to runner successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name: `${input.owner}/${input.name}`,
                    runner_id: input.runner_id,
                    total_count: parsed.total_count,
                    labels: parsed.labels,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddCustomLabelsToSelfHostedRunnerForRepoFailure = {
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
