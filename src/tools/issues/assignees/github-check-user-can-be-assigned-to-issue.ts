import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CheckUserCanBeAssignedToIssueSuccess, CheckUserCanBeAssignedToIssueFailure } from "../../../types.js";
import { getRequestId, isHttpStatus, mapGitHubError } from "../../../utils/errors.js";
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


export function registerGithubCheckUserCanBeAssignedToIssueTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_user_can_be_assigned_to_issue",
        "Check if a user can be assigned to a specific issue (GET /repos/{owner}/{repo}/issues/{issue_number}/assignees/{assignee}). HTTP 204 means assignable; 404 returns can_be_assigned: false. See [Check if a user can be assigned to an issue](https://docs.github.com/en/rest/issues/assignees?apiVersion=2026-03-10#check-if-a-user-can-be-assigned-to-an-issue).",
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
            issue_number: z.number().int().positive(),
            assignee: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "assignee must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.issues.checkUserCanBeAssignedToIssue({
                    owner: input.owner,
                    repo: input.name,
                    issue_number: input.issue_number, assignee: input.assignee
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckUserCanBeAssignedToIssueSuccess = {
                    success: true,
                    message: "User can be assigned.",
                    owner: input.owner,
                    name: input.name,
                    issue_number: input.issue_number,
                    assignee: input.assignee,
                    can_be_assigned: true,
                    http_status: response.status as number,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                if (isHttpStatus(error, 404)) {
                    const successPayload: CheckUserCanBeAssignedToIssueSuccess = {
                        success: true,
                        message: "GitHub returned 404: user cannot be assigned (or resource not found).",
                        owner: input.owner,
                        name: input.name,
                        issue_number: input.issue_number,
                    assignee: input.assignee,
                        can_be_assigned: false,
                        http_status: 404,
                        request_id: getRequestId(
                            (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                                "x-github-request-id"
                            ]
                        )
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: CheckUserCanBeAssignedToIssueFailure = {
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
