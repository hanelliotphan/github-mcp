import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DownloadRepoArchiveTarballFailure,
    DownloadRepoArchiveTarballSuccess,
    ErrorEnvelope
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function headerLocation(headers: Record<string, unknown>): string | undefined {
    const raw = headers.location ?? headers.Location;
    if (typeof raw === "string" && raw.length > 0) {
        return raw;
    }
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "string") {
        return raw[0];
    }
    return undefined;
}

function unexpectedRedirectError(status: number): ErrorEnvelope {
    return {
        status_code: status,
        error_type: "unknown_error",
        message: `Expected HTTP 302 with a Location header for the tarball redirect; got status ${status}.`,
        hint: "If this persists, GitHub may have changed the archive API. You can also try GET /repos/{owner}/{repo}/tarball/{ref} with redirect: manual.",
        retryable: false
    };
}

export function registerGithubDownloadRepoArchiveTarballTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_download_repo_archive_tarball",
        "Get a temporary download URL for a repository source archive as a tar.gz (GET /repos/{owner}/{repo}/tarball/{ref}). " +
            "GitHub responds with HTTP 302 and a Location URL—this tool returns that URL without downloading the archive. " +
            "Use a branch, tag, or commit SHA for ref. For private repositories, these links expire after a few minutes.",
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
            ref: z
                .string()
                .min(1)
                .max(255)
                .describe("Branch, tag, or commit SHA to archive (required path segment for the tarball endpoint).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.downloadTarballArchive({
                    owner: input.owner,
                    repo: input.name,
                    ref: input.ref,
                    request: { redirect: "manual" }
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const headers = response.headers as Record<string, unknown>;
                const archiveDownloadUrl = headerLocation(headers);

                if (response.status !== 302 || !archiveDownloadUrl) {
                    const failurePayload: DownloadRepoArchiveTarballFailure = {
                        success: false,
                        error: unexpectedRedirectError(response.status),
                        request_id: requestId
                    };
                    return textAndData(failurePayload);
                }

                const successPayload: DownloadRepoArchiveTarballSuccess = {
                    success: true,
                    message: "Tarball redirect URL retrieved successfully. Follow the URL with GET (e.g. curl -L) to download; private-repo URLs expire quickly.",
                    http_status: response.status,
                    archive_download_url: archiveDownloadUrl,
                    ref: input.ref,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DownloadRepoArchiveTarballFailure = {
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
