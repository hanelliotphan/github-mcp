import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { GetOrgDependabotPublicKeySuccess, GetOrgDependabotPublicKeyFailure } from "../../../types.js";
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

export function registerGithubGetOrgDependabotPublicKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_org_dependabot_public_key", "Get organization Dependabot public key (GET /orgs/{org}/dependabot/secrets/public-key). See [Get an organization public key](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#get-an-organization-public-key).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.getOrgPublicKey({ org: input.org });
            return textAndData({ success: true, message: "Organization Dependabot public key retrieved successfully.", http_status: response.status, org: input.org, public_key: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies GetOrgDependabotPublicKeySuccess);
        } catch (error: unknown) {
                const failurePayload: GetOrgDependabotPublicKeyFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
