import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoFailure, CreateRepoSuccess } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCreateRepoFromTemplateTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_from_template",
        "Create a new repository from a template repository (POST /repos/{template_owner}/{template_repo}/generate). " +
            "The template must exist and `is_template` must be true (verify with GET /repos/{owner}/{repo}). " +
            "Classic PATs need `public_repo` or `repo` for a public template; `repo` for a private template. " +
            "See [Create a repository using a template](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#create-a-repository-using-a-template).",
        {
            template_owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "template_owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            template_name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "template_name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                )
                .optional()
                .describe(
                    "Account or organization that will own the new repository. Omit to create under the authenticated user."
                ),
            description: z.string().max(350).optional(),
            include_all_branches: z.boolean().optional().default(false),
            private: z.boolean().optional().default(false),
            dry_run: z.boolean().optional().default(false)
        },
        async (input) => {
            const body: {
                name: string;
                owner?: string;
                description?: string;
                include_all_branches: boolean;
                private: boolean;
            } = {
                name: input.name,
                include_all_branches: input.include_all_branches ?? false,
                private: input.private ?? false
            };
            if (input.owner !== undefined) {
                body.owner = input.owner;
            }
            if (input.description !== undefined) {
                body.description = input.description;
            }

            const planned_request = {
                template_owner: input.template_owner,
                template_repo: input.template_name,
                ...body
            };

            if (input.dry_run) {
                const dryRunResponse: CreateRepoSuccess = {
                    success: true,
                    message: "Dry run successful. Repository was not created.",
                    repo: null,
                    request_id: null,
                    dry_run: true,
                    planned_request
                };
                return textAndData(dryRunResponse);
            }

            try {
                const response = await octokit.rest.repos.createUsingTemplate({
                    template_owner: input.template_owner,
                    template_repo: input.template_name,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: CreateRepoSuccess = {
                    success: true,
                    message: "Repository created from template successfully.",
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
