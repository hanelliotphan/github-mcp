import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteRepoReleaseAssetSuccess,
    DeleteRepoReleaseAssetFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubDeleteRepoReleaseAssetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_release_asset",
        "Delete a release asset (DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}). Success is HTTP **204**. " +
            "See [Delete a release asset](https://docs.github.com/en/rest/releases/assets?apiVersion=2026-03-10#delete-a-release-asset).",
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
            asset_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.deleteReleaseAsset({
                    owner: input.owner,
                    repo: input.name,
                    asset_id: input.asset_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteRepoReleaseAssetSuccess = {
                    success: true,
                    message: "Release asset deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    asset_id: input.asset_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoReleaseAssetFailure = {
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
