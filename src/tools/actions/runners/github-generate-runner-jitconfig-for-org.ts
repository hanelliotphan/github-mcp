import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GenerateRunnerJitconfigForOrgFailure,
    GenerateRunnerJitconfigForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGenerateRunnerJitconfigForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_generate_runner_jitconfig_for_org",
        "Generate a just-in-time runner configuration for an organization that can be passed to the runner application at startup (POST /orgs/{org}/actions/runners/generate-jitconfig). " +
            "Provide **`name`**, **`runner_group_id`**, **`labels`** (1–100), and optional **`work_folder`** (default `_work`). " +
            "The authenticated user must have **admin** access; classic OAuth apps and PATs need the **`admin:org`** scope. Returns HTTP **201** with `runner` and `encoded_jit_config`. " +
            "See [Create configuration for a just-in-time runner for an organization](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#create-configuration-for-a-just-in-time-runner-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).describe("The name of the new runner."),
            runner_group_id: z.number().int().positive().describe("The ID of the runner group to register the runner to."),
            labels: z
                .array(z.string().min(1))
                .min(1)
                .max(100)
                .describe("The names of the custom labels to add to the runner (1–100)."),
            work_folder: z.string().optional().describe("The working directory for job execution (default `_work`).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.generateRunnerJitconfigForOrg({
                    org: input.org,
                    name: input.name,
                    runner_group_id: input.runner_group_id,
                    labels: input.labels,
                    ...(input.work_folder !== undefined ? { work_folder: input.work_folder } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GenerateRunnerJitconfigForOrgSuccess = {
                    success: true,
                    message: "Just-in-time runner configuration generated successfully.",
                    http_status: response.status,
                    org: input.org,
                    jitconfig: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GenerateRunnerJitconfigForOrgFailure = {
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
