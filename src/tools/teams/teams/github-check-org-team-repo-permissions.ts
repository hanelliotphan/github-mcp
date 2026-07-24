import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CheckOrgTeamRepoPermissionsFailure,
    CheckOrgTeamRepoPermissionsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> | null {
    if (data === undefined || data === null || data === "") {
        return null;
    }
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubCheckOrgTeamRepoPermissionsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_org_team_repo_permissions",
        "Check team permissions for a repository (GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}). " +
            "Returns **200** with repository details when the repository media type is provided, or **204** when the team has permission. " +
            "MCP **`name`** maps to API **`repo`**. " +
            "See [Check team permissions for a repository](https://docs.github.com/en/rest/teams/teams?apiVersion=2026-03-10#check-team-permissions-for-a-repository).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            team_slug: z.string().min(1).describe("The slug of the team name."),
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
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.teams.checkPermissionsForRepoInOrg({
                    org: input.org,
                    team_slug: input.team_slug,
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const repository = toPlain(response.data);
                const successPayload: CheckOrgTeamRepoPermissionsSuccess = {
                    success: true,
                    message: repository
                        ? "Team repository permissions retrieved successfully."
                        : "Team has permission for the repository.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    owner: input.owner,
                    name: input.name,
                    repository,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CheckOrgTeamRepoPermissionsFailure = {
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
