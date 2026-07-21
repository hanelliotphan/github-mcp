import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GenerateRunnerJitconfigForRepoFailure,
    GenerateRunnerJitconfigForRepoSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoRegex = /^[A-Za-z0-9._-]{1,100}$/;

export function registerGithubGenerateRunnerJitconfigForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_generate_runner_jitconfig_for_repo",
        "Generate a just-in-time runner configuration for a repository that can be passed to the runner application at startup (POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig). " +
            "Provide **`name`**, **`runner_group_id`**, **`labels`** (1–100), and optional **`work_folder`** (default `_work`). " +
            "The authenticated user must have **admin** access to the repository; classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **201** with `runner` and `encoded_jit_config`. " +
            "See [Create configuration for a just-in-time runner for a repository](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#create-configuration-for-a-just-in-time-runner-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerRegex, "owner must be a valid GitHub login"),
            name: z.string().min(1).max(100).regex(repoRegex, "name must be a valid repository name"),
            runner_name: z.string().min(1).describe("The name of the new runner."),
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
                const response = await octokit.rest.actions.generateRunnerJitconfigForRepo({
                    owner: input.owner,
                    repo: input.name,
                    name: input.runner_name,
                    runner_group_id: input.runner_group_id,
                    labels: input.labels,
                    ...(input.work_folder !== undefined ? { work_folder: input.work_folder } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GenerateRunnerJitconfigForRepoSuccess = {
                    success: true,
                    message: "Just-in-time runner configuration generated successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name: `${input.owner}/${input.name}`,
                    jitconfig: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GenerateRunnerJitconfigForRepoFailure = {
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
