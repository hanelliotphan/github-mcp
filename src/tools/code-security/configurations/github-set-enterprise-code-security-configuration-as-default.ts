import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { SetEnterpriseCodeSecurityConfigurationAsDefaultSuccess, SetEnterpriseCodeSecurityConfigurationAsDefaultFailure } from "../../../types.js";
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

export function registerGithubSetEnterpriseCodeSecurityConfigurationAsDefaultTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_enterprise_code_security_configuration_as_default",
        "Set a code security configuration as a default for an enterprise (PUT /enterprises/{enterprise}/code-security/configurations/{configuration_id}/defaults). Optional default_for_new_repos. Classic tokens need admin:enterprise. See [Set a code security configuration as a default for an enterprise](https://docs.github.com/en/rest/code-security/configurations?apiVersion=2026-03-10#set-a-code-security-configuration-as-a-default-for-an-enterprise).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"),
            configuration_id: z.number().int().positive(),
            default_for_new_repos: z.enum(["all", "none", "private_and_internal", "public"]).optional(),
        },
        async (input) => {
            try {
                const response = await octokit.rest.codeSecurity.setConfigurationAsDefaultForEnterprise({
                    enterprise: input.enterprise,
                    configuration_id: input.configuration_id,
                    ...(input.default_for_new_repos !== undefined
                        ? { default_for_new_repos: input.default_for_new_repos }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetEnterpriseCodeSecurityConfigurationAsDefaultSuccess = {
                    success: true,
                    message: "Default configuration updated successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    configuration_id: input.configuration_id,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetEnterpriseCodeSecurityConfigurationAsDefaultFailure = {
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
