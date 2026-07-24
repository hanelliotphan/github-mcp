import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgSecretScanningPatternConfigurationsFailure,
    ListOrgSecretScanningPatternConfigurationsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubListOrgSecretScanningPatternConfigurationsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_list_org_secret_scanning_pattern_configurations",
        "List secret scanning pattern configurations for an organization (GET /orgs/{org}/secret-scanning/pattern-configurations). Classic tokens need read:org. " +
            "See [List organization pattern configurations](https://docs.github.com/en/rest/secret-scanning/push-protection?apiVersion=2026-03-10#list-organization-pattern-configurations).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.rest.secretScanning.listOrgPatternConfigs({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListOrgSecretScanningPatternConfigurationsSuccess = {
                    success: true,
                    message: "Pattern configurations retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    pattern_configurations: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgSecretScanningPatternConfigurationsFailure = {
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
