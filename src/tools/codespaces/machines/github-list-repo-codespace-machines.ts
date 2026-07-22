import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoCodespaceMachinesFailure,
    ListRepoCodespaceMachinesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListRepoCodespaceMachinesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_codespace_machines",
        "List machine types for a repository codespace (GET /repos/{owner}/{repo}/codespaces/machines). Optional location, client_ip, ref. See GitHub REST Codespaces.",
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
            location: z.string().optional(),
            client_ip: z.string().optional(),
            ref: z.string().optional()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.request("GET /repos/{owner}/{repo}/codespaces/machines", {
                    owner: input.owner,
                    repo: input.name,
                    ...(input.location !== undefined ? { location: input.location } : {}),
                    ...(input.client_ip !== undefined ? { client_ip: input.client_ip } : {}),
                    ...(input.ref !== undefined ? { ref: input.ref } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = response.data as Record<string, unknown>;
                const machines = Array.isArray(data.machines) ? toPlain(data.machines) : [];
                const successPayload: ListRepoCodespaceMachinesSuccess = {
                    success: true,
                    message: "Codespace machines listed successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    machines,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoCodespaceMachinesFailure = {
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
