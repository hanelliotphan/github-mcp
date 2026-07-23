import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GenerateRepoSbomReportFailure,
    GenerateRepoSbomReportSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function extractSbomUrl(data: unknown): string | null {
    if (data && typeof data === "object" && "sbom_url" in data) {
        const url = (data as { sbom_url?: unknown }).sbom_url;
        return typeof url === "string" && url.length > 0 ? url : null;
    }
    return null;
}

function extractSbomUuidFromUrl(sbomUrl: string): string | null {
    const match = sbomUrl.match(/fetch-report\/([^/?#]+)/);
    return match?.[1] ?? null;
}

export function registerGithubGenerateRepoSbomReportTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_generate_repo_sbom_report",
        "Request generation of an SBOM for a repository (GET /repos/{owner}/{repo}/dependency-graph/sbom/generate-report). " +
            "Returns **201** with **`sbom_url`** (and best-effort **`sbom_uuid`** parsed from that URL). " +
            "Poll **`github_fetch_repo_sbom_report`** until ready. " +
            "See [Request generation of a software bill of materials (SBOM) for a repository](https://docs.github.com/en/rest/dependency-graph/sboms?apiVersion=2026-03-10#request-generation-of-a-software-bill-of-materials-sbom-for-a-repository).",
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
                )
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /repos/{owner}/{repo}/dependency-graph/sbom/generate-report",
                    {
                        owner: input.owner,
                        repo: input.name
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const sbomUrl = extractSbomUrl(response.data);
                const successPayload: GenerateRepoSbomReportSuccess = {
                    success: true,
                    message: "SBOM report generation requested successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    sbom_url: sbomUrl,
                    sbom_uuid: sbomUrl ? extractSbomUuidFromUrl(sbomUrl) : null,
                    report: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GenerateRepoSbomReportFailure = {
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
