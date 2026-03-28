import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RepoInfo, TransferRepoFailure, TransferRepoSuccess } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";
import { normalizeRepo } from "../../utils/repo-normalize.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Map transfer (202) response body to `RepoInfo` when some fields are optional on minimal-repository. */
function normalizeTransferResponse(data: {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    visibility?: string | null;
    html_url: string;
    clone_url?: string | null;
    ssh_url?: string | null;
    default_branch?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    pushed_at?: string | null;
    homepage?: string | null;
    fork: boolean;
    archived?: boolean;
    disabled?: boolean;
    language?: string | null;
    forks_count?: number;
    stargazers_count?: number;
    open_issues_count?: number;
    topics?: string[] | null;
    owner: { login: string; type?: string | null } | null;
    license?: { spdx_id?: string | null; name?: string | null } | null;
    permissions?: { admin?: boolean; push?: boolean; pull?: boolean } | null;
}): RepoInfo {
    return normalizeRepo({
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        private: data.private,
        visibility: data.visibility ?? null,
        html_url: data.html_url,
        clone_url: data.clone_url ?? "",
        ssh_url: data.ssh_url ?? null,
        default_branch: data.default_branch ?? null,
        created_at: data.created_at ?? "",
        updated_at: data.updated_at ?? "",
        pushed_at: data.pushed_at ?? null,
        homepage: data.homepage ?? null,
        fork: data.fork,
        archived: data.archived ?? false,
        disabled: data.disabled ?? false,
        language: data.language ?? null,
        forks_count: data.forks_count ?? 0,
        stargazers_count: data.stargazers_count ?? 0,
        open_issues_count: data.open_issues_count ?? 0,
        topics: data.topics ?? [],
        owner: data.owner,
        license: data.license ?? null,
        permissions: data.permissions ?? null
    });
}

export function registerGithubTransferRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_transfer_repo",
        "Transfer a repository to another user or organization (POST /repos/{owner}/{repo}/transfer). Returns HTTP 202; personal-repo transfers may require acceptance by the new owner and complete asynchronously. Requires admin access; classic PATs need `repo` scope. See [Transfer a repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#transfer-a-repository).",
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
            new_owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "new_owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            new_name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "new_name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                )
                .optional(),
            team_ids: z.array(z.number().int().positive()).max(50).optional(),
            dry_run: z.boolean().optional().default(false),
            confirm: z.boolean().optional().default(false)
        },
        async (input) => {
            const { owner, name, new_owner, new_name, team_ids, dry_run, confirm } = input;

            const body: { new_owner: string; new_name?: string; team_ids?: number[] } = {
                new_owner
            };
            if (new_name !== undefined) {
                body.new_name = new_name;
            }
            if (team_ids !== undefined && team_ids.length > 0) {
                body.team_ids = team_ids;
            }

            const planned_request = {
                owner,
                repo: name,
                body
            };

            if (dry_run) {
                const dry: TransferRepoSuccess = {
                    success: true,
                    message:
                        "Dry run successful. Repository was not transferred. Live calls return HTTP 202 and may complete asynchronously.",
                    new_owner,
                    repo: null,
                    http_status: null,
                    request_id: null,
                    dry_run: true,
                    planned_request
                };
                return textAndData(dry);
            }

            if (!confirm) {
                const guardFailure: TransferRepoFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message:
                            "Refusing to transfer: set confirm to true after verifying owner, name, and new_owner, or use dry_run: true to preview.",
                        hint: "Transfers are difficult to undo. Example: same arguments with confirm: true to execute.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(guardFailure);
            }

            try {
                const response = await octokit.rest.repos.transfer({
                    owner,
                    repo: name,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: TransferRepoSuccess = {
                    success: true,
                    message:
                        "Transfer request accepted (HTTP 202). The repository may still be moving; check approval rules and `repo.full_name` / `repo.owner` in the response.",
                    new_owner,
                    repo: normalizeTransferResponse(response.data),
                    http_status: response.status,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: TransferRepoFailure = {
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
