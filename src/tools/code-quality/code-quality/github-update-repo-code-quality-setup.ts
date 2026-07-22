import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateRepoCodeQualitySetupFailure,
    UpdateRepoCodeQualitySetupSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const languageSchema = z.enum([
    "csharp",
    "go",
    "java-kotlin",
    "javascript-typescript",
    "python",
    "ruby",
    "rust"
]);

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubUpdateRepoCodeQualitySetupTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_code_quality_setup",
        "Update a code quality setup configuration (PATCH /repos/{owner}/{repo}/code-quality/setup). " +
            "Optional \`state\`, \`runner_type\`, \`runner_label\`, \`languages\`. Returns **200** or **202** (async). " +
            "Classic tokens need \`repo\` (or \`public_repo\` for public repos). " +
            "See [Update a code quality setup configuration](https://docs.github.com/en/rest/code-quality/code-quality?apiVersion=2026-03-10#update-a-code-quality-setup-configuration).",
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
            state: z.enum(["configured", "not-configured"]).optional(),
            runner_type: z.enum(["standard", "labeled"]).optional(),
            runner_label: z.union([z.string().min(1), z.null()]).optional(),
            languages: z.array(languageSchema).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request("PATCH /repos/{owner}/{repo}/code-quality/setup", {
                    owner: input.owner,
                    repo: input.name,
                    ...(input.state !== undefined ? { state: input.state } : {}),
                    ...(input.runner_type !== undefined ? { runner_type: input.runner_type } : {}),
                    ...(input.runner_label !== undefined ? { runner_label: input.runner_label } : {}),
                    ...(input.languages !== undefined ? { languages: input.languages } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const httpStatus = response.status as number;
                const successPayload: UpdateRepoCodeQualitySetupSuccess = {
                    success: true,
                    message:
                        httpStatus === 202
                            ? "Code quality setup update accepted."
                            : "Code quality setup updated successfully.",
                    http_status: httpStatus,
                    owner: input.owner,
                    name: input.name,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoCodeQualitySetupFailure = {
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
