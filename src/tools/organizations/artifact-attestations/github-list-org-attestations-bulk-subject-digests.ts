import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { BulkListOrgAttestationsFailure, BulkListOrgAttestationsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainBulkAttestationsResponse(data: unknown): {
    attestations_subject_digests: Record<string, unknown>;
    page_info: Record<string, unknown>;
} {
    const parsed = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    const rawDigests = parsed.attestations_subject_digests;
    const attestations_subject_digests =
        typeof rawDigests === "object" && rawDigests !== null && !Array.isArray(rawDigests)
            ? (rawDigests as Record<string, unknown>)
            : {};
    const rawPage = parsed.page_info;
    const page_info =
        typeof rawPage === "object" && rawPage !== null && !Array.isArray(rawPage)
            ? (rawPage as Record<string, unknown>)
            : {};
    return { attestations_subject_digests, page_info };
}

export function registerGithubListOrgAttestationsBulkSubjectDigestsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_attestations_bulk_subject_digests",
        "List **artifact attestations** for many subject digests in an organization (POST /orgs/{org}/attestations/bulk-list). " +
            "Body requires **`subject_digests`**; optional **`predicate_type`** (e.g. provenance, sbom, release, or custom). " +
            "Query cursors **`per_page`** (max **100**, GitHub default **30**), **`before`**, **`after`**. " +
            "Results are filtered by repo read access; fine-grained tokens need **attestations:read**. " +
            "Verify bundles cryptographically in production (see GitHub guidance). " +
            "See [List attestations by bulk subject digests](https://docs.github.com/en/rest/orgs/attestations?apiVersion=2026-03-10#list-attestations-by-bulk-subject-digests).",
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
                .describe("Subject digests to fetch (e.g. sha256:… or sha512:… per GitHub)."),
            predicate_type: z
                .string()
                .min(1)
                .optional()
                .describe("Optional filter: provenance, sbom, release, or a custom predicate type."),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().min(1).optional(),
            after: z.string().min(1).optional()
        },
        async (input) => {
            const params: Record<string, unknown> = {
                org: input.org,
                subject_digests: input.subject_digests
            };
            if (input.predicate_type !== undefined) {
                params.predicate_type = input.predicate_type;
            }
            if (input.per_page !== undefined) {
                params.per_page = input.per_page;
            }
            if (input.before !== undefined) {
                params.before = input.before;
            }
            if (input.after !== undefined) {
                params.after = input.after;
            }

            try {
                const response = await octokit.request(
                    "POST /orgs/{org}/attestations/bulk-list",
                    params as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const payload = toPlainBulkAttestationsResponse(response.data);
                const successPayload: BulkListOrgAttestationsSuccess = {
                    success: true,
                    message: "Bulk attestations listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    attestations_subject_digests: payload.attestations_subject_digests,
                    page_info: payload.page_info,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: BulkListOrgAttestationsFailure = {
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
