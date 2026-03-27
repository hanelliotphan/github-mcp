import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateRepoFailure, UpdateRepoSuccess } from "../types.js";
import { getRequestId, mapGitHubError } from "../utils/errors.js";
import { textAndData } from "../utils/mcp-response.js";
import { normalizeRepo } from "../utils/repo-normalize.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Only keys present in `input` are sent to GitHub (PATCH semantics). */
function buildPatchBody(input: {
    new_name?: string | undefined;
    description?: string | undefined | null;
    homepage?: string | undefined | null;
    private?: boolean | undefined;
    visibility?: "public" | "private" | undefined;
    has_issues?: boolean | undefined;
    has_projects?: boolean | undefined;
    has_wiki?: boolean | undefined;
    is_template?: boolean | undefined;
    default_branch?: string | undefined;
    allow_squash_merge?: boolean | undefined;
    allow_merge_commit?: boolean | undefined;
    allow_rebase_merge?: boolean | undefined;
    allow_auto_merge?: boolean | undefined;
    delete_branch_on_merge?: boolean | undefined;
    allow_update_branch?: boolean | undefined;
    squash_merge_commit_title?: "PR_TITLE" | "COMMIT_OR_PR_TITLE" | undefined;
    squash_merge_commit_message?: "PR_BODY" | "COMMIT_MESSAGES" | "BLANK" | undefined;
    merge_commit_title?: "PR_TITLE" | "MERGE_MESSAGE" | undefined;
    merge_commit_message?: "PR_BODY" | "PR_TITLE" | "BLANK" | undefined;
    archived?: boolean | undefined;
    allow_forking?: boolean | undefined;
    web_commit_signoff_required?: boolean | undefined;
}): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    if (input.new_name !== undefined) {
        body.name = input.new_name;
    }
    if (input.description !== undefined) {
        body.description = input.description;
    }
    if (input.homepage !== undefined) {
        body.homepage = input.homepage;
    }
    if (input.private !== undefined) {
        body.private = input.private;
    }
    if (input.visibility !== undefined) {
        body.visibility = input.visibility;
    }
    if (input.has_issues !== undefined) {
        body.has_issues = input.has_issues;
    }
    if (input.has_projects !== undefined) {
        body.has_projects = input.has_projects;
    }
    if (input.has_wiki !== undefined) {
        body.has_wiki = input.has_wiki;
    }
    if (input.is_template !== undefined) {
        body.is_template = input.is_template;
    }
    if (input.default_branch !== undefined) {
        body.default_branch = input.default_branch;
    }
    if (input.allow_squash_merge !== undefined) {
        body.allow_squash_merge = input.allow_squash_merge;
    }
    if (input.allow_merge_commit !== undefined) {
        body.allow_merge_commit = input.allow_merge_commit;
    }
    if (input.allow_rebase_merge !== undefined) {
        body.allow_rebase_merge = input.allow_rebase_merge;
    }
    if (input.allow_auto_merge !== undefined) {
        body.allow_auto_merge = input.allow_auto_merge;
    }
    if (input.delete_branch_on_merge !== undefined) {
        body.delete_branch_on_merge = input.delete_branch_on_merge;
    }
    if (input.allow_update_branch !== undefined) {
        body.allow_update_branch = input.allow_update_branch;
    }
    if (input.squash_merge_commit_title !== undefined) {
        body.squash_merge_commit_title = input.squash_merge_commit_title;
    }
    if (input.squash_merge_commit_message !== undefined) {
        body.squash_merge_commit_message = input.squash_merge_commit_message;
    }
    if (input.merge_commit_title !== undefined) {
        body.merge_commit_title = input.merge_commit_title;
    }
    if (input.merge_commit_message !== undefined) {
        body.merge_commit_message = input.merge_commit_message;
    }
    if (input.archived !== undefined) {
        body.archived = input.archived;
    }
    if (input.allow_forking !== undefined) {
        body.allow_forking = input.allow_forking;
    }
    if (input.web_commit_signoff_required !== undefined) {
        body.web_commit_signoff_required = input.web_commit_signoff_required;
    }
    return body;
}

