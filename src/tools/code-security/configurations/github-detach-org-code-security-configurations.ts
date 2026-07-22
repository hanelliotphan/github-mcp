import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DetachOrgCodeSecurityConfigurationsSuccess, DetachOrgCodeSecurityConfigurationsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubDetachOrgCodeSecurityConfigurationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_detach_org_code_security_configurations",
        "Detach configurations from repositories (DELETE /orgs/{org}/code-security/configurations/detach). Requires selected_repository_ids (up to 250). Classic tokens need write:org. See [Detach configurations from repositories](https://docs.github.com/en/rest/code-security/configurations?apiVersion=2026-03-10#detach-configurations-from-repositories).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            selected_repository_ids: z.array(z.number().int().positive()).min(1).max(250),
        },
        async (input) => {
            try {
                const response = await octokit.rest.codeSecurity.detachConfiguration({
                    org: input.org,
                    selected_repository_ids: input.selected_repository_ids
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DetachOrgCodeSecurityConfigurationsSuccess = {
                    success: true,
                    message: "Configurations detached successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    selected_repository_ids: input.selected_repository_ids,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DetachOrgCodeSecurityConfigurationsFailure = {
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
