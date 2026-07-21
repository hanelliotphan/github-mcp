import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ArtifactItem, GetArtifactFailure, GetArtifactSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainArtifact(data: unknown): ArtifactItem {
    return JSON.parse(JSON.stringify(data)) as ArtifactItem;
}

export function registerGithubGetArtifactTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_artifact",
        "Get a specific GitHub Actions artifact for a workflow run (GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}). " +
            "Returns the artifact object (`id`, `name`, `size_in_bytes`, `archive_download_url`, `expired`, `created_at`, `expires_at`, `workflow_run`, …). " +
            "Use **`artifact_id`** from `github_list_artifacts_for_repo` or `github_list_workflow_run_artifacts`. " +
            "Anyone with **read** access can use this; classic tokens need **`repo`** scope for private repositories. " +
            "See [Get an artifact](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10#get-an-artifact).",
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
            artifact_id: z.number().int().positive().describe("The unique identifier of the artifact.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.getArtifact({
                    owner: input.owner,
                    repo: input.name,
                    artifact_id: input.artifact_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetArtifactSuccess = {
                    success: true,
                    message: "Artifact retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    artifact_id: input.artifact_id,
                    artifact: toPlainArtifact(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetArtifactFailure = {
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
