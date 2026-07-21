import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateHostedRunnerForOrgFailure,
    CreateHostedRunnerForOrgSuccess,
    HostedRunnerItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCreateHostedRunnerForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_hosted_runner_for_org",
        "Create a GitHub-hosted runner for an organization (POST /orgs/{org}/actions/hosted-runners). " +
            "Requires **`name`** (1–64 chars; letters, digits, '.', '-', '_'), an **`image`** object (`id`, `source` one of github/partner/custom, optional `version`), **`size`** (machine size), and **`runner_group_id`**. " +
            "Optional: `maximum_runners`, `enable_static_ip`, `image_gen`. " +
            "List available images/sizes with the github-owned/partner images and machine-specs tools. " +
            "Classic OAuth apps and PATs need the **`manage_runners:org`** scope. Success is HTTP **201** Created. " +
            "See [Create a GitHub-hosted runner for an organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#create-a-github-hosted-runner-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(64)
                .describe("Name of the runner (1-64 chars; letters, digits, '.', '-', '_')."),
            image: z
                .object({
                    id: z.string().min(1).optional().describe("The unique identifier of the runner image."),
                    source: z
                        .enum(["github", "partner", "custom"])
                        .optional()
                        .describe("The source of the runner image."),
                    version: z
                        .string()
                        .nullable()
                        .optional()
                        .describe("The image version (only for custom images).")
                })
                .describe("The image of the runner."),
            size: z.string().min(1).describe("The machine size of the runner (e.g. 4-core)."),
            runner_group_id: z
                .number()
                .int()
                .describe("The existing runner group to add this runner to."),
            maximum_runners: z
                .number()
                .int()
                .optional()
                .describe("Maximum number of runners to scale up to."),
            enable_static_ip: z
                .boolean()
                .optional()
                .describe("Whether this runner should be created with a static public IP."),
            image_gen: z
                .boolean()
                .optional()
                .describe("Whether this runner should be used to generate custom images. Default: false.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.createHostedRunnerForOrg({
                    org: input.org,
                    name: input.name,
                    image: input.image,
                    size: input.size,
                    runner_group_id: input.runner_group_id,
                    ...(input.maximum_runners !== undefined ? { maximum_runners: input.maximum_runners } : {}),
                    ...(input.enable_static_ip !== undefined
                        ? { enable_static_ip: input.enable_static_ip }
                        : {}),
                    ...(input.image_gen !== undefined ? { image_gen: input.image_gen } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateHostedRunnerForOrgSuccess = {
                    success: true,
                    message: "Hosted runner created successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner: JSON.parse(JSON.stringify(response.data)) as HostedRunnerItem,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateHostedRunnerForOrgFailure = {
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
