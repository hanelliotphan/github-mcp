import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteOrgAttestationByIdFailure,
    DeleteOrgAttestationByIdSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgAttestationByIdTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_attestation_by_id",
        "Delete one **artifact attestation** by numeric id in an organization (DELETE /orgs/{org}/attestations/{attestation_id}). " +
            "GitHub may respond with **200** or **204** on success. **403** / **404** when forbidden or missing. " +
            "See [Delete attestations by ID](https://docs.github.com/en/rest/orgs/attestations?apiVersion=2026-03-10#delete-attestations-by-id).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            attestation_id: z
                .number()
                .int()
                .positive()
                .describe("Attestation id from GitHub (integer path segment).")
        },
        async (input) => {
            try {
                const response = (await octokit.request(
                    "DELETE /orgs/{org}/attestations/{attestation_id}",
                    {
                        org: input.org,
                        attestation_id: input.attestation_id
                    } as never
                )) as {
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
                const successPayload: DeleteOrgAttestationByIdSuccess = {
                    success: true,
                    message:
                        response.status === 204
                            ? "Attestation delete completed (no content)."
                            : "Attestation delete completed.",
                    http_status: response.status,
                    org: input.org,
                    attestation_id: input.attestation_id,
                    request_id: requestId,
                    response_data
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgAttestationByIdFailure = {
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
