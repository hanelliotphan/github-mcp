import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteUserAttestationsBulkFailure,
    DeleteUserAttestationsBulkSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteUserAttestationsBulkTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_user_attestations_bulk",
        "Request **bulk deletion** of user-scoped artifact attestations (POST /users/{username}/attestations/delete-request). " +
            "Body requires **`subject_digests`** (digests whose attestations should be removed). " +
            "Requires permission to delete attestations in the user's repositories (fine-grained tokens need appropriate **attestations** access per GitHub). " +
            "Success is typically HTTP **200**; **404** if nothing matched. " +
            "See [Delete attestations in bulk](https://docs.github.com/en/rest/users/attestations?apiVersion=2026-03-10#delete-attestations-in-bulk).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                ),
            subject_digests: z
                .array(z.string().min(1))
                .min(1)
                .max(100)
                .describe("Subject digests whose attestations should be deleted (per GitHub REST).")
        },
        async (input) => {
            try {
                const response = (await octokit.rest.users.deleteAttestationsBulk({
                        username: input.username,
                        subject_digests: input.subject_digests
                    } as never)) as {
                    status: number;
                    data: unknown;
                    headers: { "x-github-request-id"?: string };
                };
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const raw = response.data;
                const response_data =
                    raw !== null &&
                    raw !== undefined &&
                    typeof raw === "object" &&
                    !Array.isArray(raw) &&
                    Object.keys(raw as Record<string, unknown>).length > 0
                        ? (JSON.parse(JSON.stringify(raw)) as Record<string, unknown>)
                        : null;
                const successPayload: DeleteUserAttestationsBulkSuccess = {
                    success: true,
                    message: "Bulk attestation delete request completed.",
                    http_status: response.status,
                    username: input.username,
                    request_id: requestId,
                    response_data
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteUserAttestationsBulkFailure = {
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
