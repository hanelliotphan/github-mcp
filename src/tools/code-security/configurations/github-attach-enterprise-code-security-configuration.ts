import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { AttachEnterpriseCodeSecurityConfigurationSuccess, AttachEnterpriseCodeSecurityConfigurationFailure } from "../../../types.js";
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

export function registerGithubAttachEnterpriseCodeSecurityConfigurationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_attach_enterprise_code_security_configuration",
        "Attach an enterprise configuration to repositories (POST /enterprises/{enterprise}/code-security/configurations/{configuration_id}/attach). Requires scope (all|all_without_configurations). Returns 202. Classic tokens need admin:enterprise. See [Attach an enterprise configuration to repositories](https://docs.github.com/en/rest/code-security/configurations?apiVersion=2026-03-10#attach-an-enterprise-configuration-to-repositories).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"),
            configuration_id: z.number().int().positive(),
            scope: z.enum(["all", "all_without_configurations"]),
        },
        async (input) => {
            try {
                const response = await octokit.rest.codeSecurity.attachEnterpriseConfiguration({
                    enterprise: input.enterprise,
                    configuration_id: input.configuration_id,
                    scope: input.scope
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AttachEnterpriseCodeSecurityConfigurationSuccess = {
                    success: true,
                    message: "Configuration attach accepted.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    configuration_id: input.configuration_id,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AttachEnterpriseCodeSecurityConfigurationFailure = {
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
