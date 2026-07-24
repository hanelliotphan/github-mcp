import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GenerateRepoReleaseNotesSuccess,
    GenerateRepoReleaseNotesFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubGenerateRepoReleaseNotesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_generate_repo_release_notes",
        "Generate release notes content without creating a release (POST /repos/{owner}/{repo}/releases/generate-notes). " +
            "Requires **`tag_name`**. Optional **`target_commitish`**, **`previous_tag_name`**, **`configuration_file_path`**. " +
            "See [Generate release notes content for a release](https://docs.github.com/en/rest/releases/releases?apiVersion=2026-03-10#generate-release-notes-content-for-a-release).",
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
            tag_name: z.string().min(1),
            target_commitish: z.string().min(1).optional(),
            previous_tag_name: z.string().min(1).optional(),
            configuration_file_path: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.generateReleaseNotes({
                    owner: input.owner,
                    repo: input.name,
                    tag_name: input.tag_name,
                    ...(input.target_commitish !== undefined
                        ? { target_commitish: input.target_commitish }
                        : {}),
                    ...(input.previous_tag_name !== undefined
                        ? { previous_tag_name: input.previous_tag_name }
                        : {}),
                    ...(input.configuration_file_path !== undefined
                        ? { configuration_file_path: input.configuration_file_path }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GenerateRepoReleaseNotesSuccess = {
                    success: true,
                    message: "Release notes generated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    notes: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GenerateRepoReleaseNotesFailure = {
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
