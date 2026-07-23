import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CompareRepoDependencyGraphFailure,
    CompareRepoDependencyGraphSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubCompareRepoDependencyGraphTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_compare_repo_dependency_graph",
        "Get a diff of the dependencies between commits (GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}). " +
            "Pass **`base`** and **`head`** (resolved as `base...head`). Optional **`manifest`** is the dependency manifest path " +
            "(maps to the API `name` query param; MCP **`name`** is the repository). " +
            "See [Get a diff of the dependencies between commits](https://docs.github.com/en/rest/dependency-graph/dependency-review?apiVersion=2026-03-10#get-a-diff-of-the-dependencies-between-commits).",
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
            base: z.string().min(1),
            head: z.string().min(1),
            manifest: z
                .string()
                .min(1)
                .optional()
                .describe("Full path of the dependency manifest relative to the repo root (API query param `name`).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.dependencyGraph.diffRange({
                    owner: input.owner,
                    repo: input.name,
                    basehead: `${input.base}...${input.head}`,
                    ...(input.manifest !== undefined ? { name: input.manifest } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const changes = Array.isArray(response.data) ? toPlainRows(response.data) : [];
                const successPayload: CompareRepoDependencyGraphSuccess = {
                    success: true,
                    message: "Dependency graph diff retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    base: input.base,
                    head: input.head,
                    changes,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CompareRepoDependencyGraphFailure = {
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
