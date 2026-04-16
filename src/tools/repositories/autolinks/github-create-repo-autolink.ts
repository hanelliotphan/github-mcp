import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRepoAutolinkFailure,
    CreateRepoAutolinkSuccess,
    RepoAutolinkItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toAutolinkItem(row: {
    id: number;
    key_prefix: string;
    url_template: string;
    is_alphanumeric: boolean;
    updated_at?: string | null;
}): RepoAutolinkItem {
    return {
        id: row.id,
        key_prefix: row.key_prefix,
        url_template: row.url_template,
        is_alphanumeric: row.is_alphanumeric,
        updated_at: row.updated_at ?? null
    };
}

export function registerGithubCreateRepoAutolinkTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_autolink",
        "Create an autolink reference for a repository (POST /repos/{owner}/{repo}/autolinks). " +
            "When **`key_prefix`** appears in issues, PRs, or commits (with GitHub’s delimiter rules), **`url_template`** is used as the link target; it **must** include the literal **`<num>`** placeholder for the matched reference. " +
            "**`is_alphanumeric`** controls whether **`<num>`** matches alphanumeric tokens (default **true** on GitHub) or digits only. " +
            "Requires **admin** access to the repository; GitHub Apps need repository **administration** write. Success is HTTP **201**. " +
            "See [Create an autolink reference for a repository](https://docs.github.com/en/rest/repos/autolinks?apiVersion=2026-03-10#create-an-autolink-reference-for-a-repository).",
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
            key_prefix: z
                .string()
                .min(1)
                .describe("Prefix that triggers the autolink (e.g. TICKET-)."),
            url_template: z
                .string()
                .min(1)
                .refine((s) => s.includes("<num>"), {
                    message: "url_template must contain the literal substring <num> for the reference placeholder (per GitHub)."
                })
                .describe("Target URL template; must include <num> for the matched reference."),
            is_alphanumeric: z
                .boolean()
                .optional()
                .describe(
                    "If true (GitHub default), <num> matches A–Z, 0–9, and -. If false, <num> is digits only."
                )
        },
        async (input) => {
            try {
                const params: Parameters<Octokit["rest"]["repos"]["createAutolink"]>[0] = {
                    owner: input.owner,
                    repo: input.name,
                    key_prefix: input.key_prefix,
                    url_template: input.url_template
                };
                if (input.is_alphanumeric !== undefined) {
                    params.is_alphanumeric = input.is_alphanumeric;
                }
                const response = await octokit.rest.repos.createAutolink(params);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoAutolinkSuccess = {
                    success: true,
                    message: "Repository autolink created successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    autolink: toAutolinkItem(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoAutolinkFailure = {
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
