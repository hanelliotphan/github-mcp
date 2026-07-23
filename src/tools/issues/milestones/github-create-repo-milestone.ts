import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoMilestoneSuccess, CreateRepoMilestoneFailure } from "../../../types.js";
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


export function registerGithubCreateRepoMilestoneTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_milestone",
        "Create a milestone (POST /repos/{owner}/{repo}/milestones). Required title; optional state, description, due_on. Success is HTTP 201. See [Create a milestone](https://docs.github.com/en/rest/issues/milestones?apiVersion=2026-03-10#create-a-milestone).",
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
            title: z.string().min(1),            state: z.enum(["open", "closed"]).optional(),
            description: z.string().optional(),
            due_on: z.string().optional(),
        },
        async (input) => {
            try {
                const body = {
                    title: input.title,
                    ...(input.state !== undefined ? { state: input.state } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.due_on !== undefined ? { due_on: input.due_on } : {}),
                };
                const response = await octokit.rest.issues.createMilestone({
                    owner: input.owner,
                    repo: input.name,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoMilestoneSuccess = {
                    success: true,
                    message: "Milestone created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    milestone: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoMilestoneFailure = {
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
