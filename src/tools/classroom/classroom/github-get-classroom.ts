import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetClassroomFailure, GetClassroomSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetClassroomTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_classroom",
        "Get a GitHub Classroom (GET /classrooms/{classroom_id}). " +
            "Requires classroom administrator. Closing down — removed after 2026-08-28. " +
            "See [Get a classroom](https://docs.github.com/en/rest/classroom/classroom?apiVersion=2026-03-10#get-a-classroom).",
        {
            classroom_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /classrooms/{classroom_id}", {
                    classroom_id: input.classroom_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetClassroomSuccess = {
                    success: true,
                    message: "Classroom retrieved successfully.",
                    http_status: response.status,
                    classroom_id: input.classroom_id,
                    classroom: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetClassroomFailure = {
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
