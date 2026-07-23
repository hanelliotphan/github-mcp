import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateRepoMilestoneSuccess, UpdateRepoMilestoneFailure } from "../../../types.js";
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


export function registerGithubUpdateRepoMilestoneTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_milestone",
        "Update a milestone (PATCH /repos/{owner}/{repo}/milestones/{milestone_number}). See [Update a milestone](https://docs.github.com/en/rest/issues/milestones?apiVersion=2026-03-10#update-a-milestone).",
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
            milestone_number: z.number().int().positive(),            title: z.string().optional(),
            state: z.enum(["open", "closed"]).optional(),
            description: z.string().nullable().optional(),
            due_on: z.string().nullable().optional(),
        },
        async (input) => {
            try {
                const body = {
                    milestone_number: input.milestone_number,
                    ...(input.title !== undefined ? { title: input.title } : {}),
                    ...(input.state !== undefined ? { state: input.state } : {}),
                    ...(input.description !== undefined ? { description: input.description ?? undefined } : {}),
                    ...(input.due_on !== undefined ? { due_on: input.due_on ?? undefined } : {}),
                };
                const response = await octokit.rest.issues.updateMilestone({
                    owner: input.owner,
                    repo: input.name,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateRepoMilestoneSuccess = {
                    success: true,
                    message: "Milestone updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    milestone_number: input.milestone_number,
                    milestone: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoMilestoneFailure = {
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
