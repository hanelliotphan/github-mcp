import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateReleaseReactionSuccess,
    CreateReleaseReactionFailure
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

export function registerGithubCreateReleaseReactionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_release_reaction",
        "Create a reaction on a release (POST /repos/{owner}/{repo}/releases/{release_id}/reactions). " +
            "Requires **`content`**. HTTP **200** means the reaction already existed; **201** means it was created. " +
            "See [Create reaction for a release](https://docs.github.com/en/rest/reactions/reactions?apiVersion=2026-03-10#create-reaction-for-a-release).",
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
            release_id: z.number().int().positive(),
            content: z.enum(["+1", "laugh", "heart", "hooray", "rocket", "eyes"])
        },
        async (input) => {
            try {
                const response = await octokit.rest.reactions.createForRelease({
                    owner: input.owner,
                    repo: input.name,
                    release_id: input.release_id,
                    content: input.content
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateReleaseReactionSuccess = {
                    success: true,
                    message: "Release reaction created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    release_id: input.release_id,
                    reaction: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateReleaseReactionFailure = {
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
