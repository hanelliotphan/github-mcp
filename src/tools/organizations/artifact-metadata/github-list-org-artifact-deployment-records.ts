import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgArtifactDeploymentRecordsFailure,
    ListOrgArtifactDeploymentRecordsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainDeploymentListResponse(data: unknown): {
    total_count: number;
    deployment_records: Record<string, unknown>[];
} {
    const parsed = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    const total_count = typeof parsed.total_count === "number" ? parsed.total_count : 0;
    const raw = parsed.deployment_records;
    const deployment_records = Array.isArray(raw)
        ? (raw as unknown[]).map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>)
        : [];
    return { total_count, deployment_records };
}

export function registerGithubListOrgArtifactDeploymentRecordsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_artifact_deployment_records",
        "List **deployment records** for a subject digest in an organization (GET /orgs/{org}/artifacts/{subject_digest}/metadata/deployment-records). " +
            "Returns **`total_count`** and **`deployment_records`** on HTTP **200**. " +
            "See [List artifact deployment records](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#list-artifact-deployment-records).",
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
                .describe("Subject SHA256 digest in the form sha256:HEX_DIGEST (see GitHub REST docs).")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /orgs/{org}/artifacts/{subject_digest}/metadata/deployment-records",
                    {
                        org: input.org,
                        subject_digest: input.subject_digest
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const payload = toPlainDeploymentListResponse(response.data);
                const successPayload: ListOrgArtifactDeploymentRecordsSuccess = {
                    success: true,
                    message: "Deployment records listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    subject_digest: input.subject_digest,
                    total_count: payload.total_count,
                    deployment_records: payload.deployment_records,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgArtifactDeploymentRecordsFailure = {
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
