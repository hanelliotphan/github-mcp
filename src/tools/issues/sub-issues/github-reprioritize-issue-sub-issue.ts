import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ReprioritizeIssueSubIssueSuccess, ReprioritizeIssueSubIssueFailure } from "../../../types.js";
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


export function registerGithubReprioritizeIssueSubIssueTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_reprioritize_issue_sub_issue",
        "Reprioritize a sub-issue (PATCH /repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority). Required sub_issue_id; optional after_id or before_id. See [Reprioritize a sub-issue](https://docs.github.com/en/rest/issues/sub-issues?apiVersion=2026-03-10#reprioritize-a-sub-issue).",
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
            issue_number: z.number().int().positive(),            sub_issue_id: z.number().int().positive(),            after_id: z.number().int().positive().optional(),
            before_id: z.number().int().positive().optional(),
        },
        async (input) => {
            try {
                const body = {
                    issue_number: input.issue_number,
                    sub_issue_id: input.sub_issue_id,
                    ...(input.after_id !== undefined ? { after_id: input.after_id } : {}),
                    ...(input.before_id !== undefined ? { before_id: input.before_id } : {}),
                };
                const response = await octokit.rest.issues.reprioritizeSubIssue({
                    owner: input.owner,
                    repo: input.name,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ReprioritizeIssueSubIssueSuccess = {
                    success: true,
                    message: "Sub-issue reprioritized successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    issue_number: input.issue_number,
                    sub_issue_id: input.sub_issue_id,
                    issue: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ReprioritizeIssueSubIssueFailure = {
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
