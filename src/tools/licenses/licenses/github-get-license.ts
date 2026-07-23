import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetLicenseFailure, GetLicenseSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetLicenseTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_license",
        "Get information about a specific license (GET /licenses/{license}). " +
            "Pass an SPDX-style license key (e.g. `mit`, `apache-2.0`) from `github_list_commonly_used_licenses`. " +
            "See [Get a license](https://docs.github.com/en/rest/licenses/licenses?apiVersion=2026-03-10#get-a-license).",
        {
            license: z.string().min(1).describe("License key (e.g. mit, apache-2.0).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.licenses.get({
                    license: input.license
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetLicenseSuccess = {
                    success: true,
                    message: "License retrieved successfully.",
                    http_status: response.status as number,
                    license_key: input.license,
                    license: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetLicenseFailure = {
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
