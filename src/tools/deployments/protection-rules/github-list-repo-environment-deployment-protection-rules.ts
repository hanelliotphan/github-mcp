import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoEnvironmentDeploymentProtectionRulesSuccess, ListRepoEnvironmentDeploymentProtectionRulesFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "custom_deployment_protection_rules" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.custom_deployment_protection_rules) ? o.custom_deployment_protection_rules : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

export function registerGithubListRepoEnvironmentDeploymentProtectionRulesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_environment_deployment_protection_rules",
        "List custom deployment protection rules enabled for a repository environment. Returns **`total_count`** and **`custom_deployment_protection_rules`**. See [List custom deployment protection rules](https://docs.github.com/en/rest/deployments/protection-rules?apiVersion=2026-03-10#list-custom-deployment-protection-rules-on-an-environment).",
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
            environment_name: z.string().min(1).describe("The name of the environment.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getAllDeploymentProtectionRules({
                    owner: input.owner,
                    repo: input.name,
                    environment_name: input.environment_name,
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseBody(response.data);
                const successPayload: ListRepoEnvironmentDeploymentProtectionRulesSuccess = {
                    success: true,
                    message: "Deployment protection rules retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    environment_name: input.environment_name,
                    total_count: parsed.total_count,
                    custom_deployment_protection_rules: toPlainRows(parsed.rows),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoEnvironmentDeploymentProtectionRulesFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
