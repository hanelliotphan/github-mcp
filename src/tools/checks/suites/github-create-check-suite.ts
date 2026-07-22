import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateCheckSuiteFailure, CreateCheckSuiteSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubCreateCheckSuiteTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_check_suite",
        "Create a check suite (POST /repos/{owner}/{repo}/check-suites). Requires a GitHub App. " +
            "Returns **200** if the suite already exists, or **201** when created. " +
            "See [Create a check suite](https://docs.github.com/en/rest/checks/suites?apiVersion=2026-03-10#create-a-check-suite).",
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
            head_sha: z.string().min(1).max(64)
        },
        async (input) => {
            try {
                const response = await octokit.rest.checks.createSuite({
                    owner: input.owner,
                    repo: input.name,
                    head_sha: input.head_sha
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateCheckSuiteSuccess = {
                    success: true,
                    message:
                        response.status === 200
                            ? "Check suite already exists."
                            : "Check suite created successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    check_suite: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateCheckSuiteFailure = {
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
