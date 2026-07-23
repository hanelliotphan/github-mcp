import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetRepoInteractionLimitsFailure,
    SetRepoInteractionLimitsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const interactionLimitSchema = z.enum(["existing_users", "contributors_only", "collaborators_only"]);
const interactionExpirySchema = z.enum(["one_day", "three_days", "one_week", "one_month", "six_months"]);

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubSetRepoInteractionLimitsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_repo_interaction_limits",
        "Set interaction restrictions for a repository (PUT /repos/{owner}/{repo}/interaction-limits). " +
            "MCP **`name`** maps to API **`repo`**. Returns **409** if an organization-level limit is already set for the owner. " +
            "See [Set interaction restrictions for a repository](https://docs.github.com/en/rest/interactions/repos?apiVersion=2026-03-10#set-interaction-restrictions-for-a-repository).",
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
            limit: interactionLimitSchema.describe(
                "Type of GitHub user allowed to interact while the restriction is active."
            ),
            expiry: interactionExpirySchema
                .optional()
                .describe("Duration of the restriction. Default: one_day.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.interactions.setRestrictionsForRepo({
                    owner: input.owner,
                    repo: input.name,
                    limit: input.limit,
                    expiry: input.expiry
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetRepoInteractionLimitsSuccess = {
                    success: true,
                    message: "Repository interaction limits set successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    interaction_limits: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetRepoInteractionLimitsFailure = {
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
