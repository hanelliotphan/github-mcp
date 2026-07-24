import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteUserAttestationByIdFailure,
    DeleteUserAttestationByIdSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteUserAttestationByIdTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_user_attestation_by_id",
        "Delete one **artifact attestation** by numeric id for a user (DELETE /users/{username}/attestations/{attestation_id}). " +
            "GitHub may respond with **200** or **204** on success. **403** / **404** when forbidden or missing. " +
            "See [Delete attestations by ID](https://docs.github.com/en/rest/users/attestations?apiVersion=2026-03-10#delete-attestations-by-id).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                ),
            attestation_id: z
                .number()
                .int()
                .positive()
                .describe("Attestation id from GitHub (integer path segment).")
        },
        async (input) => {
            try {
                const response = (await octokit.rest.users.deleteAttestationsById({
                        username: input.username,
                        attestation_id: input.attestation_id
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
                const successPayload: DeleteUserAttestationByIdSuccess = {
                    success: true,
                    message:
                        response.status === 204
                            ? "Attestation delete completed (no content)."
                            : "Attestation delete completed.",
                    http_status: response.status,
                    username: input.username,
                    attestation_id: input.attestation_id,
                    request_id: requestId,
                    response_data
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteUserAttestationByIdFailure = {
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
