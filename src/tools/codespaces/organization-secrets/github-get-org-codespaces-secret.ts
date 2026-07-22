import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgCodespacesSecretFailure,
    GetOrgCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_org_codespaces_secret", "Get organization codespaces secret metadata (GET /orgs/{org}/codespaces/secrets/{secret_name}). See GitHub REST organization secrets.", { org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"), secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number") }, async (input) => {
        try {
            const response = await octokit.request("GET /orgs/{org}/codespaces/secrets/{secret_name}", { org: input.org, secret_name: input.secret_name });
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            return textAndData({ success: true, message: "Organization codespaces secret metadata retrieved successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, secret: toPlain(response.data), request_id: requestId } satisfies GetOrgCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies GetOrgCodespacesSecretFailure);
        }
    });
}