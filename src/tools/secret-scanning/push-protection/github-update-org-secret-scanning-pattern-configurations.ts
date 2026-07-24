import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateOrgSecretScanningPatternConfigurationsFailure,
    UpdateOrgSecretScanningPatternConfigurationsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const providerPatternSettingSchema = z.object({
    token_type: z.string().min(1),
    push_protection_setting: z.enum(["not-set", "disabled", "enabled"])
});

const customPatternSettingSchema = z.object({
    token_type: z.string().min(1),
    custom_pattern_version: z.union([z.string(), z.null()]).optional(),
    push_protection_setting: z.enum(["disabled", "enabled"])
});

export function registerGithubUpdateOrgSecretScanningPatternConfigurationsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_update_org_secret_scanning_pattern_configurations",
        "Update secret scanning pattern configurations for an organization (PATCH /orgs/{org}/secret-scanning/pattern-configurations). Classic tokens need write:org. " +
            "See [Update organization pattern configurations](https://docs.github.com/en/rest/secret-scanning/push-protection?apiVersion=2026-03-10#update-organization-pattern-configurations).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            pattern_config_version: z.union([z.string(), z.null()]).optional(),
            provider_pattern_settings: z.array(providerPatternSettingSchema).optional(),
            custom_pattern_settings: z.array(customPatternSettingSchema).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.secretScanning.updateOrgPatternConfigs({
                    org: input.org,
                    ...(input.pattern_config_version !== undefined
                        ? { pattern_config_version: input.pattern_config_version }
                        : {}),
                    ...(input.provider_pattern_settings !== undefined
                        ? { provider_pattern_settings: input.provider_pattern_settings }
                        : {}),
                    ...(input.custom_pattern_settings !== undefined
                        ? { custom_pattern_settings: input.custom_pattern_settings }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgSecretScanningPatternConfigurationsSuccess = {
                    success: true,
                    message: "Pattern configurations updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    pattern_configurations: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgSecretScanningPatternConfigurationsFailure = {
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
