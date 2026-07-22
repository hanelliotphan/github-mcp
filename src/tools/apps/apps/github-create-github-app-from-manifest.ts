import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateGithubAppFromManifestFailure,
    CreateGithubAppFromManifestSuccess,
    GitHubAppFromManifestItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): GitHubAppFromManifestItem {
    return JSON.parse(JSON.stringify(data)) as GitHubAppFromManifestItem;
}

export function registerGithubCreateGithubAppFromManifestTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_github_app_from_manifest",
        "Complete the GitHub App Manifest handshake (POST /app-manifests/{code}/conversions). " +
            "Exchange the temporary **`code`** from the manifest flow for the app's **`id`**, **`pem`** (private key), **`client_secret`**, and **`webhook_secret`**. " +
            "See [Create a GitHub App from a manifest](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#create-a-github-app-from-a-manifest).",
        {
            code: z.string().min(1).describe("Temporary code from the GitHub App Manifest flow.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.createFromManifest({ code: input.code });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateGithubAppFromManifestSuccess = {
                    success: true,
                    message: "GitHub App created from manifest successfully.",
                    http_status: response.status,
                    app: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateGithubAppFromManifestFailure = {
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