export function registerGithubUpdateRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo",
        "Update repository settings via PATCH /repos/{owner}/{repo} ([GitHub REST](https://docs.github.com/en/rest/repos/repos#update-a-repository)). Only include fields you want to change. `owner` and `name` identify the repo; use `new_name` to rename. Topics and security_and_analysis require other endpoints and are not included here.",
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
            dry_run: z.boolean().optional().default(false),
            new_name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "new_name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                )
                .optional(),
            description: z.string().max(65000).nullable().optional(),
            homepage: z.string().max(2000).nullable().optional(),
            private: z.boolean().optional(),
            visibility: z.enum(["public", "private"]).optional(),
            has_issues: z.boolean().optional(),
            has_projects: z.boolean().optional(),
            has_wiki: z.boolean().optional(),
            is_template: z.boolean().optional(),
            default_branch: z.string().min(1).max(255).optional(),
            allow_squash_merge: z.boolean().optional(),
            allow_merge_commit: z.boolean().optional(),
            allow_rebase_merge: z.boolean().optional(),
            allow_auto_merge: z.boolean().optional(),
            delete_branch_on_merge: z.boolean().optional(),
            allow_update_branch: z.boolean().optional(),
            squash_merge_commit_title: z.enum(["PR_TITLE", "COMMIT_OR_PR_TITLE"]).optional(),
            squash_merge_commit_message: z.enum(["PR_BODY", "COMMIT_MESSAGES", "BLANK"]).optional(),
            merge_commit_title: z.enum(["PR_TITLE", "MERGE_MESSAGE"]).optional(),
            merge_commit_message: z.enum(["PR_BODY", "PR_TITLE", "BLANK"]).optional(),
            archived: z.boolean().optional(),
            allow_forking: z.boolean().optional(),
            web_commit_signoff_required: z.boolean().optional()
        },
        async (input) => {
            const {
                owner,
                name,
                dry_run,
                new_name,
                description,
                homepage,
                private: isPrivate,
                visibility,
                has_issues,
                has_projects,
                has_wiki,
                is_template,
                default_branch,
                allow_squash_merge,
                allow_merge_commit,
                allow_rebase_merge,
                allow_auto_merge,
                delete_branch_on_merge,
                allow_update_branch,
                squash_merge_commit_title,
                squash_merge_commit_message,
                merge_commit_title,
                merge_commit_message,
                archived,
                allow_forking,
                web_commit_signoff_required
            } = input;

            const patch = buildPatchBody({
                new_name,
                description,
                homepage,
                private: isPrivate,
                visibility,
                has_issues,
                has_projects,
                has_wiki,
                is_template,
                default_branch,
                allow_squash_merge,
                allow_merge_commit,
                allow_rebase_merge,
                allow_auto_merge,
                delete_branch_on_merge,
                allow_update_branch,
                squash_merge_commit_title,
                squash_merge_commit_message,
                merge_commit_title,
                merge_commit_message,
                archived,
                allow_forking,
                web_commit_signoff_required
            });

            if (Object.keys(patch).length === 0 && !dry_run) {
                const failure: UpdateRepoFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: "No update fields provided.",
                        hint: "Pass at least one optional field to change (e.g. description), or set dry_run to true with fields to preview the PATCH body.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failure);
            }

            const planned_request = { owner, repo: name, ...patch };

            if (dry_run) {
                const dry: UpdateRepoSuccess = {
                    success: true,
                    message: "Dry run successful. Repository was not updated.",
                    repo: null,
                    request_id: null,
                    dry_run: true,
                    planned_request
                };
                return textAndData(dry);
            }

            try {
                const response = await octokit.rest.repos.update({
                    owner,
                    repo: name,
                    ...(patch as Record<string, unknown>)
                } as Parameters<Octokit["rest"]["repos"]["update"]>[0]);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: UpdateRepoSuccess = {
                    success: true,
                    message: "Repository updated successfully.",
                    repo: normalizeRepo(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoFailure = {
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
