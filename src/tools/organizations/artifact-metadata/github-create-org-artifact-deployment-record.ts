import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgArtifactDeploymentRecordFailure,
    CreateOrgArtifactDeploymentRecordSuccess
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

export function registerGithubCreateOrgArtifactDeploymentRecordTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_artifact_deployment_record",
        "Create or update an **artifact deployment record** for an organization (POST /orgs/{org}/artifacts/metadata/deployment-record). " +
            "Records where an artifact (by **`digest`**) is deployed; repeated calls for the same cluster + environments + **`deployment_name`** update the same record. " +
            "Requires org access per GitHub for [artifact metadata](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10). " +
            "Success is HTTP **200** with **`total_count`** and **`deployment_records`** when **`return_records`** is true (GitHub default). " +
            "See [Create an artifact deployment record](https://docs.github.com/en/rest/orgs/artifact-metadata?apiVersion=2026-03-10#create-an-artifact-deployment-record).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z.string().min(1).describe("Artifact name."),
            digest: z
                .string()
                .min(1)
                .describe("Hex-encoded digest of the artifact (e.g. sha256:… per GitHub)."),
            status: deploymentStatusSchema,
            logical_environment: z.string().min(1).describe("Deployment stage (e.g. prod)."),
            deployment_name: z
                .string()
                .min(1)
                .describe("Unique deployment id within the cluster; GitHub recommends namespace-deployment-container shape."),
            version: z.string().min(1).optional(),
            physical_environment: z.string().min(1).optional(),
            cluster: z.string().min(1).optional(),
            tags: z.record(z.string(), z.string()).optional(),
            runtime_risks: z.array(runtimeRiskSchema).max(20).optional(),
            github_repository: z.string().min(1).optional(),
            return_records: z.boolean().optional()
        },
        async (input) => {
            const body: Record<string, unknown> = {
                name: input.name,
                digest: input.digest,
                status: input.status,
                logical_environment: input.logical_environment,
                deployment_name: input.deployment_name
            };
            if (input.version !== undefined) {
                body.version = input.version;
            }
            if (input.physical_environment !== undefined) {
                body.physical_environment = input.physical_environment;
            }
            if (input.cluster !== undefined) {
                body.cluster = input.cluster;
            }
            if (input.tags !== undefined) {
                body.tags = input.tags;
            }
            if (input.runtime_risks !== undefined) {
                body.runtime_risks = input.runtime_risks;
            }
            if (input.github_repository !== undefined) {
                body.github_repository = input.github_repository;
            }
            if (input.return_records !== undefined) {
                body.return_records = input.return_records;
            }

            try {
                const response = await octokit.request(
                    "POST /orgs/{org}/artifacts/metadata/deployment-record",
                    {
                        org: input.org,
                        ...body
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const payload = toPlainDeploymentResponse(response.data);
                const successPayload: CreateOrgArtifactDeploymentRecordSuccess = {
                    success: true,
                    message: "Artifact deployment record stored successfully.",
                    http_status: response.status,
                    org: input.org,
                    total_count: payload.total_count,
                    deployment_records: payload.deployment_records,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgArtifactDeploymentRecordFailure = {
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
