import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateRepoLabelSuccess, UpdateRepoLabelFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

const DEFAULT_PER_PAGE = 100 as const;


export function registerGithubUpdateRepoLabelTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_label",
        "Update a label (PATCH /repos/{owner}/{repo}/labels/{name}). MCP label_name maps to API path name; optional new_name, color, description. See [Update a label](https://docs.github.com/en/rest/issues/labels?apiVersion=2026-03-10#update-a-label).",
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
            label_name: z.string().min(1).describe("Label name (maps to API name)."),            new_name: z.string().optional(),
            color: z.string().optional(),
            description: z.string().optional(),
        },
        async (input) => {
            try {
                const response = await octokit.rest.issues.updateLabel({ owner: input.owner, repo: input.name, name: input.label_name,
                    ...(input.new_name !== undefined ? { new_name: input.new_name } : {}),
                    ...(input.color !== undefined ? { color: input.color } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}) });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateRepoLabelSuccess = {
                    success: true,
                    message: "Repository label updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    label_name: input.label_name,
                    label: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoLabelFailure = {
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
