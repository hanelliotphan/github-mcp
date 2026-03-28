import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CheckDependabotSecurityUpdatesFailure,
    CheckDependabotSecurityUpdatesSuccess
} from "../types.js";
import { getRequestId, mapGitHubError } from "../utils/errors.js";
import { textAndData } from "../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function isHttp404(error: unknown): boolean {
    return typeof error === "object" && error !== null && (error as { status?: number }).status === 404;
}

export function registerGithubCheckDependabotSecurityUpdatesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_dependabot_security_updates",
        "Check whether Dependabot security updates are enabled for a repository (GET /repos/{owner}/{repo}/automated-security-fixes). Requires admin read access. A 404 from GitHub is returned as enabled: false.",
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
            try {
                const response = await octokit.rest.repos.checkAutomatedSecurityFixes({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckDependabotSecurityUpdatesSuccess = {
                    success: true,
                    message: "Dependabot security updates status retrieved successfully.",
                    enabled: response.data.enabled,
                    paused: response.data.paused,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const requestId = getRequestId(
                    (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                        "x-github-request-id"
                    ]
                );

                if (isHttp404(error)) {
                    const notEnabledPayload: CheckDependabotSecurityUpdatesSuccess = {
                        success: true,
                        message:
                            "Dependabot security updates are not enabled for this repository (GitHub returned 404).",
                        enabled: false,
                        paused: false,
                        request_id: requestId
                    };
                    return textAndData(notEnabledPayload);
                }

                const failurePayload: CheckDependabotSecurityUpdatesFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: requestId
                };
                return textAndData(failurePayload);
            }
        }
    );
}
