import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoCodespacesPublicKeyFailure,
    GetRepoCodespacesPublicKeySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}
export function registerGithubGetRepoCodespacesPublicKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_repo_codespaces_public_key", "Get repository codespaces public key. See GitHub REST repository secrets.", { owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"), name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'") }, async (input) => {
        const full_name = `${input.owner}/${input.name}`;
        try {
            const response = await octokit.request("GET /repos/{owner}/{repo}/codespaces/secrets/public-key", { owner: input.owner, repo: input.name });
            return textAndData({ success: true, message: "Repository codespaces public key retrieved successfully.", http_status: response.status, owner: input.owner, repo: input.name, full_name, public_key: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies GetRepoCodespacesPublicKeySuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies GetRepoCodespacesPublicKeyFailure);
        }
    });
}