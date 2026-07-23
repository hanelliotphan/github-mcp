import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { UpdateRepoDependabotAlertSuccess, UpdateRepoDependabotAlertFailure } from "../../../types.js";
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

export function registerGithubUpdateRepoDependabotAlertTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_update_repo_dependabot_alert", "Update a Dependabot alert (PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}). Set state to dismissed with dismissed_reason/comment, or reopen with state open. Optional assignees and agent_assignment. See [Update a Dependabot alert](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10#update-a-dependabot-alert).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        alert_number: z.number().int().positive(),
        state: z.enum(["open", "dismissed"]).optional(),
        dismissed_reason: z.enum(["fix_started", "inaccurate", "no_bandwidth", "not_used", "tolerable_risk"]).optional(),
        dismissed_comment: z.string().max(280).optional(),
        assignees: z.array(z.string()).optional(),
        agent_assignment: z.object({ custom_instructions: z.string().optional(), custom_agent: z.string().optional(), model: z.string().optional() }).optional()
    }, async (input) => {
        try {
            const body = {
                ...(input.state !== undefined ? { state: input.state } : {}),
                ...(input.dismissed_reason !== undefined ? { dismissed_reason: input.dismissed_reason } : {}),
                ...(input.dismissed_comment !== undefined ? { dismissed_comment: input.dismissed_comment } : {}),
                ...(input.assignees !== undefined ? { assignees: input.assignees } : {}),
                ...(input.agent_assignment !== undefined ? { agent_assignment: input.agent_assignment } : {})
            };
            const response = await octokit.rest.dependabot.updateAlert({
                owner: input.owner,
                repo: input.name,
                alert_number: input.alert_number,
                ...body
            } as never);
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            return textAndData({ success: true, message: "Dependabot alert updated successfully.", http_status: response.status, owner: input.owner, name: input.name, alert_number: input.alert_number, alert: toPlain(response.data), request_id: requestId } satisfies UpdateRepoDependabotAlertSuccess);
        } catch (error: unknown) {
                const failurePayload: UpdateRepoDependabotAlertFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
