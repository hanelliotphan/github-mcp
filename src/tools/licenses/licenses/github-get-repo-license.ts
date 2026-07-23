import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoLicenseFailure, GetRepoLicenseSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoLicenseTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_license",
        "Get the detected license file for a repository (GET /repos/{owner}/{repo}/license). " +
            "Optional **`ref`** selects the Git reference. Returns license metadata and file content (typically base64). " +
            "See [Get the license for a repository](https://docs.github.com/en/rest/licenses/licenses?apiVersion=2026-03-10#get-the-license-for-a-repository).",
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
            ref: z
                .string()
                .min(1)
                .optional()
                .describe("Git reference (branch, tag, or SHA) for the license file.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.licenses.getForRepo({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.ref !== undefined ? { ref: input.ref } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoLicenseSuccess = {
                    success: true,
                    message: "Repository license retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    license_file: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoLicenseFailure = {
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
