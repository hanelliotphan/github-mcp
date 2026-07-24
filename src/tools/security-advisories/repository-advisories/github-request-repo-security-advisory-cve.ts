import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RequestRepoSecurityAdvisoryCveFailure,
    RequestRepoSecurityAdvisoryCveSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRequestRepoSecurityAdvisoryCveTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_request_repo_security_advisory_cve",
        "Request a CVE for a repository security advisory (POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve). Returns **202 Accepted**. See [Request a CVE for a repository security advisory](https://docs.github.com/en/rest/security-advisories/repository-advisories?apiVersion=2026-03-10#request-a-cve-for-a-repository-security-advisory).",
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
                const response = await octokit.rest.securityAdvisories.createRepositoryAdvisoryCveRequest({
                    owner: input.owner,
                    repo: input.name,
                    ghsa_id: input.ghsa_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RequestRepoSecurityAdvisoryCveSuccess = {
                    success: true,
                    message: "CVE request accepted.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    ghsa_id: input.ghsa_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RequestRepoSecurityAdvisoryCveFailure = {
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
