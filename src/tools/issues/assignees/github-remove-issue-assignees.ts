import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RemoveIssueAssigneesSuccess, RemoveIssueAssigneesFailure } from "../../../types.js";
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


export function registerGithubRemoveIssueAssigneesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_issue_assignees",
        "Remove assignees from an issue (DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees). See [Remove assignees from an issue](https://docs.github.com/en/rest/issues/assignees?apiVersion=2026-03-10#remove-assignees-from-an-issue).",
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
            assignees: z.array(z.string().min(1)).min(1).describe("GitHub usernames to remove from assignees."),
        },
        async (input) => {
            try {
                const response = await octokit.rest.issues.removeAssignees({
                    owner: input.owner,
                    repo: input.name,
                    issue_number: input.issue_number,
                    assignees: input.assignees
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveIssueAssigneesSuccess = {
                    success: true,
                    message: "Assignees removed successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    issue_number: input.issue_number,
                    issue: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveIssueAssigneesFailure = {
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
