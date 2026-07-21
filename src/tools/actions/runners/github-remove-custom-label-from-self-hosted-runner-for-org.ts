import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveCustomLabelFromSelfHostedRunnerForOrgFailure,
    RemoveCustomLabelFromSelfHostedRunnerForOrgSuccess
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

export function registerGithubRemoveCustomLabelFromSelfHostedRunnerForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_custom_label_from_self_hosted_runner_for_org",
        "Remove a single custom label from a self-hosted runner configured in an organization (DELETE /orgs/{org}/actions/runners/{runner_id}/labels/{name}). " +
            "Returns the runner's remaining labels. Read-only labels cannot be removed. " +
            "The authenticated user must have **admin** access; classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "See [Remove a custom label from a self-hosted runner for an organization](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#remove-a-custom-label-from-a-self-hosted-runner-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            runner_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner."),
            name: z.string().min(1).describe("The name of a self-hosted runner's custom label to remove.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.removeCustomLabelFromSelfHostedRunnerForOrg({
                    org: input.org,
                    runner_id: input.runner_id,
                    name: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseLabels(response.data);
                const successPayload: RemoveCustomLabelFromSelfHostedRunnerForOrgSuccess = {
                    success: true,
                    message: "Custom label removed from runner successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_id: input.runner_id,
                    total_count: parsed.total_count,
                    labels: parsed.labels,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveCustomLabelFromSelfHostedRunnerForOrgFailure = {
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
