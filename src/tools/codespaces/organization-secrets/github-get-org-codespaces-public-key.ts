import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgCodespacesPublicKeyFailure,
    GetOrgCodespacesPublicKeySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgCodespacesPublicKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_org_codespaces_public_key", "Get organization codespaces public key (GET /orgs/{org}/codespaces/secrets/public-key). See GitHub REST organization secrets.", { org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)") }, async (input) => {
        try {
            const response = await octokit.request("GET /orgs/{org}/codespaces/secrets/public-key", { org: input.org });
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            return textAndData({ success: true, message: "Organization codespaces public key retrieved successfully.", http_status: response.status, org: input.org, public_key: toPlain(response.data), request_id: requestId } satisfies GetOrgCodespacesPublicKeySuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies GetOrgCodespacesPublicKeyFailure);
        }
    });
}