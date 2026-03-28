import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ReplaceRepoTopicsFailure, ReplaceRepoTopicsSuccess } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** GitHub allows up to 20 topics per repository; names are stored lowercase server-side. */
const MAX_REPO_TOPICS = 20 as const;

export function registerGithubReplaceRepoTopicsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_replace_repo_topics",
        "Replace all repository topics (PUT /repos/{owner}/{repo}/topics). " +
            "Replaces the entire topic set with `names`; pass an empty array to clear all topics. " +
            "At most 20 topic names (GitHub limit). Requires write access; classic tokens need the repo scope.",
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
            names: z
                .array(z.string().min(1).max(50))
                .max(MAX_REPO_TOPICS)
                .describe(
                    "Topic names to set (replaces existing). Use [] to clear. GitHub persists lowercase names."
                )
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.repos.replaceAllTopics({
                    owner: input.owner,
                    repo: input.name,
                    names: input.names
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const names = Array.isArray(response.data.names) ? response.data.names : [];
                const successPayload: ReplaceRepoTopicsSuccess = {
                    success: true,
                    message:
                        input.names.length === 0
                            ? "All repository topics cleared successfully."
                            : "Repository topics replaced successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    names,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ReplaceRepoTopicsFailure = {
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
