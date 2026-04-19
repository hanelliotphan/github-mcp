import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteOrgAttestationBySubjectDigestFailure,
    DeleteOrgAttestationBySubjectDigestSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgAttestationBySubjectDigestTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_attestation_by_subject_digest",
        "Delete **artifact attestations** for one subject digest in an organization (DELETE /orgs/{org}/attestations/digest/{subject_digest}). " +
            "GitHub may respond with **200** or **204** on success. **404** when nothing matches. " +
            "Requires permission to delete attestations in the org’s repositories. " +
            "See [Delete attestations by subject digest](https://docs.github.com/en/rest/orgs/attestations?apiVersion=2026-03-10#delete-attestations-by-subject-digest).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            subject_digest: z
                .string()
                .min(1)
                .describe("Subject digest path segment (often sha256:HEX_DIGEST per GitHub).")
        },
        async (input) => {
            try {
                const response = (await octokit.request(
                    "DELETE /orgs/{org}/attestations/digest/{subject_digest}",
                    {
                        org: input.org,
                        subject_digest: input.subject_digest
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
                const successPayload: DeleteOrgAttestationBySubjectDigestSuccess = {
                    success: true,
                    message:
                        response.status === 204
                            ? "Attestation delete completed (no content)."
                            : "Attestation delete completed.",
                    http_status: response.status,
                    org: input.org,
                    subject_digest: input.subject_digest,
                    request_id: requestId,
                    response_data
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgAttestationBySubjectDigestFailure = {
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
