import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateRepoReleaseAssetSuccess,
    UpdateRepoReleaseAssetFailure
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

export function registerGithubUpdateRepoReleaseAssetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_release_asset",
        "Update a release asset (PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}). " +
            "MCP **`asset_name`** maps to API **`name`**. Optional **`label`**, **`state`**. " +
            "See [Update a release asset](https://docs.github.com/en/rest/releases/assets?apiVersion=2026-03-10#update-a-release-asset).",
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
            asset_id: z.number().int().positive(),
            asset_name: z
                .string()
                .min(1)
                .optional()
                .describe("Asset file name (MCP `asset_name` → API `name`)"),
            label: z.string().optional(),
            state: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updateReleaseAsset({
                    owner: input.owner,
                    repo: input.name,
                    asset_id: input.asset_id,
                    ...(input.asset_name !== undefined ? { name: input.asset_name } : {}),
                    ...(input.label !== undefined ? { label: input.label } : {}),
                    ...(input.state !== undefined ? { state: input.state } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateRepoReleaseAssetSuccess = {
                    success: true,
                    message: "Release asset updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    asset_id: input.asset_id,
                    asset: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoReleaseAssetFailure = {
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
