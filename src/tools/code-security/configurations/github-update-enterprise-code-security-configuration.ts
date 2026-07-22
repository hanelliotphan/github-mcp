import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateEnterpriseCodeSecurityConfigurationSuccess, UpdateEnterpriseCodeSecurityConfigurationFailure } from "../../../types.js";
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

export function registerGithubUpdateEnterpriseCodeSecurityConfigurationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_enterprise_code_security_configuration",
        "Update a custom code security configuration for an enterprise (PATCH /enterprises/{enterprise}/code-security/configurations/{configuration_id}). Classic tokens need admin:enterprise. See [Update a custom code security configuration for an enterprise](https://docs.github.com/en/rest/code-security/configurations?apiVersion=2026-03-10#update-a-custom-code-security-configuration-for-an-enterprise).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"),
            configuration_id: z.number().int().positive(),
            name: z.string().min(1).optional(),
            description: z.string().min(1).optional(),
            advanced_security: z.enum(["enabled", "disabled", "code_security", "secret_protection"]).optional(),
            code_security: z.enum(["enabled", "disabled", "not_set"]).optional(),
            dependency_graph: z.enum(["enabled", "disabled", "not_set"]).optional(),
            dependency_graph_autosubmit_action: z.enum(["enabled", "disabled", "not_set"]).optional(),
            dependabot_alerts: z.enum(["enabled", "disabled", "not_set"]).optional(),
            dependabot_security_updates: z.enum(["enabled", "disabled", "not_set"]).optional(),
            dependabot_delegated_alert_dismissal: z.enum(["enabled", "disabled", "not_set"]).optional(),
            code_scanning_default_setup: z.enum(["enabled", "disabled", "not_set"]).optional(),
            code_scanning_delegated_alert_dismissal: z.enum(["enabled", "disabled", "not_set"]).optional(),
            secret_protection: z.enum(["enabled", "disabled", "not_set"]).optional(),
            secret_scanning: z.enum(["enabled", "disabled", "not_set"]).optional(),
            secret_scanning_push_protection: z.enum(["enabled", "disabled", "not_set"]).optional(),
            secret_scanning_delegated_bypass: z.enum(["enabled", "disabled", "not_set"]).optional(),
            secret_scanning_validity_checks: z.enum(["enabled", "disabled", "not_set"]).optional(),
            secret_scanning_non_provider_patterns: z.enum(["enabled", "disabled", "not_set"]).optional(),
            secret_scanning_generic_secrets: z.enum(["enabled", "disabled", "not_set"]).optional(),
            secret_scanning_delegated_alert_dismissal: z.enum(["enabled", "disabled", "not_set"]).optional(),
            secret_scanning_extended_metadata: z.enum(["enabled", "disabled", "not_set"]).optional(),
            private_vulnerability_reporting: z.enum(["enabled", "disabled", "not_set"]).optional(),
            enforcement: z.enum(["enforced", "unenforced"]).optional(),
            dependency_graph_autosubmit_action_options: z
                .object({ labeled_runners: z.boolean().optional() })
                .optional(),
            code_scanning_options: z
                .object({ allow_advanced: z.boolean().nullable().optional() })
                .nullable()
                .optional(),
            code_scanning_default_setup_options: z
                .object({
                    runner_type: z.enum(["standard", "labeled", "not_set"]).optional(),
                    runner_label: z.string().nullable().optional()
                })
                .nullable()
                .optional(),
            secret_scanning_delegated_bypass_options: z
                .object({
                    reviewers: z
                        .array(
                            z.object({
                                reviewer_id: z.number().int(),
                                reviewer_type: z.enum(["TEAM", "ROLE"]),
                                mode: z.enum(["ALWAYS", "EXEMPT"]).optional()
                            })
                        )
                        .optional()
                })
                .optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.codeSecurity.updateEnterpriseConfiguration({
                    enterprise: input.enterprise,
                    configuration_id: input.configuration_id,
                    ...(input.name !== undefined ? { name: input.name } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.advanced_security !== undefined ? { advanced_security: input.advanced_security } : {}),
                    ...(input.code_security !== undefined ? { code_security: input.code_security } : {}),
                    ...(input.dependency_graph !== undefined ? { dependency_graph: input.dependency_graph } : {}),
                    ...(input.dependency_graph_autosubmit_action !== undefined ? { dependency_graph_autosubmit_action: input.dependency_graph_autosubmit_action } : {}),
                    ...(input.dependency_graph_autosubmit_action_options !== undefined ? { dependency_graph_autosubmit_action_options: input.dependency_graph_autosubmit_action_options } : {}),
                    ...(input.dependabot_alerts !== undefined ? { dependabot_alerts: input.dependabot_alerts } : {}),
                    ...(input.dependabot_security_updates !== undefined ? { dependabot_security_updates: input.dependabot_security_updates } : {}),
                    ...(input.dependabot_delegated_alert_dismissal !== undefined ? { dependabot_delegated_alert_dismissal: input.dependabot_delegated_alert_dismissal } : {}),
                    ...(input.code_scanning_options !== undefined ? { code_scanning_options: input.code_scanning_options } : {}),
                    ...(input.code_scanning_default_setup !== undefined ? { code_scanning_default_setup: input.code_scanning_default_setup } : {}),
                    ...(input.code_scanning_default_setup_options !== undefined ? { code_scanning_default_setup_options: input.code_scanning_default_setup_options } : {}),
                    ...(input.code_scanning_delegated_alert_dismissal !== undefined ? { code_scanning_delegated_alert_dismissal: input.code_scanning_delegated_alert_dismissal } : {}),
                    ...(input.secret_protection !== undefined ? { secret_protection: input.secret_protection } : {}),
                    ...(input.secret_scanning !== undefined ? { secret_scanning: input.secret_scanning } : {}),
                    ...(input.secret_scanning_push_protection !== undefined ? { secret_scanning_push_protection: input.secret_scanning_push_protection } : {}),
                    ...(input.secret_scanning_delegated_bypass !== undefined ? { secret_scanning_delegated_bypass: input.secret_scanning_delegated_bypass } : {}),
                    ...(input.secret_scanning_delegated_bypass_options !== undefined ? { secret_scanning_delegated_bypass_options: input.secret_scanning_delegated_bypass_options } : {}),
                    ...(input.secret_scanning_validity_checks !== undefined ? { secret_scanning_validity_checks: input.secret_scanning_validity_checks } : {}),
                    ...(input.secret_scanning_non_provider_patterns !== undefined ? { secret_scanning_non_provider_patterns: input.secret_scanning_non_provider_patterns } : {}),
                    ...(input.secret_scanning_generic_secrets !== undefined ? { secret_scanning_generic_secrets: input.secret_scanning_generic_secrets } : {}),
                    ...(input.secret_scanning_delegated_alert_dismissal !== undefined ? { secret_scanning_delegated_alert_dismissal: input.secret_scanning_delegated_alert_dismissal } : {}),
                    ...(input.secret_scanning_extended_metadata !== undefined ? { secret_scanning_extended_metadata: input.secret_scanning_extended_metadata } : {}),
                    ...(input.private_vulnerability_reporting !== undefined ? { private_vulnerability_reporting: input.private_vulnerability_reporting } : {}),
                    ...(input.enforcement !== undefined ? { enforcement: input.enforcement } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateEnterpriseCodeSecurityConfigurationSuccess = {
                    success: true,
                    message: "Code security configuration updated successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    configuration_id: input.configuration_id,
                    configuration: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateEnterpriseCodeSecurityConfigurationFailure = {
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
