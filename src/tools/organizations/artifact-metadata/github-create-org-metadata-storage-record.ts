import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgMetadataStorageRecordFailure,
    CreateOrgMetadataStorageRecordSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const storageStatusSchema = z.enum(["active", "eol", "deleted"]);

function toPlainStorageResponse(data: unknown): {
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

export function registerGithubCreateOrgMetadataStorageRecordTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_metadata_storage_record",
        "Create an **org metadata storage record** (POST /orgs/{org}/artifacts/metadata/storage-record). " +
            "Records where a subject identified by **`digest`** is stored (**`registry_url`** required; optional **`artifact_url`**, **`path`**, **`repository`**, **`version`**, **`status`**, **`github_repository`**, **`return_records`**). " +
            "Success is HTTP **200** with **`total_count`** and **`storage_records`** when **`return_records`** is true (GitHub default). " +
            "See [Create artifact metadata storage record](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#create-artifact-metadata-storage-record).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z.string().min(1).describe("Subject name for the stored build output."),
            digest: z.string().min(1).describe("Digest (algorithm:hex-encoded-digest, e.g. sha256:…)."),
            registry_url: z.string().min(1).describe("Base URL of the registry."),
            version: z.string().min(1).optional(),
            artifact_url: z.string().min(1).optional(),
            path: z.string().min(1).optional(),
            repository: z.string().min(1).optional(),
            status: storageStatusSchema.optional().describe("Defaults to active on GitHub."),
            github_repository: z.string().min(1).optional(),
            return_records: z.boolean().optional()
        },
        async (input) => {
            const body: Record<string, unknown> = {
                name: input.name,
                digest: input.digest,
                registry_url: input.registry_url
            };
            if (input.version !== undefined) {
                body.version = input.version;
            }
            if (input.artifact_url !== undefined) {
                body.artifact_url = input.artifact_url;
            }
            if (input.path !== undefined) {
                body.path = input.path;
            }
            if (input.repository !== undefined) {
                body.repository = input.repository;
            }
            if (input.status !== undefined) {
                body.status = input.status;
            }
            if (input.github_repository !== undefined) {
                body.github_repository = input.github_repository;
            }
            if (input.return_records !== undefined) {
                body.return_records = input.return_records;
            }

            try {
                const response = await octokit.request(
                    "POST /orgs/{org}/artifacts/metadata/storage-record",
                    {
                        org: input.org,
                        ...body
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const payload = toPlainStorageResponse(response.data);
                const successPayload: CreateOrgMetadataStorageRecordSuccess = {
                    success: true,
                    message: "Metadata storage record stored successfully.",
                    http_status: response.status,
                    org: input.org,
                    total_count: payload.total_count,
                    storage_records: payload.storage_records,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgMetadataStorageRecordFailure = {
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
