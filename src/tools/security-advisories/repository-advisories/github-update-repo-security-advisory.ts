import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateRepoSecurityAdvisoryFailure,
    UpdateRepoSecurityAdvisorySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const packageEcosystemEnum = z.enum([
    "rubygems",
    "npm",
    "pip",
    "maven",
    "nuget",
    "composer",
    "go",
    "rust",
    "erlang",
    "actions",
    "pub",
    "other",
    "swift"
]);

const advisoryPackageSchema = z.object({
    ecosystem: packageEcosystemEnum,
    name: z.string().nullable().optional()
});

const advisoryVulnerabilitySchema = z.object({
    package: advisoryPackageSchema,
    vulnerable_version_range: z.string().nullable().optional(),
    patched_versions: z.string().nullable().optional(),
    vulnerable_functions: z.array(z.string()).nullable().optional()
});

const advisoryCreditSchema = z.object({
    login: z.string().min(1),
    type: z.enum([
        "analyst",
        "finder",
        "reporter",
        "coordinator",
        "remediation_developer",
        "remediation_reviewer",
        "remediation_verifier",
        "tool",
        "sponsor",
        "other"
    ])
});

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubUpdateRepoSecurityAdvisoryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_security_advisory",
        "Update a repository security advisory (PATCH /repos/{owner}/{repo}/security-advisories/{ghsa_id}). All body fields are optional. See [Update a repository security advisory](https://docs.github.com/en/rest/security-advisories/repository-advisories?apiVersion=2026-03-10#update-a-repository-security-advisory).",
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
            ghsa_id: z.string().min(1).describe("The GHSA (GitHub Security Advisory) identifier of the advisory."),
            summary: z.string().min(1).max(1024).optional(),
            description: z.string().min(1).max(65535).optional(),
            vulnerabilities: z.array(advisoryVulnerabilitySchema).optional(),
            cve_id: z.string().nullable().optional(),
            cwe_ids: z.array(z.string()).nullable().optional(),
            credits: z.array(advisoryCreditSchema).nullable().optional(),
            severity: z.enum(["critical", "high", "medium", "low"]).nullable().optional(),
            cvss_vector_string: z.string().nullable().optional(),
            state: z.enum(["published", "closed", "draft"]).optional(),
            collaborating_users: z.array(z.string()).nullable().optional(),
            collaborating_teams: z.array(z.string()).nullable().optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.securityAdvisories.updateRepositoryAdvisory({
                    owner: input.owner,
                    repo: input.name,
                    ghsa_id: input.ghsa_id,
                    ...(input.summary !== undefined ? { summary: input.summary } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.vulnerabilities !== undefined ? { vulnerabilities: input.vulnerabilities } : {}),
                    ...(input.cve_id !== undefined ? { cve_id: input.cve_id } : {}),
                    ...(input.cwe_ids !== undefined ? { cwe_ids: input.cwe_ids } : {}),
                    ...(input.credits !== undefined ? { credits: input.credits } : {}),
                    ...(input.severity !== undefined ? { severity: input.severity } : {}),
                    ...(input.cvss_vector_string !== undefined
                        ? { cvss_vector_string: input.cvss_vector_string }
                        : {}),
                    ...(input.state !== undefined ? { state: input.state } : {}),
                    ...(input.collaborating_users !== undefined
                        ? { collaborating_users: input.collaborating_users }
                        : {}),
                    ...(input.collaborating_teams !== undefined
                        ? { collaborating_teams: input.collaborating_teams }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateRepoSecurityAdvisorySuccess = {
                    success: true,
                    message: "Repository security advisory updated successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    ghsa_id: input.ghsa_id,
                    advisory: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoSecurityAdvisoryFailure = {
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
