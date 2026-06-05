import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ConvertOrgMemberToOutsideCollaboratorFailure,
    ConvertOrgMemberToOutsideCollaboratorSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainData(data: unknown): Record<string, unknown> | undefined {
    if (data === null || data === undefined || data === "") {
        return undefined;
    }
    if (typeof data === "object" && Object.keys(data as object).length === 0) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubConvertOrgMemberToOutsideCollaboratorTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_convert_org_member_to_outside_collaborator",
        "Convert an **organization member** into an **outside collaborator** (PUT /orgs/{org}/outside_collaborators/{username}). " +
            "The user leaves the org and keeps only the repo access their current team memberships allow. " +
            "Set **`async`: true** to queue the work and get **202** (job queued); the default synchronous call returns **204** (converted). " +
            "Requires **org admin**; classic tokens need **`admin:org`**. May be restricted by enterprise policy. " +
            "**403** if the user is the last owner, not a member, or blocked by policy; **404** if not found. " +
            "See [Convert an organization member to outside collaborator](https://docs.github.com/en/rest/orgs/outside-collaborators?apiVersion=2026-03-10#convert-an-organization-member-to-outside-collaborator).",
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
                ),
            async: z
                .boolean()
                .optional()
                .describe("When true, queue the conversion asynchronously (returns 202). Default: false.")
        },
        async (input) => {
            try {
                const asyncRequested = input.async ?? false;
                const response = await octokit.request(
                    "PUT /orgs/{org}/outside_collaborators/{username}",
                    {
                        org: input.org,
                        username: input.username,
                        async: asyncRequested
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = toPlainData(response.data);
                const successPayload: ConvertOrgMemberToOutsideCollaboratorSuccess = {
                    success: true,
                    message:
                        response.status === 202
                            ? "Conversion to outside collaborator queued (async)."
                            : "Organization member converted to outside collaborator successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    async: asyncRequested,
                    ...(data ? { data } : {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ConvertOrgMemberToOutsideCollaboratorFailure = {
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
