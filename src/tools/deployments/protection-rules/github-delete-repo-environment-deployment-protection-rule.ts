import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteRepoEnvironmentDeploymentProtectionRuleSuccess, DeleteRepoEnvironmentDeploymentProtectionRuleFailure } from "../../../types.js";
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

export function registerGithubDeleteRepoEnvironmentDeploymentProtectionRuleTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_environment_deployment_protection_rule",
        "Disable a custom deployment protection rule for a repository environment. Success is HTTP **204**. See [Disable a custom deployment protection rule](https://docs.github.com/en/rest/deployments/protection-rules?apiVersion=2026-03-10#disable-a-custom-deployment-protection-rule-on-an-environment).",
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
            environment_name: z.string().min(1).describe("The name of the environment."),
            protection_rule_id: z.number().int().positive().describe("The unique identifier of the protection rule.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.disableDeploymentProtectionRule({
                    owner: input.owner,
                    repo: input.name,
                    environment_name: input.environment_name,
                    protection_rule_id: input.protection_rule_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteRepoEnvironmentDeploymentProtectionRuleSuccess = {
                    success: true,
                    message: "Deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    environment_name: input.environment_name,
                    protection_rule_id: input.protection_rule_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoEnvironmentDeploymentProtectionRuleFailure = {
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
