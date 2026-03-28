import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CodeownersErrorItem,
    ListCodeownersErrorsFailure,
    ListCodeownersErrorsSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function normalizeCodeownersError(row: {
    line: number;
    column: number;
    source?: string | null;
    kind: string;
    suggestion?: string | null;
    message: string;
    path: string;
}): CodeownersErrorItem {
    return {
        line: row.line,
        column: row.column,
        source: row.source ?? null,
        kind: row.kind,
        suggestion: row.suggestion ?? null,
        message: row.message,
        path: row.path
    };
}

export function registerGithubListCodeownersErrorsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_codeowners_errors",
        "List syntax errors detected in the repository CODEOWNERS file (GET /repos/{owner}/{repo}/codeowners/errors). Requires read access to the repo. Optional `ref` selects branch, tag, or commit; default is the repository default branch.",
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
            ref: z.string().min(1).max(255).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /repos/{owner}/{repo}/codeowners/errors", {
                    owner: input.owner,
                    repo: input.name,
                    ref: input.ref
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = response.data as { errors?: unknown[] };
                const rawErrors = Array.isArray(data.errors) ? data.errors : [];
                const errors: CodeownersErrorItem[] = rawErrors.map((row) =>
                    normalizeCodeownersError(
                        row as {
                            line: number;
                            column: number;
                            source?: string | null;
                            kind: string;
                            suggestion?: string | null;
                            message: string;
                            path: string;
                        }
                    )
                );
                const successPayload: ListCodeownersErrorsSuccess = {
                    success: true,
                    message: "CODEOWNERS errors retrieved successfully.",
                    errors,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListCodeownersErrorsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
