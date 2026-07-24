import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRepoSecurityAdvisoryTemporaryForkFailure,
    CreateRepoSecurityAdvisoryTemporaryForkSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateRepoSecurityAdvisoryTemporaryForkTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_create_repo_security_advisory_temporary_fork",
        "Create a temporary private fork for a repository security advisory (POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/forks). Returns **202 Accepted**. Fork creation is asynchronous. See [Create a temporary private fork](https://docs.github.com/en/rest/security-advisories/repository-advisories?apiVersion=2026-03-10#create-a-temporary-private-fork).",
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
            ghsa_id: z.string().min(1).describe("The GHSA (GitHub Security Advisory) identifier of the advisory.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.securityAdvisories.createFork({
                    owner: input.owner,
                    repo: input.name,
                    ghsa_id: input.ghsa_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoSecurityAdvisoryTemporaryForkSuccess = {
                    success: true,
                    message: "Temporary private fork creation accepted.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    ghsa_id: input.ghsa_id,
                    fork: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoSecurityAdvisoryTemporaryForkFailure = {
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
