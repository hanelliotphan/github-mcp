import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreatePullRequestCodespaceFailure,
    CreatePullRequestCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreatePullRequestCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_pull_request_codespace",
        "Create a codespace from a pull request (POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces). Same optional create body fields as create_repo_codespace. See GitHub REST Codespaces.",
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
            pull_number: z.number().int().positive().describe("The pull request number."),
            ref: z.string().optional(),
            location: z.string().optional(),
            geo: z.enum(["EuropeWest", "SoutheastAsia", "UsEast", "UsWest"]).optional(),
            client_ip: z.string().optional(),
            machine: z.string().optional(),
            devcontainer_path: z.string().optional(),
            multi_repo_permissions_opt_out: z.boolean().optional(),
            working_directory: z.string().optional(),
            idle_timeout_minutes: z.number().int().optional(),
            display_name: z.string().optional(),
            retention_period_minutes: z.number().int().min(0).max(43200).optional()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.request("POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces", {
                    owner: input.owner,
                    repo: input.name,
                    pull_number: input.pull_number,
                    ...((input.ref !== undefined) ? { ref: input.ref } : {}),
                    ...((input.location !== undefined) ? { location: input.location } : {}),
                    ...((input.geo !== undefined) ? { geo: input.geo } : {}),
                    ...((input.client_ip !== undefined) ? { client_ip: input.client_ip } : {}),
                    ...((input.machine !== undefined) ? { machine: input.machine } : {}),
                    ...((input.devcontainer_path !== undefined) ? { devcontainer_path: input.devcontainer_path } : {}),
                    ...((input.multi_repo_permissions_opt_out !== undefined) ? { multi_repo_permissions_opt_out: input.multi_repo_permissions_opt_out } : {}),
                    ...((input.working_directory !== undefined) ? { working_directory: input.working_directory } : {}),
                    ...((input.idle_timeout_minutes !== undefined) ? { idle_timeout_minutes: input.idle_timeout_minutes } : {}),
                    ...((input.display_name !== undefined) ? { display_name: input.display_name } : {}),
                    ...((input.retention_period_minutes !== undefined) ? { retention_period_minutes: input.retention_period_minutes } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreatePullRequestCodespaceSuccess = {
                    success: true,
                    message: response.status === 202
                        ? "Codespace creation accepted; GitHub is retrying in the background."
                        : "Codespace created successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreatePullRequestCodespaceFailure = {
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
