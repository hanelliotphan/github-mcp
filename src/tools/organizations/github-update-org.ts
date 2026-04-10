import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { OrganizationDetailItem, UpdateOrgFailure, UpdateOrgSuccess } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** PATCH body per GitHub OpenAPI (`orgs/update`); unknown keys are forwarded via `.passthrough()`. */
const orgPatchSchema = z
    .object({
        billing_email: z.string().optional(),
        company: z.string().optional(),
        email: z.string().optional(),
        twitter_username: z.string().optional(),
        location: z.string().optional(),
        name: z.string().optional(),
        description: z.string().max(160).optional(),
        has_organization_projects: z.boolean().optional(),
        has_repository_projects: z.boolean().optional(),
        default_repository_permission: z.enum(["read", "write", "admin", "none"]).optional(),
        members_can_create_repositories: z.boolean().optional(),
        members_can_create_internal_repositories: z.boolean().optional(),
        members_can_create_private_repositories: z.boolean().optional(),
        members_can_create_public_repositories: z.boolean().optional(),
        members_allowed_repository_creation_type: z.enum(["all", "private", "none"]).optional(),
        members_can_create_pages: z.boolean().optional(),
        members_can_create_public_pages: z.boolean().optional(),
        members_can_create_private_pages: z.boolean().optional(),
        members_can_fork_private_repositories: z.boolean().optional(),
        web_commit_signoff_required: z.boolean().optional(),
        blog: z.string().optional(),
        advanced_security_enabled_for_new_repositories: z.boolean().optional(),
        dependabot_alerts_enabled_for_new_repositories: z.boolean().optional(),
        dependabot_security_updates_enabled_for_new_repositories: z.boolean().optional(),
        dependency_graph_enabled_for_new_repositories: z.boolean().optional(),
        secret_scanning_enabled_for_new_repositories: z.boolean().optional(),
        secret_scanning_push_protection_enabled_for_new_repositories: z.boolean().optional(),
        secret_scanning_push_protection_custom_link_enabled: z.boolean().optional(),
        secret_scanning_push_protection_custom_link: z.string().optional(),
        deploy_keys_enabled_for_repositories: z.boolean().optional()
    })
    .passthrough()
    .refine((body) => Object.keys(body).length > 0, {
        message:
            "patch must include at least one property to update (GitHub expects a non-empty JSON body for PATCH /orgs/{org})."
    });

function toPlainOrganization(data: unknown): OrganizationDetailItem {
    return JSON.parse(JSON.stringify(data)) as OrganizationDetailItem;
}

export function registerGithubUpdateOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org",
        "Update an organization (PATCH /orgs/{org}). " +
            "Pass **`patch`** with one or more writable fields (profile, billing email, member repo defaults, Pages, sign-off, etc.); extra keys are forwarded when GitHub supports them. " +
            "You must be an **organization owner**. Classic tokens need **`admin:org`** or **`repo`**; fine-grained tokens need org **administration** (or as GitHub requires). " +
            "Some security defaults are deprecated in favor of code security configurations—see GitHub’s docs. " +
            "Success is HTTP **200**. " +
            "See [Update an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#update-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            patch: orgPatchSchema.describe(
                "Non-empty object of organization fields to set (only include keys you want to change)."
            )
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.update({
                    org: input.org,
                    ...input.patch
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: UpdateOrgSuccess = {
                    success: true,
                    message: "Organization updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    organization: toPlainOrganization(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgFailure = {
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
