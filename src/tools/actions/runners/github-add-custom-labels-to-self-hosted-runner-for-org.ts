import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AddCustomLabelsToSelfHostedRunnerForOrgFailure,
    AddCustomLabelsToSelfHostedRunnerForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseLabels(data: unknown): { total_count: number; labels: Record<string, unknown>[] } {
    if (data && typeof data === "object" && "labels" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.labels) ? o.labels : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, labels: rows.map((r) => JSON.parse(JSON.stringify(r)) as Record<string, unknown>) };
    }
    return { total_count: 0, labels: [] };
}

export function registerGithubAddCustomLabelsToSelfHostedRunnerForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_custom_labels_to_self_hosted_runner_for_org",
        "Add custom labels to a self-hosted runner configured in an organization (POST /orgs/{org}/actions/runners/{runner_id}/labels). " +
            "Provide **`labels`** (1–100 custom label names) to append to the runner's existing labels. Returns the full updated label set. " +
            "The authenticated user must have **admin** access; classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "See [Add custom labels to a self-hosted runner for an organization](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#add-custom-labels-to-a-self-hosted-runner-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            runner_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner."),
            labels: z
                .array(z.string().min(1))
                .min(1)
                .max(100)
                .describe("The names of the custom labels to add to the runner (1–100).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.addCustomLabelsToSelfHostedRunnerForOrg({
                    org: input.org,
                    runner_id: input.runner_id,
                    labels: input.labels
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseLabels(response.data);
                const successPayload: AddCustomLabelsToSelfHostedRunnerForOrgSuccess = {
                    success: true,
                    message: "Custom labels added to runner successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_id: input.runner_id,
                    total_count: parsed.total_count,
                    labels: parsed.labels,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddCustomLabelsToSelfHostedRunnerForOrgFailure = {
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
