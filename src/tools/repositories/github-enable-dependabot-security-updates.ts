import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    EnableDependabotSecurityUpdatesFailure,
    EnableDependabotSecurityUpdatesSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubEnableDependabotSecurityUpdatesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_enable_dependabot_security_updates",
        "Enable Dependabot security updates for a repository (PUT /repos/{owner}/{repo}/automated-security-fixes). Requires admin access. If GitHub returns 422 about vulnerability alerts, call github_enable_vulnerability_alerts first. Returns 204 with no body on success.",
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
                )
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.repos.enableAutomatedSecurityFixes({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: EnableDependabotSecurityUpdatesSuccess = {
                    success: true,
                    message: "Dependabot security updates enabled successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: EnableDependabotSecurityUpdatesFailure = {
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
