import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetCheckSuiteFailure, GetCheckSuiteSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetCheckSuiteTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_check_suite",
        "Get a check suite (GET /repos/{owner}/{repo}/check-suites/{check_suite_id}). " +
            "See [Get a check suite](https://docs.github.com/en/rest/checks/suites?apiVersion=2026-03-10#get-a-check-suite).",
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
                const response = await octokit.rest.checks.getSuite({
                    owner: input.owner,
                    repo: input.name,
                    check_suite_id: input.check_suite_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCheckSuiteSuccess = {
                    success: true,
                    message: "Check suite retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    check_suite_id: input.check_suite_id,
                    check_suite: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCheckSuiteFailure = {
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
