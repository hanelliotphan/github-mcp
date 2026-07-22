import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateCheckRunFailure, UpdateCheckRunSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubUpdateCheckRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_check_run",
        "Update a check run (PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}). Requires a GitHub App. " +
            "Optional `check_name` maps to API `name`. " +
            "See [Update a check run](https://docs.github.com/en/rest/checks/runs?apiVersion=2026-03-10#update-a-check-run).",
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
            check_run_id: z.number().int().positive(),
            check_name: z.string().min(1).max(255).optional(),
            details_url: z.string().url().optional(),
            external_id: z.string().optional(),
            started_at: z.string().min(1).optional(),
            status: z
                .enum(["queued", "in_progress", "completed", "waiting", "requested", "pending"])
                .optional(),
            conclusion: z.enum([
                "action_required",
                "cancelled",
                "failure",
                "neutral",
                "success",
                "skipped",
                "stale",
                "timed_out"
            ]).optional(),
            completed_at: z.string().min(1).optional(),
            output: z
                .object({
                    title: z.string().optional(),
                    summary: z.string().max(65535),
                    text: z.string().max(65535).optional(),
                    annotations: z.array(z.object({
                path: z.string().min(1),
                start_line: z.number().int().min(1),
                end_line: z.number().int().min(1),
                start_column: z.number().int().min(1).optional(),
                end_column: z.number().int().min(1).optional(),
                annotation_level: z.enum(["notice", "warning", "failure"]),
                message: z.string().min(1),
                title: z.string().max(255).optional(),
                raw_details: z.string().optional()
            })).max(50).optional(),
                    images: z.array(z.object({
                alt: z.string().min(1),
                image_url: z.string().url(),
                caption: z.string().optional()
            })).optional()
                })
                .optional(),
            actions: z.array(z.object({
                label: z.string().min(1).max(20),
                description: z.string().min(1).max(40),
                identifier: z.string().min(1).max(20)
            })).max(3).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}",
                    {
                        owner: input.owner,
                        repo: input.name,
                        check_run_id: input.check_run_id,
                        ...(input.check_name !== undefined ? { name: input.check_name } : {}),
                        ...(input.details_url !== undefined ? { details_url: input.details_url } : {}),
                        ...(input.external_id !== undefined ? { external_id: input.external_id } : {}),
                        ...(input.started_at !== undefined ? { started_at: input.started_at } : {}),
                        ...(input.status !== undefined ? { status: input.status } : {}),
                        ...(input.conclusion !== undefined ? { conclusion: input.conclusion } : {}),
                        ...(input.completed_at !== undefined ? { completed_at: input.completed_at } : {}),
                        ...(input.output !== undefined ? { output: input.output } : {}),
                        ...(input.actions !== undefined ? { actions: input.actions } : {})
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateCheckRunSuccess = {
                    success: true,
                    message: "Check run updated successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    check_run_id: input.check_run_id,
                    check_run: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateCheckRunFailure = {
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
