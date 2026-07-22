import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgCodeSecurityConfigurationSuccess, GetOrgCodeSecurityConfigurationFailure } from "../../../types.js";
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

export function registerGithubGetOrgCodeSecurityConfigurationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_code_security_configuration",
        "Get a code security configuration (GET /orgs/{org}/code-security/configurations/{configuration_id}). Classic tokens need write:org (per docs). See [Get a code security configuration](https://docs.github.com/en/rest/code-security/configurations?apiVersion=2026-03-10#get-a-code-security-configuration).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            configuration_id: z.number().int().positive(),
        },
        async (input) => {
            try {
                const response = await octokit.rest.codeSecurity.getConfiguration({
                    org: input.org,
                    configuration_id: input.configuration_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgCodeSecurityConfigurationSuccess = {
                    success: true,
                    message: "Code security configuration retrieved successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    configuration_id: input.configuration_id,
                    configuration: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCodeSecurityConfigurationFailure = {
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
