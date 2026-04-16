import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    EnableOrDisableOrgSecurityFeatureFailure,
    EnableOrDisableOrgSecurityFeatureSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const securityProductSchema = z.enum([
    "dependency_graph",
    "dependabot_alerts",
    "dependabot_security_updates",
    "advanced_security",
    "code_scanning_default_setup",
    "secret_scanning",
    "secret_scanning_push_protection"
]);

const enableOrDisableOrgSecurityFeatureShape = {
    org: z
        .string()
        .min(1)
        .max(39)
        .regex(
            orgLoginRegex,
            "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
        ),
    security_product: securityProductSchema,
    enablement: z.enum(["enable_all", "disable_all"]),
    query_suite: z.enum(["default", "extended"]).optional()
};

const enableOrDisableOrgSecurityFeatureInput = z
    .object(enableOrDisableOrgSecurityFeatureShape)
    .refine(
        (data) =>
            data.query_suite === undefined || data.security_product === "code_scanning_default_setup",
        {
            message: "query_suite is only applicable when security_product is code_scanning_default_setup",
            path: ["query_suite"]
        }
    );

export function registerGithubEnableOrDisableOrgSecurityFeatureTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_enable_or_disable_org_security_feature",
        "Enable or disable a security product for **all eligible** org repositories via [Enable or disable a security feature for an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#enable-or-disable-a-security-feature-for-an-organization) (`POST /orgs/{org}/{security_product}/{enablement}`). " +
            "GitHub documents this flow as **closing down** in favor of **code security configurations**; prefer those for new work. " +
            "Caller must be an **org owner** or on a team with the **security manager** role. Classic PATs typically need **`admin:org`**, **`write:org`**, or **`repo`**. " +
            "Success is typically **204** (action started). Optional **`query_suite`** applies only to **`code_scanning_default_setup`**.",
        enableOrDisableOrgSecurityFeatureShape,
        async (input) => {
            const parsed = enableOrDisableOrgSecurityFeatureInput.safeParse(input);
            if (!parsed.success) {
                const failurePayload: EnableOrDisableOrgSecurityFeatureFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: parsed.error.issues.map((i) => i.message).join("; "),
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            const body = parsed.data;
            try {
                const requestParams: {
                    org: string;
                    security_product: z.infer<typeof securityProductSchema>;
                    enablement: "enable_all" | "disable_all";
                    query_suite?: "default" | "extended";
                } = {
                    org: body.org,
                    security_product: body.security_product,
                    enablement: body.enablement
                };
                if (body.query_suite !== undefined) {
                    requestParams.query_suite = body.query_suite;
                }
                const response = await octokit.request(
                    "POST /orgs/{org}/{security_product}/{enablement}",
                    requestParams
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: EnableOrDisableOrgSecurityFeatureSuccess = {
                    success: true,
                    message: "Organization security feature enablement request accepted.",
                    http_status: response.status,
                    org: body.org,
                    security_product: body.security_product,
                    enablement: body.enablement,
                    request_id: requestId,
                    ...(body.query_suite !== undefined ? { query_suite: body.query_suite } : {})
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: EnableOrDisableOrgSecurityFeatureFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
