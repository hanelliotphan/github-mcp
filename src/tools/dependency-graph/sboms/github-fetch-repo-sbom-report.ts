import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ErrorEnvelope,
    FetchRepoSbomReportFailure,
    FetchRepoSbomReportSuccess
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

function unexpectedFetchStatusError(status: number): ErrorEnvelope {
    return {
        status_code: status,
        error_type: "unknown_error",
        message: `Expected HTTP 202 (processing) or 302 (redirect to SBOM download URL); got status ${status}.`,
        hint: "Use github_generate_repo_sbom_report first, then poll with the returned sbom UUID. Reports may be retained for up to one week.",
        retryable: false
    };
}

export function registerGithubFetchRepoSbomReportTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_fetch_repo_sbom_report",
        "Fetch a previously generated SBOM report (GET /repos/{owner}/{repo}/dependency-graph/sbom/fetch-report/{sbom_uuid}). " +
            "Uses **`redirect: manual`**: **202** means still processing; **302** returns **`sbom_download_url`** from the Location header " +
            "(temporary download URL; follow with GET). Get **`sbom_uuid`** from the generate-report flow / **`sbom_url`**. " +
            "See [Fetch a software bill of materials (SBOM) for a repository](https://docs.github.com/en/rest/dependency-graph/sboms?apiVersion=2026-03-10#fetch-a-software-bill-of-materials-sbom-for-a-repository).",
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
            sbom_uuid: z.string().min(1).describe("Unique identifier of the SBOM export.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /repos/{owner}/{repo}/dependency-graph/sbom/fetch-report/{sbom_uuid}",
                    {
                        owner: input.owner,
                        repo: input.name,
                        sbom_uuid: input.sbom_uuid,
                        request: { redirect: "manual" }
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const headers = response.headers as Record<string, unknown>;
                const status = response.status as number;

                if (status === 202) {
                    const successPayload: FetchRepoSbomReportSuccess = {
                        success: true,
                        message: "SBOM report is still being processed. Poll again later.",
                        http_status: 202,
                        owner: input.owner,
                        name: input.name,
                        sbom_uuid: input.sbom_uuid,
                        ready: false,
                        sbom_download_url: null,
                        request_id: requestId
                    };
                    return textAndData(successPayload);
                }

                const downloadUrl = headerLocation(headers);
                if (status === 302 && downloadUrl) {
                    const successPayload: FetchRepoSbomReportSuccess = {
                        success: true,
                        message:
                            "SBOM report download URL retrieved successfully. Follow the URL with GET (e.g. curl -L); the temporary URL expires separately from the retained report.",
                        http_status: 302,
                        owner: input.owner,
                        name: input.name,
                        sbom_uuid: input.sbom_uuid,
                        ready: true,
                        sbom_download_url: downloadUrl,
                        request_id: requestId
                    };
                    return textAndData(successPayload);
                }

                const failurePayload: FetchRepoSbomReportFailure = {
                    success: false,
                    error: unexpectedFetchStatusError(status),
                    request_id: requestId
                };
                return textAndData(failurePayload);
            } catch (error: unknown) {
                const failurePayload: FetchRepoSbomReportFailure = {
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
