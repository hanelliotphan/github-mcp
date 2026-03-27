import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoFailure, CreateRepoSuccess } from "../types.js";
import { getRequestId, mapGitHubError } from "../utils/errors.js";
import { textAndData } from "../utils/mcp-response.js";

// Same rules as personal-repo tool (GitHub repo name constraints).
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

// Organization login: alphanumeric, single internal hyphens, 1–39 chars (GitHub-style).
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCreateOrgRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_repo",
        "Create a GitHub repository inside an organization. Requires a token with permission to create repositories in that org.",
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
            private: z.boolean().optional().default(false),
            auto_init: z.boolean().optional().default(true),
            gitignore_template: z.string().optional(),
            license_template: z.string().optional(),
            dry_run: z.boolean().optional().default(false)
        },
        async (input) => {
            const requestPayload = {
                org: input.org,
                name: input.name,
                description: input.description,
                private: input.private ?? false,
                auto_init: input.auto_init ?? true,
                gitignore_template: input.gitignore_template,
                license_template: input.license_template
            };

            if (input.dry_run) {
                const dryRunResponse: CreateRepoSuccess = {
                    success: true,
                    message: "Dry run successful. Repository was not created.",
                    repo: null,
                    request_id: null,
                    dry_run: true,
                    planned_request: requestPayload
                };
                return textAndData(dryRunResponse);
            }

            try {
                const { org, ...body } = requestPayload;
                const response = await octokit.rest.repos.createInOrg({
                    org,
                    ...body
                });
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
