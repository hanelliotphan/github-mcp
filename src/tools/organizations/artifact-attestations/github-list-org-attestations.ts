import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgAttestationsFailure,
    ListOrgAttestationsSuccess,
    RepoAttestationListItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** GitHub: subject digest `sha256:` + 64 hex chars. */
const subjectDigestRegex = /^sha256:[a-fA-F0-9]{64}$/;

/** Default `per_page` when omitted (**100**; aligned with other MCP list tools). */
const DEFAULT_ATTESTATION_PER_PAGE = 100 as const;

function normalizeAttestationItem(row: unknown): RepoAttestationListItem {
    const r = row as {
        repository_id?: number;
        bundle_url?: string;
        initiator?: string;
        bundle?: Record<string, unknown>;
    };
    return {
        repository_id: typeof r.repository_id === "number" ? r.repository_id : null,
        bundle_url: typeof r.bundle_url === "string" ? r.bundle_url : null,
        initiator: typeof r.initiator === "string" ? r.initiator : null,
        bundle:
            r.bundle !== null && typeof r.bundle === "object" && !Array.isArray(r.bundle)
                ? r.bundle
                : null
    };
}

function getAttestationsFromResponseData(data: unknown): unknown[] {
    if (data === null || typeof data !== "object") {
        return [];
    }
    const d = data as { attestations?: unknown };
    return Array.isArray(d.attestations) ? d.attestations : [];
}

export function registerGithubListOrgAttestationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_attestations",
        "List **artifact attestations** for an organization and subject digest (GET /orgs/{org}/attestations/{subject_digest}). " +
            "GitHub expects the subject’s SHA256 digest (`sha256:…`). Uses cursor pagination (`after` / `before` from the `Link` header). " +
            "Set `all_pages` to follow `next` up to `max_pages` (default **100**). Results are filtered by repo read access; fine-grained tokens need **attestations:read**. " +
            "`per_page` defaults to **100** when omitted (GitHub max **100**). " +
            "See [List attestations](https://docs.github.com/en/rest/orgs/attestations?apiVersion=2026-03-10#list-attestations).",
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
                .regex(
                    subjectDigestRegex,
                    "subject_digest must be sha256: followed by 64 hexadecimal characters (see GitHub REST docs)"
                )
                .describe("Attestation subject SHA256 digest: sha256:HEX_DIGEST"),
            predicate_type: z
                .string()
                .min(1)
                .optional()
                .describe(
                    "Optional filter: provenance, sbom, release, or a custom predicate type string (GitHub API)."
                ),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().optional(),
            after: z.string().optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_ATTESTATION_PER_PAGE;

                const listAttestations = async (cursors: { after?: string; before?: string }) => {
                    const params: Record<string, unknown> = {
                        org: input.org,
                        subject_digest: input.subject_digest,
                        per_page: perPage,
                        before: cursors.before,
                        after: cursors.after
                    };
                    if (input.predicate_type !== undefined) {
                        params.predicate_type = input.predicate_type;
                    }

                    const response = (await octokit.request(
                        "GET /orgs/{org}/attestations/{subject_digest}",
                        params as never
                    )) as {
                        data: unknown;
                        headers: { link?: string; Link?: string; "x-github-request-id"?: string };
                    };
                    const rows = getAttestationsFromResponseData(response.data);
                    return {
                        rows,
                        linkHeader: getLinkHeaderFromResponse(response.headers),
                        requestId: getRequestId(response.headers["x-github-request-id"])
                    };
                };

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorLinkPages({
                        maxPages,
                        initialAfter: input.after,
                        initialBefore: input.before,
                        fetchChunk: listAttestations
                    });
                    const attestations = result.rows.map((row) => normalizeAttestationItem(row));
                    const successPayload: ListOrgAttestationsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization attestations partially listed (${result.pagesFetched} pages, ${attestations.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization attestations retrieved successfully (${result.pagesFetched} pages, ${attestations.length} items).`
                              : "Organization attestations retrieved successfully.",
                        org: input.org,
                        subject_digest: input.subject_digest,
                        attestations,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const { rows, linkHeader, requestId } = await listAttestations({
                    after: input.after,
                    before: input.before
                });
                const successPayload: ListOrgAttestationsSuccess = {
                    success: true,
                    message: "Organization attestations retrieved successfully.",
                    org: input.org,
                    subject_digest: input.subject_digest,
                    pagination: parseGitHubLinkPagination(linkHeader),
                    attestations: rows.map((row) => normalizeAttestationItem(row)),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgAttestationsFailure = {
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
