import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoIssueSuccess, CreateRepoIssueFailure } from "../../../types.js";
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


export function registerGithubCreateRepoIssueTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_issue",
        "Create an issue (POST /repos/{owner}/{repo}/issues). Required title; optional body, assignees, milestone, labels, type. Success is HTTP 201. See [Create an issue](https://docs.github.com/en/rest/issues/issues?apiVersion=2026-03-10#create-an-issue).",
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
            title: z.string().min(1),            body: z.string().optional(),
            assignees: z.array(z.string()).optional(),
            milestone: z.number().int().positive().optional(),
            labels: z.array(z.string()).optional(),
            type: z.string().optional(),
        },
        async (input) => {
            try {
                const body = {
                    title: input.title,
                    ...(input.body !== undefined ? { body: input.body } : {}),
                    ...(input.assignees !== undefined ? { assignees: input.assignees } : {}),
                    ...(input.milestone !== undefined ? { milestone: input.milestone } : {}),
                    ...(input.labels !== undefined ? { labels: input.labels } : {}),
                    ...(input.type !== undefined ? { type: input.type } : {}),
                };
                const response = await octokit.rest.issues.create({
                    owner: input.owner,
                    repo: input.name,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoIssueSuccess = {
                    success: true,
                    message: "Issue created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    issue: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoIssueFailure = {
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
