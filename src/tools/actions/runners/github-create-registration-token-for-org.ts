import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRegistrationTokenForOrgFailure,
    CreateRegistrationTokenForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCreateRegistrationTokenForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_registration_token_for_org",
        "Create a registration token for adding a self-hosted runner to an organization (POST /orgs/{org}/actions/runners/registration-token). " +
            "The returned **`token`** is used with the runner config script and expires after one hour. " +
            "The authenticated user must have **admin** access; classic OAuth apps and PATs need the **`admin:org`** scope. Returns HTTP **201**. " +
            "See [Create a registration token for an organization](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#create-a-registration-token-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.createRegistrationTokenForOrg({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRegistrationTokenForOrgSuccess = {
                    success: true,
                    message: "Registration token created successfully.",
                    http_status: response.status,
                    org: input.org,
                    token: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRegistrationTokenForOrgFailure = {
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
