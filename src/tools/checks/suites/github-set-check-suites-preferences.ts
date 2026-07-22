import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetCheckSuitesPreferencesFailure,
    SetCheckSuitesPreferencesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubSetCheckSuitesPreferencesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_check_suites_preferences",
        "Update repository preferences for check suites (PATCH /repos/{owner}/{repo}/check-suites/preferences). " +
            "Requires repository admin. Pass \`auto_trigger_checks\` entries with app_id and setting. " +
            "See [Update repository preferences for check suites](https://docs.github.com/en/rest/checks/suites?apiVersion=2026-03-10#update-repository-preferences-for-check-suites).",
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
            auto_trigger_checks: z
                .array(
                    z.object({
                        app_id: z.number().int().positive(),
                        setting: z.boolean()
                    })
                )
                .optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.checks.setSuitesPreferences({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.auto_trigger_checks !== undefined
                        ? { auto_trigger_checks: input.auto_trigger_checks }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetCheckSuitesPreferencesSuccess = {
                    success: true,
                    message: "Check suite preferences updated successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    preferences: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetCheckSuitesPreferencesFailure = {
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
