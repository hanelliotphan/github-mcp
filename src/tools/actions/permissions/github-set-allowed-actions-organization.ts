import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetAllowedActionsOrganizationFailure,
    SetAllowedActionsOrganizationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetAllowedActionsOrganizationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_allowed_actions_organization",
        "Set allowed actions and reusable workflows for an organization (PUT /orgs/{org}/actions/permissions/selected-actions). " +
            "Optionally provide **`github_owned_allowed`**, **`verified_allowed`**, and **`patterns_allowed`** (array of action patterns). Applies when `allowed_actions` is `selected`. " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Set allowed actions and reusable workflows for an organization](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#set-allowed-actions-and-reusable-workflows-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            github_owned_allowed: z
                .boolean()
                .optional()
                .describe("Whether GitHub-owned actions are allowed."),
            verified_allowed: z
                .boolean()
                .optional()
                .describe("Whether actions from verified creators are allowed."),
            patterns_allowed: z
                .array(z.string())
                .optional()
                .describe("Specific action patterns allowed to run.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.setAllowedActionsOrganization({
                    org: input.org,
                    ...(input.github_owned_allowed !== undefined
                        ? { github_owned_allowed: input.github_owned_allowed }
                        : {}),
                    ...(input.verified_allowed !== undefined
                        ? { verified_allowed: input.verified_allowed }
                        : {}),
                    ...(input.patterns_allowed !== undefined
                        ? { patterns_allowed: input.patterns_allowed }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetAllowedActionsOrganizationSuccess = {
                    success: true,
                    message: "Allowed actions set successfully.",
                    http_status: response.status,
                    org: input.org,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetAllowedActionsOrganizationFailure = {
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
