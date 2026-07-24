import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UploadRepoReleaseAssetSuccess,
    UploadRepoReleaseAssetFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

/** Soft cap for MCP uploads (decoded). Larger assets should use a direct uploads.github.com client. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function registerGithubUploadRepoReleaseAssetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_upload_repo_release_asset",
        "Upload a release asset (POST /repos/{owner}/{repo}/releases/{release_id}/assets). " +
            "Requires **`asset_name`** (MCP → API `name` query) and **`data_base64`** (raw file bytes, base64). " +
            "Optional **`label`**, **`content_type`** (default `application/octet-stream`). Decoded size max **25 MiB** via this tool. " +
            "See [Upload a release asset](https://docs.github.com/en/rest/releases/assets?apiVersion=2026-03-10#upload-a-release-asset).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            release_id: z.number().int().positive(),
            asset_name: z
                .string()
                .min(1)
                .describe("Asset file name (MCP `asset_name` → API `name` query)"),
            data_base64: z.string().min(1).describe("Base64-encoded asset bytes"),
            label: z.string().optional(),
            content_type: z
                .string()
                .min(1)
                .optional()
                .describe("Content-Type for the upload (default application/octet-stream)")
        },
        async (input) => {
            const compact = input.data_base64.replace(/\s+/g, "");
            let data: Buffer;
            try {
                data = Buffer.from(compact, "base64");
            } catch {
                const failurePayload: UploadRepoReleaseAssetFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: "data_base64 must be valid base64.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            if (data.byteLength === 0) {
                const failurePayload: UploadRepoReleaseAssetFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: "Decoded asset data is empty.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            if (data.byteLength > MAX_UPLOAD_BYTES) {
                const failurePayload: UploadRepoReleaseAssetFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: `Decoded asset exceeds ${MAX_UPLOAD_BYTES} bytes (25 MiB) for this MCP tool.`,
                        hint: "Upload larger assets with a direct client to uploads.github.com using the release upload_url.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            try {
                const response = await octokit.rest.repos.uploadReleaseAsset({
                    owner: input.owner,
                    repo: input.name,
                    release_id: input.release_id,
                    name: input.asset_name,
                    ...(input.label !== undefined ? { label: input.label } : {}),
                    data: data as unknown as string,
                    headers: {
                        "content-type": input.content_type ?? "application/octet-stream",
                        "content-length": data.byteLength
                    }
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UploadRepoReleaseAssetSuccess = {
                    success: true,
                    message: "Release asset uploaded successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    release_id: input.release_id,
                    asset: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UploadRepoReleaseAssetFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
