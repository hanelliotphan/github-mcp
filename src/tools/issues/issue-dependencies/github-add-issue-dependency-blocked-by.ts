import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { AddIssueDependencyBlockedBySuccess, AddIssueDependencyBlockedByFailure } from "../../../types.js";
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


export function registerGithubAddIssueDependencyBlockedByTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_issue_dependency_blocked_by",
        "Add a blocked-by dependency (POST /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by). Success is HTTP 201. See [Add a blocked-by dependency](https://docs.github.com/en/rest/issues/issue-dependencies?apiVersion=2026-03-10#add-a-blocked-by-dependency).",
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
            issue_number: z.number().int().positive(),            issue_id: z.number().int().positive(),
        },
        async (input) => {
            try {
                const response = await octokit.rest.issues.addBlockedByDependency({
                    owner: input.owner,
                    repo: input.name,
                    issue_number: input.issue_number,
                    issue_id: input.issue_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AddIssueDependencyBlockedBySuccess = {
                    success: true,
                    message: "Blocked-by dependency added successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    issue_number: input.issue_number,
                    issue_id: input.issue_id,
                    issue: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddIssueDependencyBlockedByFailure = {
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
