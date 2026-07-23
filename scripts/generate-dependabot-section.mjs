#!/usr/bin/env node
/**
 * Generate Dependabot MCP tools for one section at a time.
 * Usage: node scripts/generate-dependabot-section.mjs <section> (1-4)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const section = Number(process.argv[2]);
if (!section || section < 1 || section > 4) {
    console.error("Usage: node scripts/generate-dependabot-section.mjs <1-4>");
    process.exit(1);
}

function pascalFromTool(name) {
    return name
        .replace(/^github_/, "")
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
}

function registerFn(name) {
    return `registerGithub${pascalFromTool(name)}Tool`;
}

function kebabFromTool(name) {
    return name.replace(/_/g, "-");
}

function writeFile(rel, content) {
    const full = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
    return rel;
}

function jsonSchema(props, required = []) {
    return JSON.stringify(
        {
            name: "",
            description: "",
            arguments: {
                type: "object",
                properties: props,
                required,
                $schema: "http://json-schema.org/draft-07/schema#"
            }
        },
        null,
        4
    );
}

const COMMON_IMPORTS = `import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    {{SUCCESS_TYPE}},
    {{FAILURE_TYPE}}
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
`;

const LIST_IMPORTS = COMMON_IMPORTS.replace(
    "import { textAndData }",
    `import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData }`
).replace(
    'from "../../../utils/mcp-response.js";',
    `from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";`
);

const CURSOR_LIST_IMPORTS = LIST_IMPORTS.replace(
    "fetchAllPageLinkPages",
    "fetchAllCursorLinkPages"
).replace("parseGitHubPageLinkPagination", "parseGitHubLinkPagination");

const REGEX_BLOCK = `
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;
`;

function toolHeader(toolName, description, depth = "../../../") {
    const success = `${pascalFromTool(toolName)}Success`;
    const failure = `${pascalFromTool(toolName)}Failure`;
    return { success, failure, register: registerFn(toolName) };
}

function failureBlock(failureType) {
    return `            } catch (error: unknown) {
                const failurePayload: ${failureType} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }`;
}

const SECTIONS = {
    1: {
        dir: "alert-dismissal-requests",
        readme: `# Dependabot alert dismissal requests MCP tools

Tool implementations wrap [REST API endpoints for Dependabot alert dismissal requests](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10). They are registered from \`src/index.ts\`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (\`CreateRepoFailure\`).

## Tools

| Tool | Endpoint | Notes |
| --- | --- | --- |
| \`github_list_org_dependabot_dismissal_requests\` | \`GET /orgs/{org}/dismissal-requests/dependabot\` | Org-wide; optional filters |
| \`github_list_repo_dependabot_dismissal_requests\` | \`GET /repos/{owner}/{repo}/dismissal-requests/dependabot\` | Delegated dismissal required |
| \`github_get_repo_dependabot_dismissal_request\` | \`GET .../dismissal-requests/dependabot/{alert_number}\` | |
| \`github_create_repo_dependabot_dismissal_request\` | \`POST .../dismissal-requests/dependabot/{alert_number}\` | **201**; \`dismissed_reason\` required |
| \`github_review_repo_dependabot_dismissal_request\` | \`PATCH .../dismissal-requests/dependabot/{alert_number}\` | **200**; \`approve\`/\`deny\` |
| \`github_cancel_repo_dependabot_dismissal_request\` | \`DELETE .../dismissal-requests/dependabot/{alert_number}\` | **204** |

### Access

Classic tokens need the \`security_events\` scope. Review requires dismissal reviewer authorization.
`,
        tools: [
            "github_list_org_dependabot_dismissal_requests",
            "github_list_repo_dependabot_dismissal_requests",
            "github_get_repo_dependabot_dismissal_request",
            "github_create_repo_dependabot_dismissal_request",
            "github_review_repo_dependabot_dismissal_request",
            "github_cancel_repo_dependabot_dismissal_request"
        ]
    },
    2: { dir: "alerts", tools: [] },
    3: { dir: "repository-access", tools: [] },
    4: { dir: "secrets", tools: [] }
};

// Section 1 tool implementations
function genListOrgDependabotDismissal() {
    const tool = "github_list_org_dependabot_dismissal_requests";
    const { success, failure, register } = toolHeader(tool);
    return `${LIST_IMPORTS.replace("{{SUCCESS_TYPE}}", success).replace("{{FAILURE_TYPE}}", failure)}
${REGEX_BLOCK}

export function ${register}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool}",
        "List dismissal requests for Dependabot alerts for an organization (GET /orgs/{org}/dismissal-requests/dependabot). " +
            "Optional filters: reviewer, requester, time_period, request_status, repository_name. " +
            "Classic tokens need \`security_events\`. " +
            "See [List dismissal requests for Dependabot alerts for an organization](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10#list-dismissal-requests-for-dependabot-alerts-for-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            repository_name: z.string().min(1).optional(),
            reviewer: z.string().min(1).optional(),
            requester: z.string().min(1).optional(),
            time_period: z.enum(["hour", "day", "week", "month"]).optional(),
            request_status: z.enum(["completed", "cancelled", "approved", "expired", "denied", "open", "all"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.repository_name !== undefined ? { repository_name: input.repository_name } : {}),
                ...(input.reviewer !== undefined ? { reviewer: input.reviewer } : {}),
                ...(input.requester !== undefined ? { requester: input.requester } : {}),
                ...(input.time_period !== undefined ? { time_period: input.time_period } : {}),
                ...(input.request_status !== undefined ? { request_status: input.request_status } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /orgs/{org}/dismissal-requests/dependabot",
                                { org: input.org, ...filters, per_page: pp, page } as never
                            );
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const dismissal_requests = result.rows.map((row) => toPlain(row));
                    const successPayload: ${success} = {
                        success: true,
                        message: result.truncated
                            ? \`Dismissal requests partially listed (\${result.pagesFetched} pages, \${dismissal_requests.length} requests); more pages exist.\`
                            : result.pagesFetched > 1
                              ? \`Dismissal requests retrieved successfully (\${result.pagesFetched} pages, \${dismissal_requests.length} requests).\`
                              : "Dismissal requests retrieved successfully.",
                        org: input.org,
                        dismissal_requests,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        page: result.lastPage,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const page = input.page ?? 1;
                const response = await octokit.request("GET /orgs/{org}/dismissal-requests/dependabot", {
                    org: input.org,
                    ...filters,
                    per_page: perPage,
                    page
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ${success} = {
                    success: true,
                    message: "Dismissal requests retrieved successfully.",
                    org: input.org,
                    dismissal_requests: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubPageLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
${failureBlock(failure)}
        }
    );
}
`;
}

function genListRepoDependabotDismissal() {
    const tool = "github_list_repo_dependabot_dismissal_requests";
    const { success, failure, register } = toolHeader(tool);
    return `${LIST_IMPORTS.replace("{{SUCCESS_TYPE}}", success).replace("{{FAILURE_TYPE}}", failure)}
${REGEX_BLOCK}

export function ${register}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool}",
        "List dismissal requests for Dependabot alerts for a repository (GET /repos/{owner}/{repo}/dismissal-requests/dependabot). " +
            "Delegated alert dismissal must be enabled. Classic tokens need \`security_events\`. " +
            "See [List dismissal requests for Dependabot alerts for a repository](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10#list-dismissal-requests-for-dependabot-alerts-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            reviewer: z.string().min(1).optional(),
            requester: z.string().min(1).optional(),
            time_period: z.enum(["hour", "day", "week", "month"]).optional(),
            request_status: z.enum(["open", "approved", "expired", "denied", "all"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.reviewer !== undefined ? { reviewer: input.reviewer } : {}),
                ...(input.requester !== undefined ? { requester: input.requester } : {}),
                ...(input.time_period !== undefined ? { time_period: input.time_period } : {}),
                ...(input.request_status !== undefined ? { request_status: input.request_status } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /repos/{owner}/{repo}/dismissal-requests/dependabot",
                                { owner: input.owner, repo: input.name, ...filters, per_page: pp, page } as never
                            );
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const dismissal_requests = result.rows.map((row) => toPlain(row));
                    const successPayload: ${success} = {
                        success: true,
                        message: result.truncated
                            ? \`Dismissal requests partially listed (\${result.pagesFetched} pages, \${dismissal_requests.length} requests); more pages exist.\`
                            : result.pagesFetched > 1
                              ? \`Dismissal requests retrieved successfully (\${result.pagesFetched} pages, \${dismissal_requests.length} requests).\`
                              : "Dismissal requests retrieved successfully.",
                        owner: input.owner,
                        name: input.name,
                        dismissal_requests,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        page: result.lastPage,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const page = input.page ?? 1;
                const response = await octokit.request(
                    "GET /repos/{owner}/{repo}/dismissal-requests/dependabot",
                    { owner: input.owner, repo: input.name, ...filters, per_page: perPage, page } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ${success} = {
                    success: true,
                    message: "Dismissal requests retrieved successfully.",
                    owner: input.owner,
                    name: input.name,
                    dismissal_requests: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubPageLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
${failureBlock(failure)}
        }
    );
}
`;
}

function genGetRepoDependabotDismissal() {
    const tool = "github_get_repo_dependabot_dismissal_request";
    const { success, failure, register } = toolHeader(tool);
    return `${COMMON_IMPORTS.replace("{{SUCCESS_TYPE}}", success).replace("{{FAILURE_TYPE}}", failure)}
${REGEX_BLOCK}

export function ${register}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool}",
        "Get a dismissal request for a Dependabot alert (GET /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}). " +
            "Classic tokens need \`security_events\`. " +
            "See [Get a dismissal request for a Dependabot alert for a repository](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10#get-a-dismissal-request-for-a-dependabot-alert-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            alert_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}",
                    { owner: input.owner, repo: input.name, alert_number: input.alert_number } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${success} = {
                    success: true,
                    message: "Dismissal request retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    dismissal_request: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureBlock(failure)}
        }
    );
}
`;
}

function genCreateRepoDependabotDismissal() {
    const tool = "github_create_repo_dependabot_dismissal_request";
    const { success, failure, register } = toolHeader(tool);
    return `${COMMON_IMPORTS.replace("{{SUCCESS_TYPE}}", success).replace("{{FAILURE_TYPE}}", failure)}
${REGEX_BLOCK}

export function ${register}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool}",
        "Create a dismissal request for a Dependabot alert (POST /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}). " +
            "Requires \`dismissed_reason\`; optional \`dismissed_comment\`. Returns **201**. Classic tokens need \`security_events\`. " +
            "See [Create a dismissal request for a Dependabot alert for a repository](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10#create-a-dismissal-request-for-a-dependabot-alert-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            alert_number: z.number().int().positive(),
            dismissed_reason: z.enum(["fix_started", "no_bandwidth", "tolerable_risk", "inaccurate", "not_used"]),
            dismissed_comment: z.string().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}",
                    {
                        owner: input.owner,
                        repo: input.name,
                        alert_number: input.alert_number,
                        dismissed_reason: input.dismissed_reason,
                        ...(input.dismissed_comment !== undefined ? { dismissed_comment: input.dismissed_comment } : {})
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${success} = {
                    success: true,
                    message: "Dismissal request created successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    dismissal_request: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureBlock(failure)}
        }
    );
}
`;
}

function genReviewRepoDependabotDismissal() {
    const tool = "github_review_repo_dependabot_dismissal_request";
    const { success, failure, register } = toolHeader(tool);
    return `${COMMON_IMPORTS.replace("{{SUCCESS_TYPE}}", success).replace("{{FAILURE_TYPE}}", failure)}
${REGEX_BLOCK}

export function ${register}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool}",
        "Review a dismissal request for a Dependabot alert (PATCH /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}). " +
            "Requires \`status\` (\`approve\`|\`deny\`) and \`message\`. Returns **200**. Classic tokens need \`security_events\`. " +
            "See [Review a dismissal request for a Dependabot alert for a repository](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10#review-a-dismissal-request-for-a-dependabot-alert-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            alert_number: z.number().int().positive(),
            status: z.enum(["approve", "deny"]),
            message: z.string().min(1).max(2048)
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PATCH /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}",
                    {
                        owner: input.owner,
                        repo: input.name,
                        alert_number: input.alert_number,
                        status: input.status,
                        message: input.message
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${success} = {
                    success: true,
                    message: "Dismissal request reviewed successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureBlock(failure)}
        }
    );
}
`;
}

function genCancelRepoDependabotDismissal() {
    const tool = "github_cancel_repo_dependabot_dismissal_request";
    const { success, failure, register } = toolHeader(tool);
    return `${COMMON_IMPORTS.replace("{{SUCCESS_TYPE}}", success).replace("{{FAILURE_TYPE}}", failure)}
${REGEX_BLOCK}

export function ${register}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool}",
        "Cancel a pending dismissal request for a Dependabot alert (DELETE /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}). " +
            "Returns **204**. Classic tokens need \`security_events\`. " +
            "See [Cancel a dismissal request for a Dependabot alert for a repository](https://docs.github.com/en/rest/dependabot/alert-dismissal-requests?apiVersion=2026-03-10#cancel-a-dismissal-request-for-a-dependabot-alert-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            alert_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /repos/{owner}/{repo}/dismissal-requests/dependabot/{alert_number}",
                    { owner: input.owner, repo: input.name, alert_number: input.alert_number } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${success} = {
                    success: true,
                    message: "Dismissal request cancelled successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureBlock(failure)}
        }
    );
}
`;
}

const SECTION1_GENERATORS = {
    github_list_org_dependabot_dismissal_requests: genListOrgDependabotDismissal,
    github_list_repo_dependabot_dismissal_requests: genListRepoDependabotDismissal,
    github_get_repo_dependabot_dismissal_request: genGetRepoDependabotDismissal,
    github_create_repo_dependabot_dismissal_request: genCreateRepoDependabotDismissal,
    github_review_repo_dependabot_dismissal_request: genReviewRepoDependabotDismissal,
    github_cancel_repo_dependabot_dismissal_request: genCancelRepoDependabotDismissal
};

const SECTION1_TYPES = `
/** GET /orgs/{org}/dismissal-requests/dependabot — HTTP 200. MCP tool: \`github_list_org_dependabot_dismissal_requests\`. */
export type ListOrgDependabotDismissalRequestsSuccess = {
    success: true;
    message: string;
    org: string;
    dismissal_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgDependabotDismissalRequestsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/dismissal-requests/dependabot — HTTP 200. MCP tool: \`github_list_repo_dependabot_dismissal_requests\`. */
export type ListRepoDependabotDismissalRequestsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    dismissal_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoDependabotDismissalRequestsFailure = CreateRepoFailure;

/** GET .../dismissal-requests/dependabot/{alert_number} — HTTP 200. MCP tool: \`github_get_repo_dependabot_dismissal_request\`. */
export type GetRepoDependabotDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    dismissal_request: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoDependabotDismissalRequestFailure = CreateRepoFailure;

/** POST .../dismissal-requests/dependabot/{alert_number} — HTTP 201. MCP tool: \`github_create_repo_dependabot_dismissal_request\`. */
export type CreateRepoDependabotDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    dismissal_request: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoDependabotDismissalRequestFailure = CreateRepoFailure;

/** PATCH .../dismissal-requests/dependabot/{alert_number} — HTTP 200. MCP tool: \`github_review_repo_dependabot_dismissal_request\`. */
export type ReviewRepoDependabotDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type ReviewRepoDependabotDismissalRequestFailure = CreateRepoFailure;

/** DELETE .../dismissal-requests/dependabot/{alert_number} — HTTP 204. MCP tool: \`github_cancel_repo_dependabot_dismissal_request\`. */
export type CancelRepoDependabotDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    request_id: string | null;
};
export type CancelRepoDependabotDismissalRequestFailure = CreateRepoFailure;
`;

const SECTION1_MCP_IMPORTS = [
    "ListOrgDependabotDismissalRequestsSuccess",
    "ListOrgDependabotDismissalRequestsFailure",
    "ListRepoDependabotDismissalRequestsSuccess",
    "ListRepoDependabotDismissalRequestsFailure",
    "GetRepoDependabotDismissalRequestSuccess",
    "GetRepoDependabotDismissalRequestFailure",
    "CreateRepoDependabotDismissalRequestSuccess",
    "CreateRepoDependabotDismissalRequestFailure",
    "ReviewRepoDependabotDismissalRequestSuccess",
    "ReviewRepoDependabotDismissalRequestFailure",
    "CancelRepoDependabotDismissalRequestSuccess",
    "CancelRepoDependabotDismissalRequestFailure"
];

function appendTypes(content) {
    const typesPath = path.join(ROOT, "src/types.ts");
    let types = fs.readFileSync(typesPath, "utf8");
    if (types.includes("ListOrgDependabotDismissalRequestsSuccess") && section === 1) {
        console.log("Types already present for section 1, skipping");
        return;
    }
    fs.writeFileSync(typesPath, types.trimEnd() + "\n" + content + "\n");
}

function patchMcpResponse(imports, unionTypes) {
    const mcpPath = path.join(ROOT, "src/utils/mcp-response.ts");
    let mcp = fs.readFileSync(mcpPath, "utf8");
    if (imports.some((i) => mcp.includes(i))) {
        console.log("mcp-response already patched for this section, skipping");
        return;
    }
    mcp = mcp.replace(
        "    RevokeCredentialsSuccess,\n    RevokeCredentialsFailure,",
        "    RevokeCredentialsSuccess,\n    RevokeCredentialsFailure,\n" + imports.map((i) => `    ${i},`).join("\n")
    );
    mcp = mcp.replace(
        "        | RevokeCredentialsSuccess\n        | RevokeCredentialsFailure) {",
        "        | RevokeCredentialsSuccess\n        | RevokeCredentialsFailure\n" +
            unionTypes.map((t) => `        | ${t}`).join("\n") +
            ") {"
    );
    fs.writeFileSync(mcpPath, mcp);
}

function patchIndex(sectionDir, tools) {
    const indexPath = path.join(ROOT, "src/index.ts");
    let index = fs.readFileSync(indexPath, "utf8");
    const marker = 'import { registerGithubRevokeCredentialsTool } from "./tools/credentials/revoke/github-revoke-credentials.js";';
    const importLines = tools
        .map(
            (t) =>
                `import { ${registerFn(t)} } from "./tools/dependabot/${sectionDir}/${kebabFromTool(t)}.js";`
        )
        .join("\n");
    if (!index.includes(registerFn(tools[0]))) {
        index = index.replace(marker, importLines + "\n" + marker);
    }
    const regMarker = "registerGithubRevokeCredentialsTool(server, octokit);";
    const regLines = tools.map((t) => `${registerFn(t)}(server, octokit);`).join("\n");
    if (!index.includes(registerFn(tools[0]) + "(server")) {
        index = index.replace(regMarker, regMarker + "\n" + regLines);
    }
    fs.writeFileSync(indexPath, index);
}

function patchReadme(sectionDir, title) {
    const readmePath = path.join(ROOT, "README.md");
    let readme = fs.readFileSync(readmePath, "utf8");
    if (readme.includes("### Dependabot")) return;
    const marker = "### Credentials\n\n- **[Revocation](src/tools/credentials/revoke/README.md)**";
    const dependabot = `### Dependabot

- **[Alert dismissal requests](src/tools/dependabot/alert-dismissal-requests/README.md)**
- **[Alerts](src/tools/dependabot/alerts/README.md)**
- **[Repository access](src/tools/dependabot/repository-access/README.md)**
- **[Secrets](src/tools/dependabot/secrets/README.md)**

`;
    readme = readme.replace(marker, marker + "\n\n" + dependabot);
    fs.writeFileSync(readmePath, readme);
}

if (section === 1) {
    const dir = "alert-dismissal-requests";
    const tools = SECTIONS[1].tools;
    const generated = [];
    for (const tool of tools) {
        const content = SECTION1_GENERATORS[tool]();
        const rel = `src/tools/dependabot/${dir}/${kebabFromTool(tool)}.ts`;
        writeFile(rel, content);
        generated.push(rel);

        // minimal JSON schema
        const jsonPath = `mcps/user-github-mcp/tools/dependabot/${dir}/${tool}.json`;
        const baseProps = {};
        if (tool.includes("_org_")) baseProps.org = { type: "string", minLength: 1, maxLength: 39 };
        if (tool.includes("_repo_") && !tool.includes("_org_")) {
            baseProps.owner = { type: "string", minLength: 1, maxLength: 39 };
            baseProps.name = { type: "string", minLength: 1, maxLength: 100 };
        }
        if (tool.includes("alert_number")) baseProps.alert_number = { type: "integer", minimum: 1 };
        const req = Object.keys(baseProps);
        const j = jsonSchema(baseProps, req);
        writeFile(jsonPath, j.replace('"name": ""', `"name": "${tool}"`).replace('"description": ""', `"description": "${tool}"`));
        generated.push(jsonPath);
    }
    writeFile(`src/tools/dependabot/${dir}/README.md`, SECTIONS[1].readme);
    appendTypes(SECTION1_TYPES);
    patchMcpResponse(SECTION1_MCP_IMPORTS, SECTION1_MCP_IMPORTS);
    patchIndex(dir, tools);
    patchReadme();
    console.log(`Section 1: generated ${tools.length} tools`);
    generated.forEach((f) => console.log(" ", f));
} else {
    console.error(`Section ${section} generator not implemented in script yet — implement manually`);
    process.exit(1);
}
