import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { GetRepoDependabotSecretSuccess, GetRepoDependabotSecretFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubGetRepoDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_repo_dependabot_secret", "Get repository Dependabot secret metadata (GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}). See [Get a repository secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#get-a-repository-secret).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number")
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.getRepoSecret({ owner: input.owner, repo: input.name, secret_name: input.secret_name });
            return textAndData({ success: true, message: "Repository Dependabot secret retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, secret_name: input.secret_name, secret: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies GetRepoDependabotSecretSuccess);
        } catch (error: unknown) {
                const failurePayload: GetRepoDependabotSecretFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
