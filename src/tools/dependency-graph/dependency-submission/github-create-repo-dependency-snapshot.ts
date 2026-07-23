import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRepoDependencySnapshotFailure,
    CreateRepoDependencySnapshotSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

const snapshotJobSchema = z.object({
    id: z.string().min(1),
    correlator: z.string().min(1),
    html_url: z.string().url().optional()
});

const snapshotDetectorSchema = z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    url: z.string().url()
});

const metadataSchema = z.record(z.string(), z.unknown()).optional();

export function registerGithubCreateRepoDependencySnapshotTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_dependency_snapshot",
        "Create a snapshot of dependencies for a repository (POST /repos/{owner}/{repo}/dependency-graph/snapshots). " +
            "Requires **`version`**, **`sha`**, **`ref`**, **`job`** (`id`, `correlator`), **`detector`** (`name`, `version`, `url`), and **`scanned`** (ISO timestamp). " +
            "Optional **`metadata`** and **`manifests`**. Classic tokens need `repo`. " +
            "See [Create a snapshot of dependencies for a repository](https://docs.github.com/en/rest/dependency-graph/dependency-submission?apiVersion=2026-03-10#create-a-snapshot-of-dependencies-for-a-repository).",
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
            version: z.number().int(),
            sha: z.string().min(1).max(40),
            ref: z.string().min(1),
            job: snapshotJobSchema,
            detector: snapshotDetectorSchema,
            scanned: z.string().min(1),
            metadata: metadataSchema,
            manifests: z.record(z.string(), z.unknown()).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.dependencyGraph.createRepositorySnapshot({
                    owner: input.owner,
                    repo: input.name,
                    version: input.version,
                    sha: input.sha,
                    ref: input.ref,
                    job: input.job,
                    detector: input.detector,
                    scanned: input.scanned,
                    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
                    ...(input.manifests !== undefined ? { manifests: input.manifests } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoDependencySnapshotSuccess = {
                    success: true,
                    message: "Dependency snapshot created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    snapshot: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoDependencySnapshotFailure = {
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
