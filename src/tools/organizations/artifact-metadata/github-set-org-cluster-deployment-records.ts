import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetOrgClusterDeploymentRecordsFailure,
    SetOrgClusterDeploymentRecordsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const deploymentStatusSchema = z.enum(["deployed", "decommissioned"]);

const runtimeRiskSchema = z.enum([
    "critical-resource",
    "internet-exposed",
    "lateral-movement",
    "sensitive-data"
]);

const clusterDeploymentEntrySchema = z.object({
    name: z.string().min(1).describe("Name; must match across entries sharing the same digest."),
    digest: z.string().min(1).describe("Hex-encoded digest; name/version must match across entries sharing this digest."),
    version: z.string().min(1).optional(),
    status: deploymentStatusSchema.optional().describe("Defaults to deployed on GitHub."),
    deployment_name: z
        .string()
        .min(1)
        .describe("Unique within the deployments array; GitHub recommends namespace-deployment-container shape."),
    github_repository: z.string().min(1).optional(),
    tags: z.record(z.string(), z.string()).optional(),
    runtime_risks: z.array(runtimeRiskSchema).max(20).optional()
});

function toPlainDeploymentResponse(data: unknown): {
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

export function registerGithubSetOrgClusterDeploymentRecordsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_org_cluster_deployment_records",
        "Set **deployment records for a cluster** in an organization (POST /orgs/{org}/artifacts/metadata/deployment-record/cluster/{cluster}). " +
            "Bulk create or update rows in **`deployments`**; matching **`cluster`**, **`logical_environment`**, **`physical_environment`**, and **`deployment_name`** updates existing records. " +
            "Each entry needs **`name`**, **`digest`**, **`deployment_name`**; optional **`version`**, **`status`** (default **deployed**), **`github_repository`**, **`tags`**, **`runtime_risks`**. " +
            "Response matches [create deployment record](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#create-an-artifact-deployment-record) (**`total_count`**, **`deployment_records`**). " +
            "See [Set cluster deployment records](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#set-cluster-deployment-records).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            cluster: z.string().min(1).describe("Cluster name (path segment)."),
            logical_environment: z.string().min(1).describe("Deployment stage (e.g. prod)."),
            physical_environment: z.string().min(1).optional(),
            deployments: z
                .array(clusterDeploymentEntrySchema)
                .min(1)
                .describe("At least one deployment object; deployment_name must be unique within this array."),
            return_records: z.boolean().optional()
        },
        async (input) => {
            const body: Record<string, unknown> = {
                logical_environment: input.logical_environment,
                deployments: input.deployments.map((d) => {
                    const row: Record<string, unknown> = {
                        name: d.name,
                        digest: d.digest,
                        deployment_name: d.deployment_name
                    };
                    if (d.version !== undefined) {
                        row.version = d.version;
                    }
                    if (d.status !== undefined) {
                        row.status = d.status;
                    }
                    if (d.github_repository !== undefined) {
                        row.github_repository = d.github_repository;
                    }
                    if (d.tags !== undefined) {
                        row.tags = d.tags;
                    }
                    if (d.runtime_risks !== undefined) {
                        row.runtime_risks = d.runtime_risks;
                    }
                    return row;
                })
            };
            if (input.physical_environment !== undefined) {
                body.physical_environment = input.physical_environment;
            }
            if (input.return_records !== undefined) {
                body.return_records = input.return_records;
            }

            try {
                const response = await octokit.request(
                    "POST /orgs/{org}/artifacts/metadata/deployment-record/cluster/{cluster}",
                    {
                        org: input.org,
                        cluster: input.cluster,
                        ...body
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const payload = toPlainDeploymentResponse(response.data);
                const successPayload: SetOrgClusterDeploymentRecordsSuccess = {
                    success: true,
                    message: "Cluster deployment records stored successfully.",
                    http_status: response.status,
                    org: input.org,
                    cluster: input.cluster,
                    total_count: payload.total_count,
                    deployment_records: payload.deployment_records,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetOrgClusterDeploymentRecordsFailure = {
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
