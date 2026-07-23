import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteIssueFieldValueSuccess, DeleteIssueFieldValueFailure } from "../../../types.js";
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


export function registerGithubDeleteIssueFieldValueTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_issue_field_value",
        "Delete an issue field value (DELETE /repos/{owner}/{repo}/issues/{issue_number}/issue-field-values/{issue_field_id}). See [Delete an issue field value](https://docs.github.com/en/rest/issues/issue-field-values?apiVersion=2026-03-10#delete-an-issue-field-value).",
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
            issue_number: z.number().int().positive(),            issue_field_id: z.number().int().positive(),
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /repos/{owner}/{repo}/issues/{issue_number}/issue-field-values/{issue_field_id}", { owner: input.owner, repo: input.name, issue_number: input.issue_number, issue_field_id: input.issue_field_id } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteIssueFieldValueSuccess = {
                    success: true,
                    message: "Issue field value deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    issue_number: input.issue_number,
                    issue_field_id: input.issue_field_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteIssueFieldValueFailure = {
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
