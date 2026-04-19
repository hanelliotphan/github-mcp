import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteOrgAttestationsBulkFailure,
    DeleteOrgAttestationsBulkSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgAttestationsBulkTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_attestations_bulk",
        "Request **bulk deletion** of org-scoped artifact attestations (POST /orgs/{org}/attestations/delete-request). " +
            "Body requires **`subject_digests`** (digests whose attestations should be removed). " +
            "Requires permission to delete attestations in the org’s repositories (fine-grained tokens need appropriate **attestations** access per GitHub). " +
            "Success is typically HTTP **200**; **404** if nothing matched. " +
            "See [Delete attestations in bulk](https://docs.github.com/en/rest/orgs/attestations?apiVersion=2026-03-10#delete-attestations-in-bulk).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            subject_digests: z
                .array(z.string().min(1))
                .min(1)
                .max(100)
                .describe("Subject digests whose attestations should be deleted (per GitHub REST).")
        },
        async (input) => {
            try {
                const response = (await octokit.request(
                    "POST /orgs/{org}/attestations/delete-request",
                    {
                        org: input.org,
                        subject_digests: input.subject_digests
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
                const successPayload: DeleteOrgAttestationsBulkSuccess = {
                    success: true,
                    message: "Bulk attestation delete request completed.",
                    http_status: response.status,
                    org: input.org,
                    request_id: requestId,
                    response_data
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgAttestationsBulkFailure = {
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
