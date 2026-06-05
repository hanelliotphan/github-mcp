import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveOrgOutsideCollaboratorFailure,
    RemoveOrgOutsideCollaboratorSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveOrgOutsideCollaboratorTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_org_outside_collaborator",
        "Remove an **outside collaborator** from an organization (DELETE /orgs/{org}/outside_collaborators/{username}). " +
            "This removes the user from **all** of the organization’s repositories. Success is HTTP **204** No Content. " +
            "Requires **org admin**; classic tokens need **`admin:org`**. " +
            "**422** if the user is an **organization member** (convert them first with **`github_convert_org_member_to_outside_collaborator`** or remove their membership). " +
            "See [Remove outside collaborator from an organization](https://docs.github.com/en/rest/orgs/outside-collaborators?apiVersion=2026-03-10#remove-outside-collaborator-from-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /orgs/{org}/outside_collaborators/{username}",
                    {
                        org: input.org,
                        username: input.username
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveOrgOutsideCollaboratorSuccess = {
                    success: true,
                    message: "Outside collaborator removed from the organization successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveOrgOutsideCollaboratorFailure = {
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
