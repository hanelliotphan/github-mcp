import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgMetadataStorageRecordsFailure,
    ListOrgMetadataStorageRecordsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainStorageListResponse(data: unknown): {
    total_count: number;
    storage_records: Record<string, unknown>[];
} {
    const parsed = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    const total_count = typeof parsed.total_count === "number" ? parsed.total_count : 0;
    const raw = parsed.storage_records;
    const storage_records = Array.isArray(raw)
        ? (raw as unknown[]).map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>)
        : [];
    return { total_count, storage_records };
}

export function registerGithubListOrgMetadataStorageRecordsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_metadata_storage_records",
        "List **storage records** for a subject digest in an organization (GET /orgs/{org}/artifacts/{subject_digest}/metadata/storage-records). " +
            "Returns **`total_count`** and **`storage_records`** on HTTP **200**; results depend on repo read access and token scopes per GitHub. " +
            "See [List artifact storage records](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#list-artifact-storage-records).",
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
                .describe("Attestation subject SHA256 digest in the form sha256:HEX_DIGEST (see GitHub REST docs).")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /orgs/{org}/artifacts/{subject_digest}/metadata/storage-records",
                    {
                        org: input.org,
                        subject_digest: input.subject_digest
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const payload = toPlainStorageListResponse(response.data);
                const successPayload: ListOrgMetadataStorageRecordsSuccess = {
                    success: true,
                    message: "Storage records listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    subject_digest: input.subject_digest,
                    total_count: payload.total_count,
                    storage_records: payload.storage_records,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgMetadataStorageRecordsFailure = {
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
