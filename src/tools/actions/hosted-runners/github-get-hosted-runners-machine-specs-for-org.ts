import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetHostedRunnersMachineSpecsForOrgFailure,
    GetHostedRunnersMachineSpecsForOrgSuccess,
    HostedRunnerItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "machine_specs" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.machine_specs) ? o.machine_specs : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

export function registerGithubGetHostedRunnersMachineSpecsForOrgTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_get_hosted_runners_machine_specs_for_org",
        "Get machine specs available for GitHub-hosted runners in an organization (GET /orgs/{org}/actions/hosted-runners/machine-sizes). " +
            "Returns **`total_count`** and **`machine_specs`** rows (`id`, `cpu_cores`, `memory_gb`, `storage_gb`). " +
            "See [Get GitHub-hosted runners machine specs for an organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#get-github-hosted-runners-machine-specs-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.getHostedRunnersMachineSpecsForOrg({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseBody(response.data);
                const successPayload: GetHostedRunnersMachineSpecsForOrgSuccess = {
                    success: true,
                    message: "Hosted runner machine specs retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    total_count: parsed.total_count,
                    machine_specs: parsed.rows.map(
                        (row) => JSON.parse(JSON.stringify(row)) as HostedRunnerItem
                    ),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetHostedRunnersMachineSpecsForOrgFailure = {
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
