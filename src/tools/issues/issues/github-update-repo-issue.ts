import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateRepoIssueSuccess, UpdateRepoIssueFailure } from "../../../types.js";
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


export function registerGithubUpdateRepoIssueTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_issue",
        "Update an issue (PATCH /repos/{owner}/{repo}/issues/{issue_number}). Optional title, body, state, state_reason, milestone, labels, assignees, type. See [Update an issue](https://docs.github.com/en/rest/issues/issues?apiVersion=2026-03-10#update-an-issue).",
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
            issue_number: z.number().int().positive(),            title: z.string().optional(),
            body: z.string().nullable().optional(),
            state: z.enum(["open", "closed"]).optional(),
            state_reason: z.enum(["completed", "not_planned", "reopened"]).optional(),
            milestone: z.number().int().positive().nullable().optional(),
            labels: z.array(z.string()).optional(),
            assignees: z.array(z.string()).optional(),
            type: z.string().nullable().optional(),
        },
        async (input) => {
            try {
                const body = {
                    issue_number: input.issue_number,
                    ...(input.title !== undefined ? { title: input.title } : {}),
                    ...(input.body !== undefined ? { body: input.body ?? undefined } : {}),
                    ...(input.state !== undefined ? { state: input.state } : {}),
                    ...(input.state_reason !== undefined ? { state_reason: input.state_reason } : {}),
                    ...(input.milestone !== undefined ? { milestone: input.milestone ?? undefined } : {}),
                    ...(input.labels !== undefined ? { labels: input.labels } : {}),
                    ...(input.assignees !== undefined ? { assignees: input.assignees } : {}),
                    ...(input.type !== undefined ? { type: input.type ?? undefined } : {}),
                };
                const response = await octokit.rest.issues.update({
                    owner: input.owner,
                    repo: input.name,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateRepoIssueSuccess = {
                    success: true,
                    message: "Issue updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    issue_number: input.issue_number,
                    issue: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoIssueFailure = {
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
