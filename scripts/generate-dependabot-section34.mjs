#!/usr/bin/env node
/** Generate Dependabot sections 3 (repository-access) and 4 (secrets) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const section = Number(process.argv[2] ?? 3);

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
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;
`;

const FAIL = `} catch (error: unknown) {
                const failurePayload: {{FAILURE}} = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }`;

const IMPORTS = `import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { {{SUCCESS}}, {{FAILURE}} } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
`;

const LIST_IMPORTS = IMPORTS.replace(
    'import { textAndData }',
    `import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData }`
).replace(
    'from "../../../utils/mcp-response.js";',
    `from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";`
);

const ENCRYPT_IMPORTS = IMPORTS.replace(
    'import { getRequestId',
    `import { encryptSecretValue } from "../../../utils/encrypt-secret.js";
import { getRequestId`
);

function patchIndex(dir, tools) {
    let index = fs.readFileSync(path.join(ROOT, "src/index.ts"), "utf8");
    const importLines = tools.map((t) => `import { ${registerFn(t)} } from "./tools/dependabot/${dir}/${kebabFromTool(t)}.js";`).join("\n");
    if (!index.includes(registerFn(tools[0]))) {
        index = index.replace(
            'import { registerGithubRevokeCredentialsTool } from "./tools/credentials/revoke/github-revoke-credentials.js";',
            importLines + '\nimport { registerGithubRevokeCredentialsTool } from "./tools/credentials/revoke/github-revoke-credentials.js";'
        );
        index = index.replace(
            "registerGithubRevokeCredentialsTool(server, octokit);",
            "registerGithubRevokeCredentialsTool(server, octokit);\n" + tools.map((t) => `${registerFn(t)}(server, octokit);`).join("\n")
        );
        fs.writeFileSync(path.join(ROOT, "src/index.ts"), index);
    }
}

function patchTypes(content) {
    fs.appendFileSync(path.join(ROOT, "src/types.ts"), content + "\n");
}

function patchMcp(typeNames) {
    let mcp = fs.readFileSync(path.join(ROOT, "src/utils/mcp-response.ts"), "utf8");
    if (!mcp.includes(typeNames[0])) {
        mcp = mcp.replace(
            "    UpdateRepoDependabotAlertFailure,",
            "    UpdateRepoDependabotAlertFailure,\n" + typeNames.map((n) => `    ${n},`).join("\n")
        );
        mcp = mcp.replace(
            "        | UpdateRepoDependabotAlertFailure",
            "        | UpdateRepoDependabotAlertFailure\n" + typeNames.map((n) => `        | ${n}`).join("\n")
        );
        fs.writeFileSync(path.join(ROOT, "src/utils/mcp-response.ts"), mcp);
    }
}

function writeJson(dir, tool, props, required) {
    writeFile(`mcps/user-github-mcp/tools/dependabot/${dir}/${tool}.json`, JSON.stringify({ name: tool, description: tool, arguments: { type: "object", properties: props, required, $schema: "http://json-schema.org/draft-07/schema#" } }, null, 4) + "\n");
}

if (section === 3) {
    const dir = "repository-access";
    const tools = [
        "github_list_enterprise_dependabot_repository_access",
        "github_update_enterprise_dependabot_repository_access",
        "github_set_enterprise_dependabot_repository_access_default_level",
        "github_list_org_dependabot_repository_access",
        "github_update_org_dependabot_repository_access",
        "github_set_org_dependabot_repository_access_default_level"
    ];

    writeFile(`src/tools/dependabot/${dir}/github-list-enterprise-dependabot-repository-access.ts`, `${LIST_IMPORTS.replace("{{SUCCESS}}", "ListEnterpriseDependabotRepositoryAccessSuccess").replace("{{FAILURE}}", "ListEnterpriseDependabotRepositoryAccessFailure")}
${REGEX}
export function registerGithubListEnterpriseDependabotRepositoryAccessTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_enterprise_dependabot_repository_access", "List repositories Dependabot can access in an enterprise (GET /enterprises/{enterprise}/dependabot/repository-access). Returns default_level and accessible_repositories. Enterprise owner required. See [Lists the repositories Dependabot can access in an enterprise](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#lists-the-repositories-dependabot-can-access-in-an-enterprise).", {
        enterprise: z.string().min(1).max(50).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional()
    }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        const page = input.page ?? 1;
        try {
            const response = await octokit.request("GET /enterprises/{enterprise}/dependabot/repository-access", { enterprise: input.enterprise, per_page: perPage, page } as never);
            const data = toPlain(response.data);
            return textAndData({ success: true, message: "Dependabot repository access listed successfully.", http_status: response.status, enterprise: input.enterprise, default_level: data.default_level ?? null, accessible_repositories: Array.isArray(data.accessible_repositories) ? data.accessible_repositories.map((r) => toPlain(r)) : [], pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage } satisfies ListEnterpriseDependabotRepositoryAccessSuccess);
        ${FAIL.replace("{{FAILURE}}", "ListEnterpriseDependabotRepositoryAccessFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-update-enterprise-dependabot-repository-access.ts`, `${IMPORTS.replace("{{SUCCESS}}", "UpdateEnterpriseDependabotRepositoryAccessSuccess").replace("{{FAILURE}}", "UpdateEnterpriseDependabotRepositoryAccessFailure")}
${REGEX}
export function registerGithubUpdateEnterpriseDependabotRepositoryAccessTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_update_enterprise_dependabot_repository_access", "Update Dependabot repository access for an enterprise (PATCH /enterprises/{enterprise}/dependabot/repository-access). Returns **204**. See [Updates Dependabot's repository access list for an enterprise](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#updates-dependabots-repository-access-list-for-an-enterprise).", {
        enterprise: z.string().min(1).max(50).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
        repository_ids_to_add: z.array(z.number().int().positive()).optional(),
        repository_ids_to_remove: z.array(z.number().int().positive()).optional()
    }, async (input) => {
        try {
            const response = await octokit.request("PATCH /enterprises/{enterprise}/dependabot/repository-access", { enterprise: input.enterprise, ...(input.repository_ids_to_add !== undefined ? { repository_ids_to_add: input.repository_ids_to_add } : {}), ...(input.repository_ids_to_remove !== undefined ? { repository_ids_to_remove: input.repository_ids_to_remove } : {}) } as never);
            return textAndData({ success: true, message: "Enterprise Dependabot repository access updated successfully.", http_status: response.status, enterprise: input.enterprise, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies UpdateEnterpriseDependabotRepositoryAccessSuccess);
        ${FAIL.replace("{{FAILURE}}", "UpdateEnterpriseDependabotRepositoryAccessFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-set-enterprise-dependabot-repository-access-default-level.ts`, `${IMPORTS.replace("{{SUCCESS}}", "SetEnterpriseDependabotRepositoryAccessDefaultLevelSuccess").replace("{{FAILURE}}", "SetEnterpriseDependabotRepositoryAccessDefaultLevelFailure")}
${REGEX}
export function registerGithubSetEnterpriseDependabotRepositoryAccessDefaultLevelTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_set_enterprise_dependabot_repository_access_default_level", "Set default Dependabot repository access level for an enterprise (PUT /enterprises/{enterprise}/dependabot/repository-access/default-level). Returns **204**. See [Set the default repository access level for Dependabot in an enterprise](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#set-the-default-repository-access-level-for-dependabot-in-an-enterprise).", {
        enterprise: z.string().min(1).max(50).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
        default_level: z.enum(["public", "internal"])
    }, async (input) => {
        try {
            const response = await octokit.request("PUT /enterprises/{enterprise}/dependabot/repository-access/default-level", { enterprise: input.enterprise, default_level: input.default_level } as never);
            return textAndData({ success: true, message: "Enterprise default Dependabot repository access level set successfully.", http_status: response.status, enterprise: input.enterprise, default_level: input.default_level, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies SetEnterpriseDependabotRepositoryAccessDefaultLevelSuccess);
        ${FAIL.replace("{{FAILURE}}", "SetEnterpriseDependabotRepositoryAccessDefaultLevelFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-list-org-dependabot-repository-access.ts`, `${LIST_IMPORTS.replace("{{SUCCESS}}", "ListOrgDependabotRepositoryAccessSuccess").replace("{{FAILURE}}", "ListOrgDependabotRepositoryAccessFailure")}
${REGEX}
export function registerGithubListOrgDependabotRepositoryAccessTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_org_dependabot_repository_access", "List repositories Dependabot can access in an organization (GET /orgs/{org}/dependabot/repository-access). Returns default_level and accessible_repositories. See [Lists the repositories Dependabot can access in an organization](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#lists-the-repositories-dependabot-can-access-in-an-organization).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional()
    }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        const page = input.page ?? 1;
        try {
            const response = await octokit.rest.dependabot.repositoryAccessForOrg({ org: input.org, per_page: perPage, page });
            const data = toPlain(response.data);
            return textAndData({ success: true, message: "Dependabot repository access listed successfully.", http_status: response.status, org: input.org, default_level: data.default_level ?? null, accessible_repositories: Array.isArray(data.accessible_repositories) ? data.accessible_repositories.map((r) => toPlain(r)) : [], pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage } satisfies ListOrgDependabotRepositoryAccessSuccess);
        ${FAIL.replace("{{FAILURE}}", "ListOrgDependabotRepositoryAccessFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-update-org-dependabot-repository-access.ts`, `${IMPORTS.replace("{{SUCCESS}}", "UpdateOrgDependabotRepositoryAccessSuccess").replace("{{FAILURE}}", "UpdateOrgDependabotRepositoryAccessFailure")}
${REGEX}
export function registerGithubUpdateOrgDependabotRepositoryAccessTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_update_org_dependabot_repository_access", "Update Dependabot repository access for an organization (PATCH /orgs/{org}/dependabot/repository-access). Returns **204**. See [Updates Dependabot's repository access list for an organization](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#updates-dependabots-repository-access-list-for-an-organization).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        repository_ids_to_add: z.array(z.number().int().positive()).optional(),
        repository_ids_to_remove: z.array(z.number().int().positive()).optional()
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.updateRepositoryAccessForOrg({ org: input.org, ...(input.repository_ids_to_add !== undefined ? { repository_ids_to_add: input.repository_ids_to_add } : {}), ...(input.repository_ids_to_remove !== undefined ? { repository_ids_to_remove: input.repository_ids_to_remove } : {}) });
            return textAndData({ success: true, message: "Organization Dependabot repository access updated successfully.", http_status: response.status, org: input.org, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies UpdateOrgDependabotRepositoryAccessSuccess);
        ${FAIL.replace("{{FAILURE}}", "UpdateOrgDependabotRepositoryAccessFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-set-org-dependabot-repository-access-default-level.ts`, `${IMPORTS.replace("{{SUCCESS}}", "SetOrgDependabotRepositoryAccessDefaultLevelSuccess").replace("{{FAILURE}}", "SetOrgDependabotRepositoryAccessDefaultLevelFailure")}
${REGEX}
export function registerGithubSetOrgDependabotRepositoryAccessDefaultLevelTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_set_org_dependabot_repository_access_default_level", "Set default Dependabot repository access level for an organization (PUT /orgs/{org}/dependabot/repository-access/default-level). Returns **204**. See [Set the default repository access level for Dependabot](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#set-the-default-repository-access-level-for-dependabot).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        default_level: z.enum(["public", "internal"])
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.setRepositoryAccessDefaultLevel({ org: input.org, default_level: input.default_level });
            return textAndData({ success: true, message: "Organization default Dependabot repository access level set successfully.", http_status: response.status, org: input.org, default_level: input.default_level, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies SetOrgDependabotRepositoryAccessDefaultLevelSuccess);
        ${FAIL.replace("{{FAILURE}}", "SetOrgDependabotRepositoryAccessDefaultLevelFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/README.md`, `# Dependabot repository access MCP tools

Tools for [Dependabot repository access](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10) at enterprise and organization scope.

Failures use \`CreateRepoFailure\`.

## Enterprise

| Tool | Endpoint |
| --- | --- |
| \`github_list_enterprise_dependabot_repository_access\` | \`GET /enterprises/{enterprise}/dependabot/repository-access\` |
| \`github_update_enterprise_dependabot_repository_access\` | \`PATCH /enterprises/{enterprise}/dependabot/repository-access\` |
| \`github_set_enterprise_dependabot_repository_access_default_level\` | \`PUT .../default-level\` |

## Organization

| Tool | Endpoint |
| --- | --- |
| \`github_list_org_dependabot_repository_access\` | \`GET /orgs/{org}/dependabot/repository-access\` |
| \`github_update_org_dependabot_repository_access\` | \`PATCH /orgs/{org}/dependabot/repository-access\` |
| \`github_set_org_dependabot_repository_access_default_level\` | \`PUT .../default-level\` |
`);

    const types = `
export type ListEnterpriseDependabotRepositoryAccessSuccess = { success: true; message: string; http_status: number; enterprise: string; default_level: unknown; accessible_repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; };
export type ListEnterpriseDependabotRepositoryAccessFailure = CreateRepoFailure;
export type UpdateEnterpriseDependabotRepositoryAccessSuccess = { success: true; message: string; http_status: number; enterprise: string; request_id: string | null; };
export type UpdateEnterpriseDependabotRepositoryAccessFailure = CreateRepoFailure;
export type SetEnterpriseDependabotRepositoryAccessDefaultLevelSuccess = { success: true; message: string; http_status: number; enterprise: string; default_level: string; request_id: string | null; };
export type SetEnterpriseDependabotRepositoryAccessDefaultLevelFailure = CreateRepoFailure;
export type ListOrgDependabotRepositoryAccessSuccess = { success: true; message: string; http_status: number; org: string; default_level: unknown; accessible_repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; };
export type ListOrgDependabotRepositoryAccessFailure = CreateRepoFailure;
export type UpdateOrgDependabotRepositoryAccessSuccess = { success: true; message: string; http_status: number; org: string; request_id: string | null; };
export type UpdateOrgDependabotRepositoryAccessFailure = CreateRepoFailure;
export type SetOrgDependabotRepositoryAccessDefaultLevelSuccess = { success: true; message: string; http_status: number; org: string; default_level: string; request_id: string | null; };
export type SetOrgDependabotRepositoryAccessDefaultLevelFailure = CreateRepoFailure;
`;
    patchTypes(types);
    const typeNames = tools.flatMap((t) => [`${pascalFromTool(t)}Success`, `${pascalFromTool(t)}Failure`]);
    patchMcp(typeNames);
    patchIndex(dir, tools);
    for (const t of tools) writeJson(dir, t, {}, []);
    console.log("Section 3:", tools.length, "tools");
}

if (section === 4) {
    const dir = "secrets";
    const orgTools = [
        "github_list_org_dependabot_secrets",
        "github_get_org_dependabot_public_key",
        "github_get_org_dependabot_secret",
        "github_create_or_update_org_dependabot_secret",
        "github_delete_org_dependabot_secret",
        "github_list_selected_repos_for_org_dependabot_secret",
        "github_set_selected_repos_for_org_dependabot_secret",
        "github_add_selected_repo_to_org_dependabot_secret",
        "github_remove_selected_repo_from_org_dependabot_secret"
    ];
    const repoTools = [
        "github_list_repo_dependabot_secrets",
        "github_get_repo_dependabot_public_key",
        "github_get_repo_dependabot_secret",
        "github_create_or_update_repo_dependabot_secret",
        "github_delete_repo_dependabot_secret"
    ];
    const tools = [...orgTools, ...repoTools];

    // list org secrets - copy pattern from actions
    writeFile(`src/tools/dependabot/${dir}/github-list-org-dependabot-secrets.ts`, `${LIST_IMPORTS.replace("{{SUCCESS}}", "ListOrgDependabotSecretsSuccess").replace("{{FAILURE}}", "ListOrgDependabotSecretsFailure")}
${REGEX}
function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "secrets" in data) {
        const o = data as Record<string, unknown>;
        return { total_count: typeof o.total_count === "number" ? o.total_count : 0, rows: Array.isArray(o.secrets) ? o.secrets : [] };
    }
    return { total_count: 0, rows: [] };
}
export function registerGithubListOrgDependabotSecretsTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_org_dependabot_secrets", "List Dependabot secrets in an organization (GET /orgs/{org}/dependabot/secrets). Classic tokens need admin:org. See [List organization secrets](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#list-organization-secrets).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        per_page: z.number().int().min(1).max(100).optional(), page: z.number().int().min(1).optional(), all_pages: z.boolean().optional(), max_pages: z.number().int().min(1).max(500).optional()
    }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        try {
            if (input.all_pages === true) {
                const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                let firstTotalCount: number | undefined;
                const result = await fetchAllPageLinkPages({ perPage, maxPages, fetchPage: async (page, pp) => {
                    const response = await octokit.rest.dependabot.listOrgSecrets({ org: input.org, per_page: pp, page });
                    const parsed = parseBody(response.data);
                    if (firstTotalCount === undefined) firstTotalCount = parsed.total_count;
                    return { rows: parsed.rows, linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }), requestId: getRequestId(response.headers["x-github-request-id"]) };
                }});
                const secrets = result.rows.map((row) => toPlain(row));
                return textAndData({ success: true, message: "Organization Dependabot secrets listed successfully.", org: input.org, total_count: firstTotalCount ?? secrets.length, secrets, pagination: result.responsePagination, request_id: result.lastRequestId, page: result.lastPage, per_page: perPage, pages_fetched: result.pagesFetched, truncated: result.truncated || undefined } satisfies ListOrgDependabotSecretsSuccess);
            }
            const page = input.page ?? 1;
            const response = await octokit.rest.dependabot.listOrgSecrets({ org: input.org, per_page: perPage, page });
            const parsed = parseBody(response.data);
            return textAndData({ success: true, message: "Organization Dependabot secrets listed successfully.", org: input.org, total_count: parsed.total_count, secrets: parsed.rows.map((row) => toPlain(row)), pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage, pages_fetched: 1 } satisfies ListOrgDependabotSecretsSuccess);
        ${FAIL.replace("{{FAILURE}}", "ListOrgDependabotSecretsFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-get-org-dependabot-public-key.ts`, `${IMPORTS.replace("{{SUCCESS}}", "GetOrgDependabotPublicKeySuccess").replace("{{FAILURE}}", "GetOrgDependabotPublicKeyFailure")}
${REGEX}
export function registerGithubGetOrgDependabotPublicKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_org_dependabot_public_key", "Get organization Dependabot public key (GET /orgs/{org}/dependabot/secrets/public-key). See [Get an organization public key](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#get-an-organization-public-key).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.getOrgPublicKey({ org: input.org });
            return textAndData({ success: true, message: "Organization Dependabot public key retrieved successfully.", http_status: response.status, org: input.org, public_key: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies GetOrgDependabotPublicKeySuccess);
        ${FAIL.replace("{{FAILURE}}", "GetOrgDependabotPublicKeyFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-get-org-dependabot-secret.ts`, `${IMPORTS.replace("{{SUCCESS}}", "GetOrgDependabotSecretSuccess").replace("{{FAILURE}}", "GetOrgDependabotSecretFailure")}
${REGEX}
export function registerGithubGetOrgDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_org_dependabot_secret", "Get organization Dependabot secret metadata (GET /orgs/{org}/dependabot/secrets/{secret_name}). See [Get an organization secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#get-an-organization-secret).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number")
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.getOrgSecret({ org: input.org, secret_name: input.secret_name });
            return textAndData({ success: true, message: "Organization Dependabot secret retrieved successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, secret: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies GetOrgDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "GetOrgDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-create-or-update-org-dependabot-secret.ts`, `${ENCRYPT_IMPORTS.replace("{{SUCCESS}}", "CreateOrUpdateOrgDependabotSecretSuccess").replace("{{FAILURE}}", "CreateOrUpdateOrgDependabotSecretFailure")}
${REGEX}
export function registerGithubCreateOrUpdateOrgDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_create_or_update_org_dependabot_secret", "Create or update organization Dependabot secret (PUT /orgs/{org}/dependabot/secrets/{secret_name}). Provide plaintext value; encrypted automatically. See [Create or update an organization secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#create-or-update-an-organization-secret).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        value: z.string().describe("The plaintext secret value to encrypt and store."),
        visibility: z.enum(["all", "private", "selected"]),
        selected_repository_ids: z.array(z.number().int().positive()).optional()
    }, async (input) => {
        try {
            const keyResponse = await octokit.rest.dependabot.getOrgPublicKey({ org: input.org });
            const key = keyResponse.data as { key_id: string; key: string };
            const encryptedValue = await encryptSecretValue(input.value, key.key);
            const response = await octokit.rest.dependabot.createOrUpdateOrgSecret({ org: input.org, secret_name: input.secret_name, encrypted_value: encryptedValue, key_id: key.key_id, visibility: input.visibility, ...(input.selected_repository_ids !== undefined ? { selected_repository_ids: input.selected_repository_ids } : {}) });
            const created = response.status === 201;
            return textAndData({ success: true, message: created ? "Organization Dependabot secret created successfully." : "Organization Dependabot secret updated successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, created, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies CreateOrUpdateOrgDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "CreateOrUpdateOrgDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-delete-org-dependabot-secret.ts`, `${IMPORTS.replace("{{SUCCESS}}", "DeleteOrgDependabotSecretSuccess").replace("{{FAILURE}}", "DeleteOrgDependabotSecretFailure")}
${REGEX}
export function registerGithubDeleteOrgDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_delete_org_dependabot_secret", "Delete organization Dependabot secret (DELETE /orgs/{org}/dependabot/secrets/{secret_name}). Returns **204**. See [Delete an organization secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#delete-an-organization-secret).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number")
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.deleteOrgSecret({ org: input.org, secret_name: input.secret_name });
            return textAndData({ success: true, message: "Organization Dependabot secret deleted successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies DeleteOrgDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "DeleteOrgDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-list-selected-repos-for-org-dependabot-secret.ts`, `${LIST_IMPORTS.replace("{{SUCCESS}}", "ListSelectedReposForOrgDependabotSecretSuccess").replace("{{FAILURE}}", "ListSelectedReposForOrgDependabotSecretFailure")}
${REGEX}
function parseRepos(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "repositories" in data) {
        const o = data as Record<string, unknown>;
        return { total_count: typeof o.total_count === "number" ? o.total_count : 0, rows: Array.isArray(o.repositories) ? o.repositories : [] };
    }
    return { total_count: 0, rows: [] };
}
export function registerGithubListSelectedReposForOrgDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_selected_repos_for_org_dependabot_secret", "List repositories with access to a selected-visibility org Dependabot secret (GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories). See [List selected repositories for an organization secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#list-selected-repositories-for-an-organization-secret).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        per_page: z.number().int().min(1).max(100).optional(), page: z.number().int().min(1).optional(), all_pages: z.boolean().optional(), max_pages: z.number().int().min(1).max(500).optional()
    }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        try {
            if (input.all_pages === true) {
                const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                let firstTotalCount: number | undefined;
                const result = await fetchAllPageLinkPages({ perPage, maxPages, fetchPage: async (page, pp) => {
                    const response = await octokit.rest.dependabot.listSelectedReposForOrgSecret({ org: input.org, secret_name: input.secret_name, per_page: pp, page });
                    const parsed = parseRepos(response.data);
                    if (firstTotalCount === undefined) firstTotalCount = parsed.total_count;
                    return { rows: parsed.rows, linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }), requestId: getRequestId(response.headers["x-github-request-id"]) };
                }});
                const repositories = result.rows.map((row) => toPlain(row));
                return textAndData({ success: true, message: "Selected repositories listed successfully.", org: input.org, secret_name: input.secret_name, total_count: firstTotalCount ?? repositories.length, repositories, pagination: result.responsePagination, request_id: result.lastRequestId, page: result.lastPage, per_page: perPage, pages_fetched: result.pagesFetched, truncated: result.truncated || undefined } satisfies ListSelectedReposForOrgDependabotSecretSuccess);
            }
            const page = input.page ?? 1;
            const response = await octokit.rest.dependabot.listSelectedReposForOrgSecret({ org: input.org, secret_name: input.secret_name, per_page: perPage, page });
            const parsed = parseRepos(response.data);
            return textAndData({ success: true, message: "Selected repositories listed successfully.", org: input.org, secret_name: input.secret_name, total_count: parsed.total_count, repositories: parsed.rows.map((row) => toPlain(row)), pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage, pages_fetched: 1 } satisfies ListSelectedReposForOrgDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "ListSelectedReposForOrgDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-set-selected-repos-for-org-dependabot-secret.ts`, `${IMPORTS.replace("{{SUCCESS}}", "SetSelectedReposForOrgDependabotSecretSuccess").replace("{{FAILURE}}", "SetSelectedReposForOrgDependabotSecretFailure")}
${REGEX}
export function registerGithubSetSelectedReposForOrgDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_set_selected_repos_for_org_dependabot_secret", "Set selected repositories for org Dependabot secret (PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories). Returns **204**. See [Set selected repositories for an organization secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#set-selected-repositories-for-an-organization-secret).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        selected_repository_ids: z.array(z.number().int().positive())
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.setSelectedReposForOrgSecret({ org: input.org, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids });
            return textAndData({ success: true, message: "Selected repositories set successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies SetSelectedReposForOrgDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "SetSelectedReposForOrgDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-add-selected-repo-to-org-dependabot-secret.ts`, `${IMPORTS.replace("{{SUCCESS}}", "AddSelectedRepoToOrgDependabotSecretSuccess").replace("{{FAILURE}}", "AddSelectedRepoToOrgDependabotSecretFailure")}
${REGEX}
export function registerGithubAddSelectedRepoToOrgDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_add_selected_repo_to_org_dependabot_secret", "Add repository to org Dependabot secret (PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}). Returns **204**. See [Add selected repository to an organization secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#add-selected-repository-to-an-organization-secret).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        repository_id: z.number().int().positive()
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.addSelectedRepoToOrgSecret({ org: input.org, secret_name: input.secret_name, repository_id: input.repository_id });
            return textAndData({ success: true, message: "Repository added to organization Dependabot secret successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies AddSelectedRepoToOrgDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "AddSelectedRepoToOrgDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-remove-selected-repo-from-org-dependabot-secret.ts`, `${IMPORTS.replace("{{SUCCESS}}", "RemoveSelectedRepoFromOrgDependabotSecretSuccess").replace("{{FAILURE}}", "RemoveSelectedRepoFromOrgDependabotSecretFailure")}
${REGEX}
export function registerGithubRemoveSelectedRepoFromOrgDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_remove_selected_repo_from_org_dependabot_secret", "Remove repository from org Dependabot secret (DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}). Returns **204**. See [Remove selected repository from an organization secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#remove-selected-repository-from-an-organization-secret).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        repository_id: z.number().int().positive()
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.removeSelectedRepoFromOrgSecret({ org: input.org, secret_name: input.secret_name, repository_id: input.repository_id });
            return textAndData({ success: true, message: "Repository removed from organization Dependabot secret successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies RemoveSelectedRepoFromOrgDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "RemoveSelectedRepoFromOrgDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-list-repo-dependabot-secrets.ts`, `${LIST_IMPORTS.replace("{{SUCCESS}}", "ListRepoDependabotSecretsSuccess").replace("{{FAILURE}}", "ListRepoDependabotSecretsFailure")}
${REGEX}
function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "secrets" in data) {
        const o = data as Record<string, unknown>;
        return { total_count: typeof o.total_count === "number" ? o.total_count : 0, rows: Array.isArray(o.secrets) ? o.secrets : [] };
    }
    return { total_count: 0, rows: [] };
}
export function registerGithubListRepoDependabotSecretsTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_repo_dependabot_secrets", "List Dependabot secrets in a repository (GET /repos/{owner}/{repo}/dependabot/secrets). See [List repository secrets](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#list-repository-secrets).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        per_page: z.number().int().min(1).max(100).optional(), page: z.number().int().min(1).optional(), all_pages: z.boolean().optional(), max_pages: z.number().int().min(1).max(500).optional()
    }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        try {
            if (input.all_pages === true) {
                const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                let firstTotalCount: number | undefined;
                const result = await fetchAllPageLinkPages({ perPage, maxPages, fetchPage: async (page, pp) => {
                    const response = await octokit.rest.dependabot.listRepoSecrets({ owner: input.owner, repo: input.name, per_page: pp, page });
                    const parsed = parseBody(response.data);
                    if (firstTotalCount === undefined) firstTotalCount = parsed.total_count;
                    return { rows: parsed.rows, linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }), requestId: getRequestId(response.headers["x-github-request-id"]) };
                }});
                const secrets = result.rows.map((row) => toPlain(row));
                return textAndData({ success: true, message: "Repository Dependabot secrets listed successfully.", owner: input.owner, name: input.name, total_count: firstTotalCount ?? secrets.length, secrets, pagination: result.responsePagination, request_id: result.lastRequestId, page: result.lastPage, per_page: perPage, pages_fetched: result.pagesFetched, truncated: result.truncated || undefined } satisfies ListRepoDependabotSecretsSuccess);
            }
            const page = input.page ?? 1;
            const response = await octokit.rest.dependabot.listRepoSecrets({ owner: input.owner, repo: input.name, per_page: perPage, page });
            const parsed = parseBody(response.data);
            return textAndData({ success: true, message: "Repository Dependabot secrets listed successfully.", owner: input.owner, name: input.name, total_count: parsed.total_count, secrets: parsed.rows.map((row) => toPlain(row)), pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage, pages_fetched: 1 } satisfies ListRepoDependabotSecretsSuccess);
        ${FAIL.replace("{{FAILURE}}", "ListRepoDependabotSecretsFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-get-repo-dependabot-public-key.ts`, `${IMPORTS.replace("{{SUCCESS}}", "GetRepoDependabotPublicKeySuccess").replace("{{FAILURE}}", "GetRepoDependabotPublicKeyFailure")}
${REGEX}
export function registerGithubGetRepoDependabotPublicKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_repo_dependabot_public_key", "Get repository Dependabot public key (GET /repos/{owner}/{repo}/dependabot/secrets/public-key). See [Get a repository public key](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#get-a-repository-public-key).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.getRepoPublicKey({ owner: input.owner, repo: input.name });
            return textAndData({ success: true, message: "Repository Dependabot public key retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, public_key: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies GetRepoDependabotPublicKeySuccess);
        ${FAIL.replace("{{FAILURE}}", "GetRepoDependabotPublicKeyFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-get-repo-dependabot-secret.ts`, `${IMPORTS.replace("{{SUCCESS}}", "GetRepoDependabotSecretSuccess").replace("{{FAILURE}}", "GetRepoDependabotSecretFailure")}
${REGEX}
export function registerGithubGetRepoDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_repo_dependabot_secret", "Get repository Dependabot secret metadata (GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}). See [Get a repository secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#get-a-repository-secret).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number")
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.getRepoSecret({ owner: input.owner, repo: input.name, secret_name: input.secret_name });
            return textAndData({ success: true, message: "Repository Dependabot secret retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, secret_name: input.secret_name, secret: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies GetRepoDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "GetRepoDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-create-or-update-repo-dependabot-secret.ts`, `${ENCRYPT_IMPORTS.replace("{{SUCCESS}}", "CreateOrUpdateRepoDependabotSecretSuccess").replace("{{FAILURE}}", "CreateOrUpdateRepoDependabotSecretFailure")}
${REGEX}
export function registerGithubCreateOrUpdateRepoDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_create_or_update_repo_dependabot_secret", "Create or update repository Dependabot secret (PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}). Provide plaintext value; encrypted automatically. See [Create or update a repository secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#create-or-update-a-repository-secret).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        value: z.string().describe("The plaintext secret value to encrypt and store.")
    }, async (input) => {
        try {
            const keyResponse = await octokit.rest.dependabot.getRepoPublicKey({ owner: input.owner, repo: input.name });
            const key = keyResponse.data as { key_id: string; key: string };
            const encryptedValue = await encryptSecretValue(input.value, key.key);
            const response = await octokit.rest.dependabot.createOrUpdateRepoSecret({ owner: input.owner, repo: input.name, secret_name: input.secret_name, encrypted_value: encryptedValue, key_id: key.key_id });
            const created = response.status === 201;
            return textAndData({ success: true, message: created ? "Repository Dependabot secret created successfully." : "Repository Dependabot secret updated successfully.", http_status: response.status, owner: input.owner, name: input.name, secret_name: input.secret_name, created, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies CreateOrUpdateRepoDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "CreateOrUpdateRepoDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/github-delete-repo-dependabot-secret.ts`, `${IMPORTS.replace("{{SUCCESS}}", "DeleteRepoDependabotSecretSuccess").replace("{{FAILURE}}", "DeleteRepoDependabotSecretFailure")}
${REGEX}
export function registerGithubDeleteRepoDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_delete_repo_dependabot_secret", "Delete repository Dependabot secret (DELETE /repos/{owner}/{repo}/dependabot/secrets/{secret_name}). Returns **204**. See [Delete a repository secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#delete-a-repository-secret).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number")
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.deleteRepoSecret({ owner: input.owner, repo: input.name, secret_name: input.secret_name });
            return textAndData({ success: true, message: "Repository Dependabot secret deleted successfully.", http_status: response.status, owner: input.owner, name: input.name, secret_name: input.secret_name, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies DeleteRepoDependabotSecretSuccess);
        ${FAIL.replace("{{FAILURE}}", "DeleteRepoDependabotSecretFailure")}
    });
}
`);

    writeFile(`src/tools/dependabot/${dir}/README.md`, `# Dependabot secrets MCP tools

Tools for [Dependabot secrets](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10). \`create_or_update_*\` tools accept plaintext \`value\` and encrypt via LibSodium. Failures use \`CreateRepoFailure\`.

## Organization

| Tool | Endpoint |
| --- | --- |
| \`github_list_org_dependabot_secrets\` | \`GET /orgs/{org}/dependabot/secrets\` |
| \`github_get_org_dependabot_public_key\` | \`GET .../public-key\` |
| \`github_get_org_dependabot_secret\` | \`GET .../{secret_name}\` |
| \`github_create_or_update_org_dependabot_secret\` | \`PUT .../{secret_name}\` |
| \`github_delete_org_dependabot_secret\` | \`DELETE .../{secret_name}\` |
| \`github_list_selected_repos_for_org_dependabot_secret\` | \`GET .../repositories\` |
| \`github_set_selected_repos_for_org_dependabot_secret\` | \`PUT .../repositories\` |
| \`github_add_selected_repo_to_org_dependabot_secret\` | \`PUT .../repositories/{repository_id}\` |
| \`github_remove_selected_repo_from_org_dependabot_secret\` | \`DELETE .../repositories/{repository_id}\` |

## Repository

| Tool | Endpoint |
| --- | --- |
| \`github_list_repo_dependabot_secrets\` | \`GET /repos/{owner}/{repo}/dependabot/secrets\` |
| \`github_get_repo_dependabot_public_key\` | \`GET .../public-key\` |
| \`github_get_repo_dependabot_secret\` | \`GET .../{secret_name}\` |
| \`github_create_or_update_repo_dependabot_secret\` | \`PUT .../{secret_name}\` |
| \`github_delete_repo_dependabot_secret\` | \`DELETE .../{secret_name}\` |
`);

    const types = tools.map((t) => {
        const p = pascalFromTool(t);
        if (t.includes("list_org_dependabot_secrets") || t.includes("list_repo_dependabot_secrets")) return `export type ${p}Success = { success: true; message: string; org?: string; owner?: string; name?: string; total_count: number; secrets: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };\nexport type ${p}Failure = CreateRepoFailure;`;
        if (t.includes("list_selected_repos")) return `export type ${p}Success = { success: true; message: string; org: string; secret_name: string; total_count: number; repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };\nexport type ${p}Failure = CreateRepoFailure;`;
        if (t.includes("create_or_update")) return `export type ${p}Success = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; secret_name: string; created: boolean; request_id: string | null; };\nexport type ${p}Failure = CreateRepoFailure;`;
        if (t.includes("public_key")) return `export type ${p}Success = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; public_key: Record<string, unknown>; request_id: string | null; };\nexport type ${p}Failure = CreateRepoFailure;`;
        if (t.includes("get_org") || t.includes("get_repo")) return `export type ${p}Success = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; secret_name: string; secret: Record<string, unknown>; request_id: string | null; };\nexport type ${p}Failure = CreateRepoFailure;`;
        if (t.includes("delete")) return `export type ${p}Success = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; secret_name: string; request_id: string | null; };\nexport type ${p}Failure = CreateRepoFailure;`;
        if (t.includes("set_selected")) return `export type ${p}Success = { success: true; message: string; http_status: number; org: string; secret_name: string; selected_repository_ids: number[]; request_id: string | null; };\nexport type ${p}Failure = CreateRepoFailure;`;
        if (t.includes("add_selected") || t.includes("remove_selected")) return `export type ${p}Success = { success: true; message: string; http_status: number; org: string; secret_name: string; repository_id: number; request_id: string | null; };\nexport type ${p}Failure = CreateRepoFailure;`;
        return "";
    }).join("\n");
    patchTypes(types);
    const typeNames = tools.flatMap((t) => [`${pascalFromTool(t)}Success`, `${pascalFromTool(t)}Failure`]);
    patchMcp(typeNames);
    patchIndex(dir, tools);
    for (const t of tools) writeJson(dir, t, {}, []);
    console.log("Section 4:", tools.length, "tools");
}
