import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ErrorEnvelope,
    UpdateOrgPrivateRegistryFailure,
    UpdateOrgPrivateRegistrySuccess
} from "../../../types.js";
import { encryptSecretValue } from "../../../utils/encrypt-secret.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const registryTypeSchema = z.enum([
    "maven_repository",
    "nuget_feed",
    "goproxy_server",
    "npm_registry",
    "rubygems_server",
    "cargo_registry",
    "composer_repository",
    "docker_registry",
    "git_source",
    "helm_registry",
    "hex_organization",
    "hex_repository",
    "pub_repository",
    "python_index",
    "terraform_registry"
]);

const authTypeSchema = z.enum([
    "token",
    "username_password",
    "oidc_azure",
    "oidc_aws",
    "oidc_jfrog",
    "oidc_cloudsmith",
    "oidc_gcp"
]);

const OIDC_AUTH_TYPES = new Set([
    "oidc_azure",
    "oidc_aws",
    "oidc_jfrog",
    "oidc_cloudsmith",
    "oidc_gcp"
]);

function validationError(message: string, hint: string): ErrorEnvelope {
    return {
        status_code: 400,
        error_type: "validation_error",
        message,
        hint,
        retryable: false
    };
}

export function registerGithubUpdateOrgPrivateRegistryTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_update_org_private_registry",
        "Update an organization private registry configuration (PATCH /orgs/{org}/private-registries/{secret_name}). " +
            "All body fields are optional. For token/username_password secrets, pass plaintext **`value`** (auto-encrypted) or **`encrypted_value`** + **`key_id`**. " +
            "**`auth_type`** cannot change after creation. Success is HTTP **204**. Requires **`admin:org`**. " +
            "See [Update a private registry for an organization](https://docs.github.com/en/rest/private-registries/organization-configurations?apiVersion=2026-03-10#update-a-private-registry-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            secret_name: z.string().min(1).describe("Name of the private registry configuration."),
            registry_type: registryTypeSchema.optional(),
            url: z.string().url().optional(),
            username: z.union([z.string().min(1), z.null()]).optional(),
            replaces_base: z.boolean().optional(),
            value: z
                .string()
                .min(1)
                .optional()
                .describe("Plaintext secret; encrypted automatically with the org public key."),
            encrypted_value: z.string().min(1).optional(),
            key_id: z.string().min(1).optional(),
            visibility: z.enum(["all", "private", "selected"]).optional(),
            selected_repository_ids: z.array(z.number().int().positive()).optional(),
            auth_type: authTypeSchema.optional(),
            tenant_id: z.string().min(1).optional(),
            client_id: z.string().min(1).optional(),
            aws_region: z.string().min(1).optional(),
            account_id: z.string().min(1).optional(),
            role_name: z.string().min(1).optional(),
            domain: z.string().min(1).optional(),
            domain_owner: z.string().min(1).optional(),
            jfrog_oidc_provider_name: z.string().min(1).optional(),
            audience: z.string().min(1).optional(),
            identity_mapping_name: z.string().min(1).optional(),
            namespace: z.string().min(1).optional(),
            service_slug: z.string().min(1).optional(),
            api_host: z.string().min(1).optional(),
            workload_identity_provider: z.string().min(1).optional(),
            service_account: z.string().min(1).optional()
        },
        async (input) => {
            const isOidc = input.auth_type !== undefined && OIDC_AUTH_TYPES.has(input.auth_type);
            try {
                let encrypted_value = input.encrypted_value;
                let key_id = input.key_id;

                if (input.value !== undefined) {
                    if (isOidc) {
                        const failurePayload: UpdateOrgPrivateRegistryFailure = {
                            success: false,
                            error: validationError(
                                "Do not pass value/encrypted_value for OIDC auth types.",
                                "Omit value, encrypted_value, and key_id when auth_type is an OIDC type."
                            ),
                            request_id: null
                        };
                        return textAndData(failurePayload);
                    }
                    const keyResponse = await octokit.rest.privateRegistries.getOrgPublicKey({
                        org: input.org
                    });
                    const key = keyResponse.data as { key_id: string; key: string };
                    encrypted_value = await encryptSecretValue(input.value, key.key);
                    key_id = key.key_id;
                } else if (
                    (encrypted_value !== undefined && key_id === undefined) ||
                    (encrypted_value === undefined && key_id !== undefined)
                ) {
                    const failurePayload: UpdateOrgPrivateRegistryFailure = {
                        success: false,
                        error: validationError(
                            "encrypted_value and key_id must be provided together.",
                            "Pass both fields, or use plaintext value instead."
                        ),
                        request_id: null
                    };
                    return textAndData(failurePayload);
                }

                const response = await octokit.rest.privateRegistries.updateOrgPrivateRegistry({
                    org: input.org,
                    secret_name: input.secret_name,
                    ...(input.registry_type !== undefined
                        ? { registry_type: input.registry_type }
                        : {}),
                    ...(input.url !== undefined ? { url: input.url } : {}),
                    ...(input.username !== undefined ? { username: input.username } : {}),
                    ...(input.replaces_base !== undefined ? { replaces_base: input.replaces_base } : {}),
                    ...(encrypted_value !== undefined ? { encrypted_value } : {}),
                    ...(key_id !== undefined ? { key_id } : {}),
                    ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
                    ...(input.selected_repository_ids !== undefined
                        ? { selected_repository_ids: input.selected_repository_ids }
                        : {}),
                    ...(input.auth_type !== undefined ? { auth_type: input.auth_type } : {}),
                    ...(input.tenant_id !== undefined ? { tenant_id: input.tenant_id } : {}),
                    ...(input.client_id !== undefined ? { client_id: input.client_id } : {}),
                    ...(input.aws_region !== undefined ? { aws_region: input.aws_region } : {}),
                    ...(input.account_id !== undefined ? { account_id: input.account_id } : {}),
                    ...(input.role_name !== undefined ? { role_name: input.role_name } : {}),
                    ...(input.domain !== undefined ? { domain: input.domain } : {}),
                    ...(input.domain_owner !== undefined ? { domain_owner: input.domain_owner } : {}),
                    ...(input.jfrog_oidc_provider_name !== undefined
                        ? { jfrog_oidc_provider_name: input.jfrog_oidc_provider_name }
                        : {}),
                    ...(input.audience !== undefined ? { audience: input.audience } : {}),
                    ...(input.identity_mapping_name !== undefined
                        ? { identity_mapping_name: input.identity_mapping_name }
                        : {}),
                    ...(input.namespace !== undefined ? { namespace: input.namespace } : {}),
                    ...(input.service_slug !== undefined ? { service_slug: input.service_slug } : {}),
                    ...(input.api_host !== undefined ? { api_host: input.api_host } : {}),
                    ...(input.workload_identity_provider !== undefined
                        ? { workload_identity_provider: input.workload_identity_provider }
                        : {}),
                    ...(input.service_account !== undefined
                        ? { service_account: input.service_account }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgPrivateRegistrySuccess = {
                    success: true,
                    message: "Private registry updated successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    secret_name: input.secret_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgPrivateRegistryFailure = {
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
