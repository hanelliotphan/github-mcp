import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RerequestCheckSuiteFailure, RerequestCheckSuiteSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRerequestCheckSuiteTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_rerequest_check_suite",
        "Rerequest a check suite (POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest). Requires a GitHub App. " +
            "See [Rerequest a check suite](https://docs.github.com/en/rest/checks/suites?apiVersion=2026-03-10#rerequest-a-check-suite).",
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
            check_suite_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.checks.rerequestSuite({
                    owner: input.owner,
                    repo: input.name,
                    check_suite_id: input.check_suite_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RerequestCheckSuiteSuccess = {
                    success: true,
                    message: "Check suite rerequested successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    check_suite_id: input.check_suite_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RerequestCheckSuiteFailure = {
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
