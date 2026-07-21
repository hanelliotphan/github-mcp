import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DownloadArtifactFailure,
    DownloadArtifactSuccess,
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
        message: `Expected HTTP 302 with a Location header for the artifact archive redirect; got status ${status}.`,
        hint: "The artifact may have expired (410 Gone). Otherwise GitHub may have changed the archive API.",
        retryable: false
    };
}

export function registerGithubDownloadArtifactTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_download_artifact",
        "Get a temporary download URL for a GitHub Actions artifact archive (GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}). " +
            "GitHub responds with HTTP 302 and a Location URL—this tool returns that URL without downloading the archive. " +
            "The URL expires after **1 minute**; follow it with GET (e.g. curl -L) to download. **`archive_format`** must be **`zip`**. " +
            "Use **`artifact_id`** from `github_list_artifacts_for_repo` or `github_list_workflow_run_artifacts`. " +
            "Classic OAuth apps and PATs need the **`repo`** scope. An expired artifact returns **410 Gone**. " +
            "See [Download an artifact](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10#download-an-artifact).",
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
            artifact_id: z.number().int().positive().describe("The unique identifier of the artifact."),
            archive_format: z
                .literal("zip")
                .optional()
                .default("zip")
                .describe("Archive format for the download. GitHub only supports `zip`.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.downloadArtifact({
                    owner: input.owner,
                    repo: input.name,
                    artifact_id: input.artifact_id,
                    archive_format: input.archive_format,
                    request: { redirect: "manual" }
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const headers = response.headers as Record<string, unknown>;
                const archiveDownloadUrl = headerLocation(headers);

                if (response.status !== 302 || !archiveDownloadUrl) {
                    const failurePayload: DownloadArtifactFailure = {
                        success: false,
                        error: unexpectedRedirectError(response.status),
                        request_id: requestId
                    };
                    return textAndData(failurePayload);
                }

                const successPayload: DownloadArtifactSuccess = {
                    success: true,
                    message: "Artifact archive redirect URL retrieved successfully. Follow the URL with GET (e.g. curl -L) to download; it expires after 1 minute.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    artifact_id: input.artifact_id,
                    archive_format: input.archive_format,
                    archive_download_url: archiveDownloadUrl,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DownloadArtifactFailure = {
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
