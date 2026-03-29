import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoFailure, CreateRepoSuccess } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

// Same rules as personal-repo tool (GitHub repo name constraints).
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

// Organization login: alphanumeric, single internal hyphens, 1–39 chars (GitHub-style).
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const squashMergeCommitTitleSchema = z.enum(["PR_TITLE", "COMMIT_OR_PR_TITLE"]);
const squashMergeCommitMessageSchema = z.enum(["PR_BODY", "COMMIT_MESSAGES", "BLANK"]);
const mergeCommitTitleSchema = z.enum(["PR_TITLE", "MERGE_MESSAGE"]);
const mergeCommitMessageSchema = z.enum(["PR_BODY", "PR_TITLE", "BLANK"]);

const customPropertyValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type CreateInOrgParams = NonNullable<Parameters<Octokit["rest"]["repos"]["createInOrg"]>[0]>;

function buildCreateInOrgPayload(
    org: string,
    input: {
        name: string;
        description?: string | undefined;
        homepage?: string | undefined;
        private: boolean;
        visibility?: "public" | "private" | undefined;
        has_issues?: boolean | undefined;
        has_projects?: boolean | undefined;
        has_wiki?: boolean | undefined;
        has_discussions?: boolean | undefined;
        auto_init: boolean;
        gitignore_template?: string | undefined;
        license_template?: string | undefined;
        team_id?: number | undefined;
        allow_squash_merge?: boolean | undefined;
        allow_merge_commit?: boolean | undefined;
        allow_rebase_merge?: boolean | undefined;
        allow_auto_merge?: boolean | undefined;
        delete_branch_on_merge?: boolean | undefined;
        use_squash_pr_title_as_default?: boolean | undefined;
        squash_merge_commit_title?: z.infer<typeof squashMergeCommitTitleSchema> | undefined;
        squash_merge_commit_message?: z.infer<typeof squashMergeCommitMessageSchema> | undefined;
        merge_commit_title?: z.infer<typeof mergeCommitTitleSchema> | undefined;
        merge_commit_message?: z.infer<typeof mergeCommitMessageSchema> | undefined;
        has_downloads?: boolean | undefined;
        is_template: boolean;
        custom_properties?: Record<string, string | number | boolean | null> | undefined;
    }
): CreateInOrgParams {
    const body: Record<string, unknown> = {
        org,
        name: input.name,
        private: input.private,
        auto_init: input.auto_init,
        is_template: input.is_template
    };
    if (input.description !== undefined) {
        body.description = input.description;
    }
    if (input.homepage !== undefined) {
        body.homepage = input.homepage;
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
    if (input.has_discussions !== undefined) {
        body.has_discussions = input.has_discussions;
    }
    if (input.gitignore_template !== undefined) {
        body.gitignore_template = input.gitignore_template;
    }
    if (input.license_template !== undefined) {
        body.license_template = input.license_template;
    }
    if (input.team_id !== undefined) {
        body.team_id = input.team_id;
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
    if (input.use_squash_pr_title_as_default !== undefined) {
        body.use_squash_pr_title_as_default = input.use_squash_pr_title_as_default;
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
    if (input.has_downloads !== undefined) {
        body.has_downloads = input.has_downloads;
    }
    if (input.custom_properties !== undefined) {
        body.custom_properties = input.custom_properties;
    }
    return body as CreateInOrgParams;
}

export function registerGithubCreateOrgRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_repo",
        "Create a GitHub repository in an organization (POST /orgs/{org}/repos). " +
            "Supports the GitHub API body fields including `visibility`, `team_id`, `custom_properties`, merge settings, and `is_template`. " +
            "`use_squash_pr_title_as_default` is deprecated by GitHub in favor of `squash_merge_commit_title`.",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            description: z.string().max(350).optional(),
            homepage: z.string().max(2048).optional(),
            private: z.boolean().optional().default(false),
            visibility: z.enum(["public", "private"]).optional(),
            has_issues: z.boolean().optional(),
            has_projects: z.boolean().optional(),
            has_wiki: z.boolean().optional(),
            has_discussions: z.boolean().optional(),
            auto_init: z.boolean().optional().default(true),
            gitignore_template: z.string().optional(),
            license_template: z.string().optional(),
            team_id: z.number().int().positive().optional(),
            allow_squash_merge: z.boolean().optional(),
            allow_merge_commit: z.boolean().optional(),
            allow_rebase_merge: z.boolean().optional(),
            allow_auto_merge: z.boolean().optional(),
            delete_branch_on_merge: z.boolean().optional(),
            use_squash_pr_title_as_default: z.boolean().optional(),
            squash_merge_commit_title: squashMergeCommitTitleSchema.optional(),
            squash_merge_commit_message: squashMergeCommitMessageSchema.optional(),
            merge_commit_title: mergeCommitTitleSchema.optional(),
            merge_commit_message: mergeCommitMessageSchema.optional(),
            has_downloads: z.boolean().optional(),
            is_template: z.boolean().optional().default(false),
            custom_properties: z.record(z.string(), customPropertyValueSchema).optional(),
            dry_run: z.boolean().optional().default(false)
        },
        async (input) => {
            const requestPayload = buildCreateInOrgPayload(input.org, {
                name: input.name,
                description: input.description,
                homepage: input.homepage,
                private: input.private ?? false,
                visibility: input.visibility,
                has_issues: input.has_issues,
                has_projects: input.has_projects,
                has_wiki: input.has_wiki,
                has_discussions: input.has_discussions,
                auto_init: input.auto_init ?? true,
                gitignore_template: input.gitignore_template,
                license_template: input.license_template,
                team_id: input.team_id,
                allow_squash_merge: input.allow_squash_merge,
                allow_merge_commit: input.allow_merge_commit,
                allow_rebase_merge: input.allow_rebase_merge,
                allow_auto_merge: input.allow_auto_merge,
                delete_branch_on_merge: input.delete_branch_on_merge,
                use_squash_pr_title_as_default: input.use_squash_pr_title_as_default,
                squash_merge_commit_title: input.squash_merge_commit_title,
                squash_merge_commit_message: input.squash_merge_commit_message,
                merge_commit_title: input.merge_commit_title,
                merge_commit_message: input.merge_commit_message,
                has_downloads: input.has_downloads,
                is_template: input.is_template ?? false,
                custom_properties: input.custom_properties
            });

            if (input.dry_run) {
                const dryRunResponse: CreateRepoSuccess = {
                    success: true,
                    message: "Dry run successful. Repository was not created.",
                    repo: null,
                    request_id: null,
                    dry_run: true,
                    planned_request: { ...requestPayload }
                };
                return textAndData(dryRunResponse);
            }

            try {
                const response = await octokit.rest.repos.createInOrg(requestPayload);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: CreateRepoSuccess = {
                    success: true,
                    message: "Repository created successfully.",
                    repo: {
                        name: response.data.name,
                        full_name: response.data.full_name,
                        private: response.data.private,
                        html_url: response.data.html_url,
                        clone_url: response.data.clone_url,
                        default_branch: response.data.default_branch
                    },
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoFailure = {
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
