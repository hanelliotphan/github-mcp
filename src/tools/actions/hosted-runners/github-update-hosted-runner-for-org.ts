import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    HostedRunnerItem,
    UpdateHostedRunnerForOrgFailure,
    UpdateHostedRunnerForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubUpdateHostedRunnerForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_hosted_runner_for_org",
        "Update a GitHub-hosted runner for an organization (PATCH /orgs/{org}/actions/hosted-runners/{hosted_runner_id}). " +
            "Optionally set **`name`**, **`runner_group_id`**, **`maximum_runners`**, **`enable_static_ip`**, **`size`**, **`image_source`** (github/partner/custom), **`image_id`**, **`image_version`**, or **`image_gen`**. " +
            "Classic OAuth apps and PATs need the **`manage_runners:org`** scope. " +
            "See [Update a GitHub-hosted runner for an organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#update-a-github-hosted-runner-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            hosted_runner_id: z
                .number()
                .int()
                .positive()
                .describe("Unique identifier of the GitHub-hosted runner."),
            name: z.string().min(1).max(64).optional().describe("New name of the runner."),
            runner_group_id: z
                .number()
                .int()
                .optional()
                .describe("The existing runner group to add this runner to."),
            maximum_runners: z
                .number()
                .int()
                .optional()
                .describe("Maximum number of runners to scale up to."),
            enable_static_ip: z
                .boolean()
                .optional()
                .describe("Whether this runner should be updated with a static public IP."),
            size: z.string().min(1).optional().describe("The machine size of the runner."),
            image_source: z
                .enum(["github", "partner", "custom"])
                .optional()
                .describe("The source type of the runner image; must match the source of image_id."),
            image_id: z.string().min(1).optional().describe("The unique identifier of the runner image."),
            image_version: z
                .string()
                .nullable()
                .optional()
                .describe("The image version to deploy (only for custom images)."),
            image_gen: z
                .boolean()
                .optional()
                .describe("Whether to enable image generation for this runner pool.")
        },
        async (input) => {
            const body = {
                ...(input.name !== undefined ? { name: input.name } : {}),
                ...(input.runner_group_id !== undefined ? { runner_group_id: input.runner_group_id } : {}),
                ...(input.maximum_runners !== undefined ? { maximum_runners: input.maximum_runners } : {}),
                ...(input.enable_static_ip !== undefined
                    ? { enable_static_ip: input.enable_static_ip }
                    : {}),
                ...(input.size !== undefined ? { size: input.size } : {}),
                ...(input.image_source !== undefined ? { image_source: input.image_source } : {}),
                ...(input.image_id !== undefined ? { image_id: input.image_id } : {}),
                ...(input.image_version !== undefined ? { image_version: input.image_version } : {}),
                ...(input.image_gen !== undefined ? { image_gen: input.image_gen } : {})
            };
            try {
                const response = await octokit.rest.actions.updateHostedRunnerForOrg({
                    org: input.org,
                    hosted_runner_id: input.hosted_runner_id,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateHostedRunnerForOrgSuccess = {
                    success: true,
                    message: "Hosted runner updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    hosted_runner_id: input.hosted_runner_id,
                    runner: JSON.parse(JSON.stringify(response.data)) as HostedRunnerItem,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateHostedRunnerForOrgFailure = {
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
