import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CheckRepoCodespacePermissionsFailure,
    CheckRepoCodespacePermissionsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCheckRepoCodespacePermissionsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_repo_codespace_permissions",
        "Check whether devcontainer permissions are accepted (GET /repos/{owner}/{repo}/codespaces/permissions_check). Requires ref and devcontainer_path. Returns accepted boolean. See GitHub REST Codespaces.",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            ref: z.string(),
            devcontainer_path: z.string()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.request("GET /repos/{owner}/{repo}/codespaces/permissions_check", {
                    owner: input.owner,
                    repo: input.name,
                    ref: input.ref,
                    devcontainer_path: input.devcontainer_path
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckRepoCodespacePermissionsSuccess = {
                    success: true,
                    message: "Repository codespace permissions checked successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    accepted: (response.data as { accepted?: boolean }).accepted === true,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CheckRepoCodespacePermissionsFailure = {
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
