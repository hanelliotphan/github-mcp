import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgAttestationReposFailure,
    ListOrgAttestationReposSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default `per_page` when omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainRepositoryRows(data: unknown): Record<string, unknown>[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return (data as unknown[]).map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListOrgAttestationReposTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_attestation_repos",
        "List **repositories** in an organization that have at least one attested artifact (GET /orgs/{org}/attestations/repositories). " +
            "Each row includes **`id`** and **`name`** per GitHub. Optional **`predicate_type`**, **`per_page`** (1–100, default **100** when omitted), **`before`**, **`after`**. " +
            "Fine-grained tokens may need **attestations:read** where applicable. " +
            "See [List attestation repositories](https://docs.github.com/en/rest/orgs/attestations?apiVersion=2026-03-10#list-attestation-repositories).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            predicate_type: z
                .string()
                .min(1)
                .optional()
                .describe("Optional filter: provenance, sbom, release, or a custom predicate type."),
            per_page: z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .describe("Results per page; defaults to 100 when omitted (MCP default; GitHub REST default is 30)."),
            before: z.string().min(1).optional(),
            after: z.string().min(1).optional()
        },
        async (input) => {
            const params: Record<string, unknown> = { org: input.org };
            if (input.predicate_type !== undefined) {
                params.predicate_type = input.predicate_type;
            }
            params.per_page = input.per_page ?? DEFAULT_PER_PAGE;
            if (input.before !== undefined) {
                params.before = input.before;
            }
            if (input.after !== undefined) {
                params.after = input.after;
            }

            try {
                const response = (await octokit.request(
                    "GET /orgs/{org}/attestations/repositories",
                    params as never
                )) as {
                    status: number;
                    data: unknown;
                    headers: { "x-github-request-id"?: string };
                };
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const repositories = toPlainRepositoryRows(response.data);
                const successPayload: ListOrgAttestationReposSuccess = {
                    success: true,
                    message: "Attestation repositories listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    repositories,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgAttestationReposFailure = {
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
