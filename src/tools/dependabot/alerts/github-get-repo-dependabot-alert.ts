import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { GetRepoDependabotAlertSuccess, GetRepoDependabotAlertFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubGetRepoDependabotAlertTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_repo_dependabot_alert", "Get a Dependabot alert (GET /repos/{owner}/{repo}/dependabot/alerts/{alert_number}). Classic tokens need security_events. See [Get a Dependabot alert](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10#get-a-dependabot-alert).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        alert_number: z.number().int().positive()
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.getAlert({ owner: input.owner, repo: input.name, alert_number: input.alert_number });
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            return textAndData({ success: true, message: "Dependabot alert retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, alert_number: input.alert_number, alert: toPlain(response.data), request_id: requestId } satisfies GetRepoDependabotAlertSuccess);
        } catch (error: unknown) {
                const failurePayload: GetRepoDependabotAlertFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
