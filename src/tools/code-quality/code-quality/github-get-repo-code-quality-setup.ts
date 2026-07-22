import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoCodeQualitySetupFailure,
    GetRepoCodeQualitySetupSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetRepoCodeQualitySetupTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_code_quality_setup",
        "Get a code quality setup configuration (GET /repos/{owner}/{repo}/code-quality/setup). " +
            "Classic tokens need \`repo\` (or \`public_repo\` for public repos). " +
            "See [Get a code quality setup configuration](https://docs.github.com/en/rest/code-quality/code-quality?apiVersion=2026-03-10#get-a-code-quality-setup-configuration).",
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
                const response = await octokit.request("GET /repos/{owner}/{repo}/code-quality/setup", {
                    owner: input.owner,
                    repo: input.name
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoCodeQualitySetupSuccess = {
                    success: true,
                    message: "Code quality setup retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    setup: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoCodeQualitySetupFailure = {
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
