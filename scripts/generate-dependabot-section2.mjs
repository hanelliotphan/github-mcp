#!/usr/bin/env node
/** Generate Dependabot section 2 (alerts) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = "alerts";

function pascalFromTool(name) {
    return name.replace(/^github_/, "").split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}
function registerFn(name) { return `registerGithub${pascalFromTool(name)}Tool`; }
function kebabFromTool(name) { return name.replace(/_/g, "-"); }
function writeFile(rel, content) {
    const full = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
}

const REGEX = `
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;
`;

const BASE_LIST_ZOD = `
            classification: z.string().min(1).optional(),
            state: z.string().min(1).optional(),
            severity: z.string().min(1).optional(),
            ecosystem: z.string().min(1).optional(),
            package: z.string().min(1).optional(),
            epss_percentage: z.string().min(1).optional(),
            has: z.string().min(1).optional(),
            assignee: z.string().min(1).optional(),
            scope: z.enum(["development", "runtime"]).optional(),
            sort: z.enum(["created", "updated", "epss_percentage"]).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().min(1).optional(),
            after: z.string().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()`;

const FILTER_KEYS = ["classification", "state", "severity", "ecosystem", "package", "epss_percentage", "has", "assignee", "scope", "sort", "direction"];

function buildFilters(extra = []) {
    const keys = [...FILTER_KEYS, ...extra];
    return `const filters = {
                ${keys.map((k) => `...(input.${k} !== undefined ? { ${k}: input.${k} } : {})`).join(",\n                ")}
            };`;
}

const LIST_IMPORTS = `import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { {{SUCCESS}}, {{FAILURE}} } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";
`;

const COMMON_IMPORTS = `import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { {{SUCCESS}}, {{FAILURE}} } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
`;

function failBlock(failure) {
    return `} catch (error: unknown) {
                const failurePayload: ${failure} = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }`;
}

function genListTool({ tool, success, failure, register, scopeKey, scopeLabel, octokitCall, extraZod = "", extraKeys = [] }) {
    const idField = scopeKey === "enterprise" ? "enterprise" : scopeKey === "org" ? "org" : "owner";
    const idZod = scopeKey === "enterprise"
        ? `enterprise: z.string().min(1).max(50).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug")`
        : scopeKey === "org"
          ? `org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")`
          : `owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")${extraZod}`;

    const successFields = scopeKey === "repo"
        ? `owner: input.owner, name: input.name, alerts,`
        : `${scopeKey}: input.${scopeKey}, alerts,`;

    const callParams = scopeKey === "repo"
        ? `{ owner: input.owner, repo: input.name, per_page: perPage, ...filters, ...(cursors.after ? { after: cursors.after } : {}), ...(cursors.before ? { before: cursors.before } : {}) }`
        : scopeKey === "org"
          ? `{ org: input.org, per_page: perPage, ...filters, ...(cursors.after ? { after: cursors.after } : {}), ...(cursors.before ? { before: cursors.before } : {}) }`
          : `{ enterprise: input.enterprise, per_page: perPage, ...filters, ...(cursors.after ? { after: cursors.after } : {}), ...(cursors.before ? { before: cursors.before } : {}) }`;

    const singleCallParams = callParams.replace(/cursors\./g, "input.").replace("...(input.after ? { after: input.after } : {})", "...(input.after !== undefined ? { after: input.after } : {})").replace("...(input.before ? { before: input.before } : {})", "...(input.before !== undefined ? { before: input.before } : {})");

    const listZod = scopeKey === "repo"
        ? BASE_LIST_ZOD + extraZod
        : `,\n${BASE_LIST_ZOD.trim()}${extraZod}`;

    return `${LIST_IMPORTS.replace("{{SUCCESS}}", success).replace("{{FAILURE}}", failure)}
${REGEX}
export function ${register}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool}", "${scopeLabel}", {
            ${idZod}${listZod}
        }, async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            ${buildFilters(extraKeys)}
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorLinkPages({
                        maxPages,
                        initialAfter: input.after,
                        initialBefore: input.before,
                        fetchChunk: async (cursors) => {
                            const response = await ${octokitCall}(${callParams});
                            return { rows: Array.isArray(response.data) ? response.data : [], linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }), requestId: getRequestId(response.headers["x-github-request-id"]) };
                        }
                    });
                    const alerts = result.rows.map((row) => toPlain(row));
                    const successPayload: ${success} = {
                        success: true,
                        message: result.truncated ? \`Dependabot alerts partially listed (\${result.pagesFetched} pages, \${alerts.length} alerts); more pages exist.\` : result.pagesFetched > 1 ? \`Dependabot alerts retrieved successfully (\${result.pagesFetched} pages, \${alerts.length} alerts).\` : "Dependabot alerts retrieved successfully.",
                        ${successFields}
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }
                const response = await ${octokitCall}(${singleCallParams});
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ${success} = {
                    success: true,
                    message: "Dependabot alerts retrieved successfully.",
                    ${successFields}
                    alerts: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            ${failBlock(failure)}
        });
}
`;
}

const tools = [
    {
        tool: "github_list_enterprise_dependabot_alerts",
        scopeKey: "enterprise",
        scopeLabel: "List Dependabot alerts for an enterprise (GET /enterprises/{enterprise}/dependabot/alerts). Cursor pagination via before/after; supports all_pages/max_pages. Classic tokens need repo or security_events. See [List Dependabot alerts for an enterprise](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10#list-dependabot-alerts-for-an-enterprise).",
        octokitCall: "octokit.rest.dependabot.listAlertsForEnterprise"
    },
    {
        tool: "github_list_org_dependabot_alerts",
        scopeKey: "org",
        scopeLabel: "List Dependabot alerts for an organization (GET /orgs/{org}/dependabot/alerts). Optional filters; cursor pagination via before/after. Classic tokens need security_events. See [List Dependabot alerts for an organization](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10#list-dependabot-alerts-for-an-organization).",
        octokitCall: "octokit.rest.dependabot.listAlertsForOrg",
        extraZod: ",\n            artifact_registry_url: z.string().min(1).optional(),\n            artifact_registry: z.string().min(1).optional(),\n            runtime_risk: z.string().min(1).optional()",
        extraKeys: ["artifact_registry_url", "artifact_registry", "runtime_risk"]
    },
    {
        tool: "github_list_repo_dependabot_alerts",
        scopeKey: "repo",
        scopeLabel: "List Dependabot alerts for a repository (GET /repos/{owner}/{repo}/dependabot/alerts). Optional filters including manifest; cursor pagination via before/after. Classic tokens need security_events. See [List Dependabot alerts for a repository](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10#list-dependabot-alerts-for-a-repository).",
        octokitCall: "octokit.rest.dependabot.listAlertsForRepo",
        extraZod: ",\n            manifest: z.string().min(1).optional()",
        extraKeys: ["manifest"]
    }
];

for (const t of tools) {
    const success = `${pascalFromTool(t.tool)}Success`;
    const failure = `${pascalFromTool(t.tool)}Failure`;
    writeFile(`src/tools/dependabot/${dir}/${kebabFromTool(t.tool)}.ts`, genListTool({ ...t, success, failure, register: registerFn(t.tool) }));
}

// get + update
writeFile(`src/tools/dependabot/${dir}/github-get-repo-dependabot-alert.ts`, `${COMMON_IMPORTS.replace("{{SUCCESS}}", "GetRepoDependabotAlertSuccess").replace("{{FAILURE}}", "GetRepoDependabotAlertFailure")}
${REGEX}
export function registerGithubGetRepoDependabotAlertTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_repo_dependabot_alert", "Get a Dependabot alert (GET /repos/{owner}/{repo}/dependabot/alerts/{alert_number}). Classic tokens need security_events. See [Get a Dependabot alert](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10#get-a-dependabot-alert).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        alert_number: z.number().int().positive()
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.getAlert({ owner: input.owner, repo: input.name, alert_number: input.alert_number });
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            return textAndData({ success: true, message: "Dependabot alert retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, alert_number: input.alert_number, alert: toPlain(response.data), request_id: requestId } satisfies GetRepoDependabotAlertSuccess);
        ${failBlock("GetRepoDependabotAlertFailure")}
    });
}
`);

writeFile(`src/tools/dependabot/${dir}/github-update-repo-dependabot-alert.ts`, `${COMMON_IMPORTS.replace("{{SUCCESS}}", "UpdateRepoDependabotAlertSuccess").replace("{{FAILURE}}", "UpdateRepoDependabotAlertFailure")}
${REGEX}
export function registerGithubUpdateRepoDependabotAlertTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_update_repo_dependabot_alert", "Update a Dependabot alert (PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}). Set state to dismissed with dismissed_reason/comment, or reopen with state open. Optional assignees and agent_assignment. See [Update a Dependabot alert](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10#update-a-dependabot-alert).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        alert_number: z.number().int().positive(),
        state: z.enum(["open", "dismissed"]).optional(),
        dismissed_reason: z.enum(["fix_started", "inaccurate", "no_bandwidth", "not_used", "tolerable_risk"]).optional(),
        dismissed_comment: z.string().max(280).optional(),
        assignees: z.array(z.string()).optional(),
        agent_assignment: z.object({ custom_instructions: z.string().optional(), custom_agent: z.string().optional(), model: z.string().optional() }).optional()
    }, async (input) => {
        try {
            const body = {
                ...(input.state !== undefined ? { state: input.state } : {}),
                ...(input.dismissed_reason !== undefined ? { dismissed_reason: input.dismissed_reason } : {}),
                ...(input.dismissed_comment !== undefined ? { dismissed_comment: input.dismissed_comment } : {}),
                ...(input.assignees !== undefined ? { assignees: input.assignees } : {}),
                ...(input.agent_assignment !== undefined ? { agent_assignment: input.agent_assignment } : {})
            };
            const response = await octokit.rest.dependabot.updateAlert({ owner: input.owner, repo: input.name, alert_number: input.alert_number, ...body });
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            return textAndData({ success: true, message: "Dependabot alert updated successfully.", http_status: response.status, owner: input.owner, name: input.name, alert_number: input.alert_number, alert: toPlain(response.data), request_id: requestId } satisfies UpdateRepoDependabotAlertSuccess);
        ${failBlock("UpdateRepoDependabotAlertFailure")}
    });
}
`);

writeFile(`src/tools/dependabot/${dir}/README.md`, `# Dependabot alerts MCP tools

Tools for [Dependabot alerts](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10) at enterprise, organization, and repository scope.

Failures use \`CreateRepoFailure\`. List tools use cursor pagination (\`before\`/\`after\`) with optional \`all_pages\`.

## Tools

| Tool | Endpoint |
| --- | --- |
| \`github_list_enterprise_dependabot_alerts\` | \`GET /enterprises/{enterprise}/dependabot/alerts\` |
| \`github_list_org_dependabot_alerts\` | \`GET /orgs/{org}/dependabot/alerts\` |
| \`github_list_repo_dependabot_alerts\` | \`GET /repos/{owner}/{repo}/dependabot/alerts\` |
| \`github_get_repo_dependabot_alert\` | \`GET .../dependabot/alerts/{alert_number}\` |
| \`github_update_repo_dependabot_alert\` | \`PATCH .../dependabot/alerts/{alert_number}\` |
`);

const SECTION2_TYPES = `
/** MCP tool: \`github_list_enterprise_dependabot_alerts\`. */
export type ListEnterpriseDependabotAlertsSuccess = { success: true; message: string; enterprise: string; alerts: Record<string, unknown>[]; pagination: GitHubLinkPagination | null; request_id: string | null; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListEnterpriseDependabotAlertsFailure = CreateRepoFailure;
/** MCP tool: \`github_list_org_dependabot_alerts\`. */
export type ListOrgDependabotAlertsSuccess = { success: true; message: string; org: string; alerts: Record<string, unknown>[]; pagination: GitHubLinkPagination | null; request_id: string | null; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListOrgDependabotAlertsFailure = CreateRepoFailure;
/** MCP tool: \`github_list_repo_dependabot_alerts\`. */
export type ListRepoDependabotAlertsSuccess = { success: true; message: string; owner: string; name: string; alerts: Record<string, unknown>[]; pagination: GitHubLinkPagination | null; request_id: string | null; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListRepoDependabotAlertsFailure = CreateRepoFailure;
/** MCP tool: \`github_get_repo_dependabot_alert\`. */
export type GetRepoDependabotAlertSuccess = { success: true; message: string; http_status: number; owner: string; name: string; alert_number: number; alert: Record<string, unknown>; request_id: string | null; };
export type GetRepoDependabotAlertFailure = CreateRepoFailure;
/** MCP tool: \`github_update_repo_dependabot_alert\`. */
export type UpdateRepoDependabotAlertSuccess = { success: true; message: string; http_status: number; owner: string; name: string; alert_number: number; alert: Record<string, unknown>; request_id: string | null; };
export type UpdateRepoDependabotAlertFailure = CreateRepoFailure;
`;

const allTools = [...tools.map((t) => t.tool), "github_get_repo_dependabot_alert", "github_update_repo_dependabot_alert"];
const typeNames = allTools.flatMap((t) => [`${pascalFromTool(t)}Success`, `${pascalFromTool(t)}Failure`]);

fs.appendFileSync(path.join(ROOT, "src/types.ts"), SECTION2_TYPES + "\n");

let index = fs.readFileSync(path.join(ROOT, "src/index.ts"), "utf8");
const imports = allTools.map((t) => `import { ${registerFn(t)} } from "./tools/dependabot/${dir}/${kebabFromTool(t)}.js";`).join("\n");
const regs = allTools.map((t) => `${registerFn(t)}(server, octokit);`).join("\n");
index = index.replace(
    'import { registerGithubRevokeCredentialsTool } from "./tools/credentials/revoke/github-revoke-credentials.js";',
    imports + '\nimport { registerGithubRevokeCredentialsTool } from "./tools/credentials/revoke/github-revoke-credentials.js";'
);
index = index.replace("registerGithubRevokeCredentialsTool(server, octokit);", "registerGithubRevokeCredentialsTool(server, octokit);\n" + regs);
fs.writeFileSync(path.join(ROOT, "src/index.ts"), index);

let mcp = fs.readFileSync(path.join(ROOT, "src/utils/mcp-response.ts"), "utf8");
mcp = mcp.replace("    CancelRepoDependabotDismissalRequestFailure,", "    CancelRepoDependabotDismissalRequestFailure,\n" + typeNames.map((n) => `    ${n},`).join("\n"));
mcp = mcp.replace("        | CancelRepoDependabotDismissalRequestFailure", "        | CancelRepoDependabotDismissalRequestFailure\n" + typeNames.map((n) => `        | ${n}`).join("\n"));
fs.writeFileSync(path.join(ROOT, "src/utils/mcp-response.ts"), mcp);

for (const t of allTools) {
    writeFile(`mcps/user-github-mcp/tools/dependabot/${dir}/${t}.json`, JSON.stringify({ name: t, description: t, arguments: { type: "object", properties: {}, required: [], $schema: "http://json-schema.org/draft-07/schema#" } }, null, 4) + "\n");
}

console.log("Section 2: generated", allTools.length, "tools");
