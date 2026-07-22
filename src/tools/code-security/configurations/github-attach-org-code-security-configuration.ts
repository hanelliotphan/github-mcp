import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { AttachOrgCodeSecurityConfigurationSuccess, AttachOrgCodeSecurityConfigurationFailure } from "../../../types.js";
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

export function registerGithubAttachOrgCodeSecurityConfigurationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_attach_org_code_security_configuration",
        "Attach a configuration to repositories (POST /orgs/{org}/code-security/configurations/{configuration_id}/attach). Requires scope; pass selected_repository_ids when scope is selected. Returns 202. Classic tokens need write:org. See [Attach a configuration to repositories](https://docs.github.com/en/rest/code-security/configurations?apiVersion=2026-03-10#attach-a-configuration-to-repositories).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            configuration_id: z.number().int().positive(),
            scope: z.enum(["all", "all_without_configurations", "public", "private_or_internal", "selected"]),
            selected_repository_ids: z.array(z.number().int().positive()).min(1).optional(),
        },
        async (input) => {
            try {
                const response = await octokit.rest.codeSecurity.attachConfiguration({
                    org: input.org,
                    configuration_id: input.configuration_id,
                    scope: input.scope,
                    ...(input.selected_repository_ids !== undefined
                        ? { selected_repository_ids: input.selected_repository_ids }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AttachOrgCodeSecurityConfigurationSuccess = {
                    success: true,
                    message: "Configuration attach accepted.",
                    http_status: response.status as number,
                    org: input.org,
                    configuration_id: input.configuration_id,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AttachOrgCodeSecurityConfigurationFailure = {
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
