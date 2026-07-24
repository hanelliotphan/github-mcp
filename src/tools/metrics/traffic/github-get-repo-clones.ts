import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoClonesFailure, GetRepoClonesSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoClonesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_clones",
        "Get repository clone counts for the last 14 days (GET /repos/{owner}/{repo}/traffic/clones). " +
            "Optional **`per`** is `day` (default) or `week`. Requires push access. " +
            "See [Get repository clones](https://docs.github.com/en/rest/metrics/traffic?apiVersion=2026-03-10#get-repository-clones).",
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
            per: z.enum(["day", "week"]).optional().describe("Time frame for breakdown. Default: day.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getClones({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.per !== undefined ? { per: input.per } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoClonesSuccess = {
                    success: true,
                    message: "Repository clones retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    clones: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoClonesFailure = {
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
