import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgPrivateRegistryFailure,
    CreateOrgPrivateRegistrySuccess,
    ErrorEnvelope
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

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function validationError(message: string, hint: string): ErrorEnvelope {
    return {
        status_code: 400,
        error_type: "validation_error",
        message,
        hint,
        retryable: false
    };
}

export function registerGithubCreateOrgPrivateRegistryTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_create_org_private_registry",
        "Create an organization private registry configuration (POST /orgs/{org}/private-registries). " +
            "Requires **`registry_type`**, **`url`**, and **`visibility`**. For token/username_password auth, pass plaintext **`value`** " +
            "(auto-encrypted) or **`encrypted_value`** + **`key_id`**. Omit those for OIDC auth types. Requires **`admin:org`**. " +
            "See [Create a private registry for an organization](https://docs.github.com/en/rest/private-registries/organization-configurations?apiVersion=2026-03-10#create-a-private-registry-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            registry_type: registryTypeSchema,
            url: z.string().url(),
            visibility: z.enum(["all", "private", "selected"]),
            username: z.union([z.string().min(1), z.null()]).optional(),
            replaces_base: z.boolean().optional(),
            value: z
                .string()
                .min(1)
                .optional()
                .describe("Plaintext secret; encrypted automatically with the org public key."),
            encrypted_value: z.string().min(1).optional(),
            key_id: z.string().min(1).optional(),
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
            const authType = input.auth_type ?? "token";
            const isOidc = OIDC_AUTH_TYPES.has(authType);
            try {
                let encrypted_value = input.encrypted_value;
                let key_id = input.key_id;

                if (!isOidc) {
                    if (input.value !== undefined) {
                        const keyResponse = await octokit.rest.privateRegistries.getOrgPublicKey({
                            org: input.org
                        });
                        const key = keyResponse.data as { key_id: string; key: string };
                        encrypted_value = await encryptSecretValue(input.value, key.key);
                        key_id = key.key_id;
                    } else if (!encrypted_value || !key_id) {
                        const failurePayload: CreateOrgPrivateRegistryFailure = {
                            success: false,
                            error: validationError(
                                "For token/username_password auth, provide value or both encrypted_value and key_id.",
                                "Pass plaintext value, or encrypted_value with key_id from github_get_org_private_registries_public_key."
                            ),
                            request_id: null
                        };
                        return textAndData(failurePayload);
                    }
                }

                const response = await octokit.rest.privateRegistries.createOrgPrivateRegistry({
                    org: input.org,
                    registry_type: input.registry_type,
                    url: input.url,
                    visibility: input.visibility,
                    ...(input.username !== undefined ? { username: input.username } : {}),
                    ...(input.replaces_base !== undefined ? { replaces_base: input.replaces_base } : {}),
                    ...(!isOidc && encrypted_value !== undefined ? { encrypted_value } : {}),
                    ...(!isOidc && key_id !== undefined ? { key_id } : {}),
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
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgPrivateRegistrySuccess = {
                    success: true,
                    message: "Private registry created successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    registry: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgPrivateRegistryFailure = {
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
