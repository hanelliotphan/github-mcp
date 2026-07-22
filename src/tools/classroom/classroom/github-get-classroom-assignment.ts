import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetClassroomAssignmentFailure,
    GetClassroomAssignmentSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetClassroomAssignmentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_classroom_assignment",
        "Get a GitHub Classroom assignment (GET /assignments/{assignment_id}). " +
            "Requires classroom administrator. Closing down — removed after 2026-08-28. " +
            "See [Get an assignment](https://docs.github.com/en/rest/classroom/classroom?apiVersion=2026-03-10#get-an-assignment).",
        {
            assignment_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /assignments/{assignment_id}", {
                    assignment_id: input.assignment_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetClassroomAssignmentSuccess = {
                    success: true,
                    message: "Classroom assignment retrieved successfully.",
                    http_status: response.status,
                    assignment_id: input.assignment_id,
                    assignment: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetClassroomAssignmentFailure = {
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
