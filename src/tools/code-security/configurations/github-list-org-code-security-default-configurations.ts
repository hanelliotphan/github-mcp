import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListOrgCodeSecurityDefaultConfigurationsSuccess, ListOrgCodeSecurityDefaultConfigurationsFailure } from "../../../types.js";
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

export function registerGithubListOrgCodeSecurityDefaultConfigurationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_code_security_default_configurations",
        "Get default code security configurations for an organization (GET /orgs/{org}/code-security/configurations/defaults). Classic tokens need read:org. See [Get default code security configurations](https://docs.github.com/en/rest/code-security/configurations?apiVersion=2026-03-10#get-default-code-security-configurations).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        },
        async (input) => {
            try {
                const response = await octokit.rest.codeSecurity.getDefaultConfigurations({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListOrgCodeSecurityDefaultConfigurationsSuccess = {
                    success: true,
                    message: "Default code security configurations retrieved successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    defaults: Array.isArray(response.data)
                        ? response.data.map((row) => toPlain(row))
                        : [toPlain(response.data)],
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgCodeSecurityDefaultConfigurationsFailure = {
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
