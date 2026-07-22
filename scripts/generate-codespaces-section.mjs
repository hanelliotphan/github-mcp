#!/usr/bin/env node
/**
 * Generate GitHub Codespaces MCP tools for one section at a time.
 * Usage: node scripts/generate-codespaces-section.mjs <section-number> (1-6)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const GEO_ENUM = ["EuropeWest", "SoutheastAsia", "UsEast", "UsWest"];
const VISIBILITY_ENUM = ["disabled", "selected_members", "all_members", "all_members_and_outside_collaborators"];
const SECRET_VISIBILITY_ENUM = ["all", "private", "selected"];

const CREATE_BODY_FIELDS = [
    { key: "ref", zod: "z.string().optional()", json: { type: "string" } },
    { key: "location", zod: "z.string().optional()", json: { type: "string" } },
    {
        key: "geo",
        zod: 'z.enum(["EuropeWest", "SoutheastAsia", "UsEast", "UsWest"]).optional()',
        json: { type: "string", enum: GEO_ENUM }
    },
    { key: "client_ip", zod: "z.string().optional()", json: { type: "string" } },
    { key: "machine", zod: "z.string().optional()", json: { type: "string" } },
    { key: "devcontainer_path", zod: "z.string().optional()", json: { type: "string" } },
    { key: "multi_repo_permissions_opt_out", zod: "z.boolean().optional()", json: { type: "boolean" } },
    { key: "working_directory", zod: "z.string().optional()", json: { type: "string" } },
    { key: "idle_timeout_minutes", zod: "z.number().int().optional()", json: { type: "integer" } },
    { key: "display_name", zod: "z.string().optional()", json: { type: "string" } },
    {
        key: "retention_period_minutes",
        zod: "z.number().int().min(0).max(43200).optional()",
        json: { type: "integer", minimum: 0, maximum: 43200 }
    }
];

function pascalFromTool(name) {
    return name
        .replace(/^github_/, "")
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
}

function kebabFromTool(name) {
    return name.replace(/_/g, "-");
}

function registerFn(name) {
    return `registerGithub${pascalFromTool(name)}Tool`;
}

function spreadOptional(fields, prefix = "input") {
    return fields.map((f) => `...((${prefix}.${f.key} !== undefined) ? { ${f.key}: ${prefix}.${f.key} } : {})`).join(",\n                    ");
}

function zodOwner() {
    return `owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)")`;
}

function zodRepoName() {
    return `name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")`;
}

function zodOrg() {
    return `org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")`;
}

function zodSecretName() {
    return `secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number")`;
}

function zodPagination() {
    return `per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()`;
}

function zodCodespaceName() {
    return `codespace_name: z.string().min(1).describe("The name of the codespace.")`;
}

function createBodyZod(extra = []) {
    const lines = CREATE_BODY_FIELDS.map((f) => `            ${f.key}: ${f.zod}`);
    for (const e of extra) lines.push(`            ${e}`);
    return lines.join(",\n");
}

function createBodyZodBlock(extraBefore = [], extraAfter = []) {
    return [...extraBefore, ...CREATE_BODY_FIELDS.map((f) => `            ${f.key}: ${f.zod}`), ...extraAfter].join(",\n");
}

function createBodyJson(extraProps = {}, extraRequired = []) {
    const properties = Object.fromEntries(CREATE_BODY_FIELDS.map((f) => [f.key, f.json]));
    Object.assign(properties, extraProps);
    return { type: "object", properties, required: extraRequired };
}

function regexConsts(needs = {}) {
    const lines = [];
    if (needs.repo) {
        lines.push("const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;");
        lines.push("");
        lines.push("const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;");
    }
    if (needs.org) lines.push("const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;");
    if (needs.secret) lines.push("const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;");
    return lines.join("\n");
}

function importsBlock(successType, failureType) {
    return `import type {\n    ${failureType},\n    ${successType}\n} from "../../../types.js";`;
}

function stdImports(successType, failureType, extra = []) {
    const extras = extra.length ? `\nimport { ${extra.join(", ")} } from "../../../utils/${extra[0] === "encryptSecretValue" ? "encrypt-secret.js" : extra[0].includes("fetch") ? "github-paginate-all.js" : "parse-github-link-header.js"}";\n` : "";
    const paginate = extra.includes("fetchAllPageLinkPages");
    let out = `import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

${importsBlock(successType, failureType)}
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
`;
    if (paginate) {
        out += `import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";
`;
    }
    if (extra.includes("encryptSecretValue")) {
        out += `import { encryptSecretValue } from "../../../utils/encrypt-secret.js";
`;
    }
    return out;
}

function failureHandler(failureType) {
    return `            } catch (error: unknown) {
                const failurePayload: ${failureType} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }`;
}

function toPlainFn(rows = false) {
    if (rows) {
        return `function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}`;
    }
    return `function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}`;
}

function parseListBody(arrayKey) {
    return `function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "${arrayKey}" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.${arrayKey}) ? o.${arrayKey} : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}`;
}

function genListPaginated(tool, ctx) {
    const S = pascalFromTool(tool.name);
    const arrayKey = tool.arrayKey;
    const needsRepo = tool.scope === "repo";
    const reqArgs = [];
    const reqParams = [];
    if (needsRepo) {
        reqArgs.push("owner: input.owner", "repo: input.name");
        reqParams.push(zodOwner(), zodRepoName());
    }
    if (tool.scope === "org") {
        reqArgs.push("org: input.org");
        reqParams.push(zodOrg());
    }
    if (tool.scope === "orgUser") {
        reqArgs.push("org: input.org", "username: input.username");
        reqParams.push(zodOrg(), "username: z.string().min(1).describe(\"The handle for the GitHub user account.\")");
    }
    if (tool.scope === "user") {
        // user-scoped list endpoints have no owner/repo/org params
    }
    if (tool.filterQuery) {
        reqArgs.push(`...(input.${tool.filterQuery} !== undefined ? { ${tool.filterQuery}: input.${tool.filterQuery} } : {})`);
        reqParams.push(`${tool.filterQuery}: z.number().int().positive().optional().describe("Filter by repository id.")`);
    }
    reqParams.push(zodPagination());

    const ctxFields = needsRepo
        ? "owner: input.owner,\n                        repo: input.name,\n                        full_name,"
        : tool.scope === "org"
          ? "org: input.org,"
          : tool.scope === "orgUser"
            ? "org: input.org,\n                        username: input.username,"
            : "";

    const fullNameLine = needsRepo ? "\n            const full_name = `${input.owner}/${input.name}`;" : "";

    return `${stdImports(`${S}Success`, `${S}Failure`, ["fetchAllPageLinkPages"])}
${regexConsts({ repo: needsRepo, org: tool.scope === "org" || tool.scope === "orgUser" })}

const DEFAULT_PER_PAGE = 100 as const;

${parseListBody(arrayKey)}

${toPlainFn(true)}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            ${reqParams.join(",\n            ")}
        },
        async (input) => {${fullNameLine}
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request("${tool.method}", {
                                ${[...reqArgs, "per_page: pp", "page"].join(",\n                                ")}
                            });
                            const parsed = parseBody(response.data);
                            if (firstTotalCount === undefined) {
                                firstTotalCount = parsed.total_count;
                            }
                            return {
                                rows: parsed.rows,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const ${arrayKey} = toPlain(result.rows);
                    const successPayload: ${S}Success = {
                        success: true,
                        message: result.truncated
                            ? \`${tool.label} partially listed (\${result.pagesFetched} pages, \${${arrayKey}.length} rows); more pages exist.\`
                            : result.pagesFetched > 1
                              ? \`${tool.label} listed successfully (\${result.pagesFetched} pages, \${${arrayKey}.length} rows).\`
                              : "${tool.label} listed successfully.",
                        ${ctxFields ? `${ctxFields}\n                        ` : ""}total_count: firstTotalCount ?? ${arrayKey}.length,
                        ${arrayKey},
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
                const response = await octokit.request("${tool.method}", {
                    ${[...reqArgs, "per_page: perPage", "page"].join(",\n                    ")}
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ${S}Success = {
                    success: true,
                    message: "${tool.label} listed successfully.",
                    ${ctxFields ? `${ctxFields}\n                    ` : ""}total_count: parsed.total_count,
                    ${arrayKey}: toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genCreateCodespace(tool) {
    const S = pascalFromTool(tool.name);
    const needsRepo = tool.scope !== "user";
    const pullZod = tool.pull_number ? ["pull_number: z.number().int().positive().describe(\"The pull request number.\")"] : [];
    const reqArgs = needsRepo
        ? ["owner: input.owner", "repo: input.name"]
        : [];
    if (tool.pull_number) reqArgs.push("pull_number: input.pull_number");
    reqArgs.push(spreadOptional(CREATE_BODY_FIELDS));

    const zodParams = needsRepo ? [zodOwner(), zodRepoName()] : [];
    zodParams.push(createBodyZodBlock(pullZod));

    return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ repo: needsRepo })}

${toPlainFn()}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            ${zodParams.join(",\n            ")}
        },
        async (input) => {
            ${needsRepo ? "const full_name = `${input.owner}/${input.name}`;" : ""}
            try {
                const response = await octokit.request("${tool.method}", {
                    ${reqArgs.join(",\n                    ")}
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: response.status === 202
                        ? "Codespace creation accepted; GitHub is retrying in the background."
                        : "Codespace created successfully.",
                    http_status: response.status,
                    ${needsRepo ? "owner: input.owner,\n                    repo: input.name,\n                    full_name," : ""}
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genCreateUserCodespace(tool) {
    const S = pascalFromTool(tool.name);
    return `${stdImports(`${S}Success`, `${S}Failure`)}

${toPlainFn()}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            repository_id: z.number().int().positive().optional().describe("Repository id. Required unless pull_request is set."),
            pull_request: z
                .object({
                    pull_request_number: z.number().int().positive(),
                    repository_id: z.number().int().positive()
                })
                .optional()
                .describe("Pull request context. Required unless repository_id is set."),
            ${createBodyZod()}
        },
        async (input) => {
            const hasRepo = input.repository_id !== undefined;
            const hasPr = input.pull_request !== undefined;
            if (hasRepo === hasPr) {
                const failurePayload: ${S}Failure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: "Provide exactly one of repository_id or pull_request.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            try {
                const response = await octokit.request("POST /user/codespaces", {
                    ...(hasRepo ? { repository_id: input.repository_id! } : { pull_request: input.pull_request! }),
                    ${spreadOptional(CREATE_BODY_FIELDS)}
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: response.status === 202
                        ? "Codespace creation accepted; GitHub is retrying in the background."
                        : "Codespace created successfully.",
                    http_status: response.status,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genGetQuery(tool) {
    const S = pascalFromTool(tool.name);
    const needsRepo = tool.scope === "repo";
    const queryArgs = (tool.query || []).map((q) =>
        q.required
            ? `${q.key}: input.${q.key}`
            : `...(input.${q.key} !== undefined ? { ${q.key}: input.${q.key} } : {})`
    );
    const zodQuery = (tool.query || []).map((q) => {
        const base = q.type === "number" ? "z.number().int().positive()" : "z.string()";
        return q.required ? `${q.key}: ${base}` : `${q.key}: ${base}.optional()`;
    });

    return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ repo: needsRepo })}

${toPlainFn()}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            ${needsRepo ? [zodOwner(), zodRepoName()].join(",\n            ") + ",\n            " : ""}${zodQuery.join(",\n            ")}
        },
        async (input) => {
            ${needsRepo ? "const full_name = `${input.owner}/${input.name}`;" : ""}
            try {
                const response = await octokit.request("${tool.method}", {
                    ${needsRepo ? "owner: input.owner,\n                    repo: input.name," : ""}
                    ${queryArgs.join(",\n                    ")}
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: "${tool.successMessage}",
                    http_status: response.status,
                    ${needsRepo ? "owner: input.owner,\n                    repo: input.name,\n                    full_name," : ""}
                    ${tool.responseField}: ${tool.responseKind === "boolean" ? "(response.data as { accepted?: boolean }).accepted === true" : "toPlain(response.data)"},
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genGetSingle(tool) {
    const S = pascalFromTool(tool.name);
    const pathParams = tool.pathParams || [{ key: "codespace_name", zod: zodCodespaceName() }];
    const reqArgs = pathParams.map((p) =>
        p.key === "export_id" ? "export_id: String(input.export_id)" : `${p.key}: input.${p.key}`
    );
    const zodParams = pathParams.map((p) => p.zod);

    return `${stdImports(`${S}Success`, `${S}Failure`)}

${toPlainFn()}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            ${zodParams.join(",\n            ")}
        },
        async (input) => {
            try {
                const response = await octokit.request("${tool.method}", {
                    ${reqArgs.join(",\n                    ")}
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: "${tool.successMessage}",
                    http_status: response.status,
                    ${pathParams.map((p) => `${p.key}: input.${p.key},`).join("\n                    ")}
                    ${tool.responseField}: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genUpdatePatch(tool) {
    const S = pascalFromTool(tool.name);
    const fields = tool.fields || [
        { key: "machine", zod: "z.string().optional()" },
        { key: "display_name", zod: "z.string().optional()" },
        { key: "recent_folders", zod: "z.array(z.string()).optional()" }
    ];
    return `${stdImports(`${S}Success`, `${S}Failure`)}

${toPlainFn()}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            codespace_name: z.string().min(1),
            ${fields.map((f) => `${f.key}: ${f.zod}`).join(",\n            ")}
        },
        async (input) => {
            try {
                const response = await octokit.request("${tool.method}", {
                    codespace_name: input.codespace_name,
                    ${fields.map((f) => `...(input.${f.key} !== undefined ? { ${f.key}: input.${f.key} } : {})`).join(",\n                    ")}
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: "${tool.successMessage}",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genDeleteAccepted(tool) {
    const S = pascalFromTool(tool.name);
    const pathParams = tool.pathParams || [{ key: "codespace_name", zod: "codespace_name: z.string().min(1)" }];
    return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: tool.scope === "orgUser", repo: false })}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            ${tool.scope === "orgUser" ? [zodOrg(), "username: z.string().min(1),", pathParams[0].zod].join("\n            ") : pathParams.map((p) => p.zod).join(",\n            ")}
        },
        async (input) => {
            try {
                const response = await octokit.request("${tool.method}", {
                    ${pathParams.map((p) => `${p.key}: input.${p.key}`).concat(tool.scope === "orgUser" ? ["org: input.org", "username: input.username"] : []).join(",\n                    ")}
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: "${tool.successMessage}",
                    http_status: response.status,
                    ${tool.scope === "orgUser" ? "org: input.org,\n                    username: input.username," : ""}
                    codespace_name: input.codespace_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genPostAction(tool) {
    const S = pascalFromTool(tool.name);
    const extraZod = tool.extraZod || [];
    const extraArgs = (tool.extraZod || []).map((k) => `...(input.${k} !== undefined ? { ${k}: input.${k} } : {})`);
    const isOrgUser = tool.scope === "orgUser";
    const zodBlock = isOrgUser
        ? `${zodOrg()},
            username: z.string().min(1),
            codespace_name: z.string().min(1)`
        : `codespace_name: z.string().min(1)${extraZod.length ? ",\n            " + extraZod.map((k) => `${k}: ${k === "private" ? "z.boolean().optional()" : "z.string().optional()"}`).join(",\n            ") : ""}`;
    const reqBlock = isOrgUser
        ? "org: input.org,\n                    username: input.username,\n                    codespace_name: input.codespace_name"
        : `codespace_name: input.codespace_name${extraArgs.length ? ",\n                    " + extraArgs.join(",\n                    ") : ""}`;
    const successCtx = isOrgUser
        ? "org: input.org,\n                    username: input.username,"
        : "codespace_name: input.codespace_name,";
    return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: isOrgUser })}

${tool.returnsObject ? toPlainFn() : ""}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            ${zodBlock}
        },
        async (input) => {
            try {
                const response = await octokit.request("${tool.method}", {
                    ${reqBlock}
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: "${tool.successMessage}",
                    http_status: response.status,
                    ${successCtx}
                    ${tool.returnsObject ? "codespace: toPlain(response.data)," : ""}
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genPostExport(tool) {
    const S = pascalFromTool(tool.name);
    return `${stdImports(`${S}Success`, `${S}Failure`)}

${toPlainFn()}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            codespace_name: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request("${tool.method}", {
                    codespace_name: input.codespace_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: "Codespace export started successfully.",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    export: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genListMachines(tool) {
    const S = pascalFromTool(tool.name);
    const isRepo = tool.scope === "repo";
    const queryFields = tool.query || [];
    return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ repo: isRepo })}

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            ${isRepo ? [zodOwner(), zodRepoName()].join(",\n            ") + ",\n            " : "codespace_name: z.string().min(1),\n            "}${queryFields.map((q) => `${q.key}: z.string().optional()`).join(",\n            ")}
        },
        async (input) => {
            ${isRepo ? "const full_name = `${input.owner}/${input.name}`;" : ""}
            try {
                const response = await octokit.request("${tool.method}", {
                    ${isRepo ? "owner: input.owner,\n                    repo: input.name," : "codespace_name: input.codespace_name,"}
                    ${queryFields.map((q) => `...(input.${q.key} !== undefined ? { ${q.key}: input.${q.key} } : {})`).join(",\n                    ")}
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = response.data as Record<string, unknown>;
                const machines = Array.isArray(data.machines) ? toPlain(data.machines) : [];
                const successPayload: ${S}Success = {
                    success: true,
                    message: "Codespace machines listed successfully.",
                    http_status: response.status,
                    ${isRepo ? "owner: input.owner,\n                    repo: input.name,\n                    full_name," : "codespace_name: input.codespace_name,"}
                    machines,
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genSetPut(tool) {
    const S = pascalFromTool(tool.name);
    return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: true })}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex),
            visibility: z.enum([${VISIBILITY_ENUM.map((v) => `"${v}"`).join(", ")}]),
            selected_usernames: z.array(z.string()).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request("${tool.method}", {
                    org: input.org,
                    visibility: input.visibility,
                    ...(input.selected_usernames !== undefined ? { selected_usernames: input.selected_usernames } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: "Organization codespaces access updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    visibility: input.visibility,
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genSelectedUsers(tool, method) {
    const S = pascalFromTool(tool.name);
    return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: true })}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description}",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex),
            selected_usernames: z.array(z.string().min(1)).describe("GitHub usernames to add or remove.")
        },
        async (input) => {
            try {
                const response = await octokit.request("${method}", {
                    org: input.org,
                    selected_usernames: input.selected_usernames
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${S}Success = {
                    success: true,
                    message: "${tool.successMessage}",
                    http_status: response.status,
                    org: input.org,
                    selected_usernames: input.selected_usernames,
                    request_id: requestId
                };
                return textAndData(successPayload);
${failureHandler(`${S}Failure`)}
        }
    );
}
`;
}

function genOrgSecretTool(tool) {
    const S = pascalFromTool(tool.name);
    const base = "/orgs/{org}/codespaces/secrets";
    const templates = {
        list: () => genListPaginated({ ...tool, method: `GET ${base}`, arrayKey: "secrets", scope: "org", label: "Organization codespaces secrets" }, {}),
        getPublicKey: () => `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: true })}

${toPlainFn()}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOrg()} }, async (input) => {
        try {
            const response = await octokit.request("GET ${base}/public-key", { org: input.org });
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            return textAndData({ success: true, message: "Organization codespaces public key retrieved successfully.", http_status: response.status, org: input.org, public_key: toPlain(response.data), request_id: requestId } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`,
        getSecret: () => `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: true, secret: true })}

${toPlainFn()}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOrg()}, ${zodSecretName()} }, async (input) => {
        try {
            const response = await octokit.request("GET ${base}/{secret_name}", { org: input.org, secret_name: input.secret_name });
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            return textAndData({ success: true, message: "Organization codespaces secret metadata retrieved successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, secret: toPlain(response.data), request_id: requestId } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`,
        createOrUpdate: () => `${stdImports(`${S}Success`, `${S}Failure`, ["encryptSecretValue"])}
${regexConsts({ org: true, secret: true })}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", {
        ${zodOrg()}, ${zodSecretName()},
        value: z.string().describe("The plaintext secret value to encrypt and store."),
        visibility: z.enum([${SECRET_VISIBILITY_ENUM.map((v) => `"${v}"`).join(", ")}]),
        selected_repository_ids: z.array(z.number().int().positive()).optional()
    }, async (input) => {
        try {
            const keyResponse = await octokit.request("GET ${base}/public-key", { org: input.org });
            const key = keyResponse.data as { key_id: string; key: string };
            const encryptedValue = await encryptSecretValue(input.value, key.key);
            const response = await octokit.request("PUT ${base}/{secret_name}", {
                org: input.org, secret_name: input.secret_name, encrypted_value: encryptedValue, key_id: key.key_id,
                visibility: input.visibility,
                ...(input.selected_repository_ids !== undefined ? { selected_repository_ids: input.selected_repository_ids } : {})
            });
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            const created = response.status === 201;
            return textAndData({ success: true, message: created ? "Organization codespaces secret created successfully." : "Organization codespaces secret updated successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, created, request_id: requestId } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`,
        deleteSecret: () => `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: true, secret: true })}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOrg()}, ${zodSecretName()} }, async (input) => {
        try {
            const response = await octokit.request("DELETE ${base}/{secret_name}", { org: input.org, secret_name: input.secret_name });
            return textAndData({ success: true, message: "Organization codespaces secret deleted successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`,
        listSelected: () => genListPaginated({ ...tool, method: `GET ${base}/{secret_name}/repositories`, arrayKey: "repositories", scope: "orgSecret", label: "Selected repositories" }, {}),
        setSelected: () => `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: true, secret: true })}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOrg()}, ${zodSecretName()}, selected_repository_ids: z.array(z.number().int().positive()) }, async (input) => {
        try {
            const response = await octokit.request("PUT ${base}/{secret_name}/repositories", { org: input.org, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids });
            return textAndData({ success: true, message: "Selected repositories set successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`,
        addSelected: () => `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: true, secret: true })}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOrg()}, ${zodSecretName()}, repository_id: z.number().int().positive() }, async (input) => {
        try {
            const response = await octokit.request("PUT ${base}/{secret_name}/repositories/{repository_id}", { org: input.org, secret_name: input.secret_name, repository_id: input.repository_id });
            return textAndData({ success: true, message: "Repository added to organization codespaces secret successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`,
        removeSelected: () => `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ org: true, secret: true })}

export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOrg()}, ${zodSecretName()}, repository_id: z.number().int().positive() }, async (input) => {
        try {
            const response = await octokit.request("DELETE ${base}/{secret_name}/repositories/{repository_id}", { org: input.org, secret_name: input.secret_name, repository_id: input.repository_id });
            return textAndData({ success: true, message: "Repository removed from organization codespaces secret successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`
    };
    if (tool.orgSecretKind === "listSelected") {
        return `${stdImports(`${S}Success`, `${S}Failure`, ["fetchAllPageLinkPages"])}
${regexConsts({ org: true, secret: true })}
const DEFAULT_PER_PAGE = 100 as const;
function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "repositories" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.repositories) ? o.repositories : [];
        return { total_count: typeof o.total_count === "number" ? o.total_count : rows.length, rows };
    }
    return { total_count: 0, rows: [] };
}
function toPlain(rows: unknown[]): Record<string, unknown>[] { return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>); }
export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOrg()}, ${zodSecretName()}, ${zodPagination()} }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        try {
            if (input.all_pages === true) {
                const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                let firstTotalCount: number | undefined;
                const result = await fetchAllPageLinkPages({ perPage, maxPages, fetchPage: async (page, pp) => {
                    const response = await octokit.request("GET ${base}/{secret_name}/repositories", { org: input.org, secret_name: input.secret_name, per_page: pp, page });
                    const parsed = parseBody(response.data);
                    if (firstTotalCount === undefined) firstTotalCount = parsed.total_count;
                    return { rows: parsed.rows, linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }), requestId: getRequestId(response.headers["x-github-request-id"]) };
                }});
                const repositories = toPlain(result.rows);
                return textAndData({ success: true, message: "Selected repositories listed successfully.", org: input.org, secret_name: input.secret_name, total_count: firstTotalCount ?? repositories.length, repositories, pagination: result.responsePagination, request_id: result.lastRequestId, page: result.lastPage, per_page: perPage, pages_fetched: result.pagesFetched, truncated: result.truncated || undefined } satisfies ${S}Success);
            }
            const page = input.page ?? 1;
            const response = await octokit.request("GET ${base}/{secret_name}/repositories", { org: input.org, secret_name: input.secret_name, per_page: perPage, page });
            const parsed = parseBody(response.data);
            return textAndData({ success: true, message: "Selected repositories listed successfully.", org: input.org, secret_name: input.secret_name, total_count: parsed.total_count, repositories: toPlain(parsed.rows), pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage, pages_fetched: 1 } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`;
    }
    return templates[tool.orgSecretKind]();
}

function genRepoSecretTool(tool) {
    const S = pascalFromTool(tool.name);
    const base = "GET /repos/{owner}/{repo}/codespaces/secrets";
    if (tool.repoSecretKind === "list") return genListPaginated({ ...tool, method: "GET /repos/{owner}/{repo}/codespaces/secrets", arrayKey: "secrets", scope: "repo", label: "Repository codespaces secrets" }, {});
    if (tool.repoSecretKind === "getPublicKey") {
        return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ repo: true })}
${toPlainFn()}
export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOwner()}, ${zodRepoName()} }, async (input) => {
        const full_name = \`\${input.owner}/\${input.name}\`;
        try {
            const response = await octokit.request("GET /repos/{owner}/{repo}/codespaces/secrets/public-key", { owner: input.owner, repo: input.name });
            return textAndData({ success: true, message: "Repository codespaces public key retrieved successfully.", http_status: response.status, owner: input.owner, repo: input.name, full_name, public_key: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`;
    }
    if (tool.repoSecretKind === "getSecret") {
        return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ repo: true, secret: true })}
${toPlainFn()}
export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOwner()}, ${zodRepoName()}, ${zodSecretName()} }, async (input) => {
        const full_name = \`\${input.owner}/\${input.name}\`;
        try {
            const response = await octokit.request("GET /repos/{owner}/{repo}/codespaces/secrets/{secret_name}", { owner: input.owner, repo: input.name, secret_name: input.secret_name });
            return textAndData({ success: true, message: "Repository codespaces secret metadata retrieved successfully.", http_status: response.status, owner: input.owner, repo: input.name, full_name, secret_name: input.secret_name, secret: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`;
    }
    if (tool.repoSecretKind === "createOrUpdate") {
        return `${stdImports(`${S}Success`, `${S}Failure`, ["encryptSecretValue"])}
${regexConsts({ repo: true, secret: true })}
export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOwner()}, ${zodRepoName()}, ${zodSecretName()}, value: z.string() }, async (input) => {
        const full_name = \`\${input.owner}/\${input.name}\`;
        try {
            const keyResponse = await octokit.request("GET /repos/{owner}/{repo}/codespaces/secrets/public-key", { owner: input.owner, repo: input.name });
            const key = keyResponse.data as { key_id: string; key: string };
            const encryptedValue = await encryptSecretValue(input.value, key.key);
            const response = await octokit.request("PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}", { owner: input.owner, repo: input.name, secret_name: input.secret_name, encrypted_value: encryptedValue, key_id: key.key_id });
            const created = response.status === 201;
            return textAndData({ success: true, message: created ? "Repository codespaces secret created successfully." : "Repository codespaces secret updated successfully.", http_status: response.status, owner: input.owner, repo: input.name, full_name, secret_name: input.secret_name, created, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`;
    }
    return `${stdImports(`${S}Success`, `${S}Failure`)}
${regexConsts({ repo: true, secret: true })}
export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool("${tool.name}", "${tool.description}", { ${zodOwner()}, ${zodRepoName()}, ${zodSecretName()} }, async (input) => {
        const full_name = \`\${input.owner}/\${input.name}\`;
        try {
            const response = await octokit.request("DELETE /repos/{owner}/{repo}/codespaces/secrets/{secret_name}", { owner: input.owner, repo: input.name, secret_name: input.secret_name });
            return textAndData({ success: true, message: "Repository codespaces secret deleted successfully.", http_status: response.status, owner: input.owner, repo: input.name, full_name, secret_name: input.secret_name, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);
        }
    });
}`;
}

function genUserSecretTool(tool) {
    const S = pascalFromTool(tool.name);
    const base = "/user/codespaces/secrets";
    if (tool.userSecretKind === "list") return genListPaginated({ ...tool, method: "GET /user/codespaces/secrets", arrayKey: "secrets", scope: "user", label: "User codespaces secrets" }, {});
    if (tool.userSecretKind === "listSelected") {
        return genOrgSecretTool({ ...tool, orgSecretKind: "listSelected", description: tool.description }).replaceAll("/orgs/{org}/codespaces/secrets", base).replaceAll("input.org", "").replaceAll("org: input.org,", "").replaceAll("org: z", "secret_name: z").replaceAll("Organization", "User");
    }
    // Handled below in generateToolSource switch
    return "";
}

function generateToolSource(tool) {
    switch (tool.template) {
        case "listPaginated":
            return genListPaginated(tool);
        case "createCodespace":
            return genCreateCodespace(tool);
        case "createUserCodespace":
            return genCreateUserCodespace(tool);
        case "getQuery":
            return genGetQuery(tool);
        case "getSingle":
            return genGetSingle(tool);
        case "updatePatch":
            return genUpdatePatch(tool);
        case "deleteAccepted":
            return genDeleteAccepted(tool);
        case "postAction":
            return genPostAction(tool);
        case "postExport":
            return genPostExport(tool);
        case "listMachines":
            return genListMachines(tool);
        case "setPut":
            return genSetPut(tool);
        case "selectedUsersPost":
            return genSelectedUsers(tool, tool.method);
        case "selectedUsersDelete":
            return genSelectedUsers(tool, tool.method);
        case "orgSecret":
            return genOrgSecretTool(tool);
        case "repoSecret":
            return genRepoSecretTool(tool);
        case "userSecret":
            return genUserSecretTool(tool) || genUserSecretFull(tool);
        default:
            throw new Error(`Unknown template: ${tool.template}`);
    }
}

function genUserSecretFull(tool) {
    const S = pascalFromTool(tool.name);
    const base = "/user/codespaces/secrets";
    const kinds = {
        getPublicKey: () => `${stdImports(`${S}Success`, `${S}Failure`)}\n${toPlainFn()}\nexport function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {\n    server.tool("${tool.name}", "${tool.description}", {}, async () => {\n        try {\n            const response = await octokit.request("GET ${base}/public-key");\n            return textAndData({ success: true, message: "User codespaces public key retrieved successfully.", http_status: response.status, public_key: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);\n        } catch (error: unknown) {\n            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);\n        }\n    });\n}`,
        getSecret: () => `${stdImports(`${S}Success`, `${S}Failure`)}\n${regexConsts({ secret: true })}\n${toPlainFn()}\nexport function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {\n    server.tool("${tool.name}", "${tool.description}", { ${zodSecretName()} }, async (input) => {\n        try {\n            const response = await octokit.request("GET ${base}/{secret_name}", { secret_name: input.secret_name });\n            return textAndData({ success: true, message: "User codespaces secret metadata retrieved successfully.", http_status: response.status, secret_name: input.secret_name, secret: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);\n        } catch (error: unknown) {\n            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);\n        }\n    });\n}`,
        createOrUpdate: () => `${stdImports(`${S}Success`, `${S}Failure`, ["encryptSecretValue"])}\n${regexConsts({ secret: true })}\nexport function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {\n    server.tool("${tool.name}", "${tool.description}", { ${zodSecretName()}, value: z.string(), selected_repository_ids: z.array(z.number().int().positive()).optional() }, async (input) => {\n        try {\n            const keyResponse = await octokit.request("GET ${base}/public-key");\n            const key = keyResponse.data as { key_id: string; key: string };\n            const encryptedValue = await encryptSecretValue(input.value, key.key);\n            const response = await octokit.request("PUT ${base}/{secret_name}", { secret_name: input.secret_name, encrypted_value: encryptedValue, key_id: key.key_id, ...(input.selected_repository_ids !== undefined ? { selected_repository_ids: input.selected_repository_ids } : {}) });\n            const created = response.status === 201;\n            return textAndData({ success: true, message: created ? "User codespaces secret created successfully." : "User codespaces secret updated successfully.", http_status: response.status, secret_name: input.secret_name, created, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);\n        } catch (error: unknown) {\n            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);\n        }\n    });\n}`,
        deleteSecret: () => `${stdImports(`${S}Success`, `${S}Failure`)}\n${regexConsts({ secret: true })}\nexport function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {\n    server.tool("${tool.name}", "${tool.description}", { ${zodSecretName()} }, async (input) => {\n        try {\n            const response = await octokit.request("DELETE ${base}/{secret_name}", { secret_name: input.secret_name });\n            return textAndData({ success: true, message: "User codespaces secret deleted successfully.", http_status: response.status, secret_name: input.secret_name, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);\n        } catch (error: unknown) {\n            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);\n        }\n    });\n}`,
        listRepos: () => `${stdImports(`${S}Success`, `${S}Failure`, ["fetchAllPageLinkPages"])}\n${regexConsts({ secret: true })}\nconst DEFAULT_PER_PAGE = 100 as const;\nfunction parseBody(data: unknown): { total_count: number; rows: unknown[] } {\n    if (data && typeof data === "object" && "repositories" in data) {\n        const o = data as Record<string, unknown>;\n        const rows = Array.isArray(o.repositories) ? o.repositories : [];\n        return { total_count: typeof o.total_count === "number" ? o.total_count : rows.length, rows };\n    }\n    return { total_count: 0, rows: [] };\n}\nfunction toPlain(rows: unknown[]): Record<string, unknown>[] { return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>); }\nexport function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {\n    server.tool("${tool.name}", "${tool.description}", { ${zodSecretName()}, ${zodPagination()} }, async (input) => {\n        const perPage = input.per_page ?? DEFAULT_PER_PAGE;\n        try {\n            if (input.all_pages === true) {\n                const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;\n                let firstTotalCount: number | undefined;\n                const result = await fetchAllPageLinkPages({ perPage, maxPages, fetchPage: async (page, pp) => {\n                    const response = await octokit.request("GET ${base}/{secret_name}/repositories", { secret_name: input.secret_name, per_page: pp, page });\n                    const parsed = parseBody(response.data);\n                    if (firstTotalCount === undefined) firstTotalCount = parsed.total_count;\n                    return { rows: parsed.rows, linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }), requestId: getRequestId(response.headers["x-github-request-id"]) };\n                }});\n                const repositories = toPlain(result.rows);\n                return textAndData({ success: true, message: "Repositories listed successfully.", secret_name: input.secret_name, total_count: firstTotalCount ?? repositories.length, repositories, pagination: result.responsePagination, request_id: result.lastRequestId, page: result.lastPage, per_page: perPage, pages_fetched: result.pagesFetched, truncated: result.truncated || undefined } satisfies ${S}Success);\n            }\n            const page = input.page ?? 1;\n            const response = await octokit.request("GET ${base}/{secret_name}/repositories", { secret_name: input.secret_name, per_page: perPage, page });\n            const parsed = parseBody(response.data);\n            return textAndData({ success: true, message: "Repositories listed successfully.", secret_name: input.secret_name, total_count: parsed.total_count, repositories: toPlain(parsed.rows), pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage, pages_fetched: 1 } satisfies ${S}Success);\n        } catch (error: unknown) {\n            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);\n        }\n    });\n}`,
        setRepos: () => `${stdImports(`${S}Success`, `${S}Failure`)}\n${regexConsts({ secret: true })}\nexport function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {\n    server.tool("${tool.name}", "${tool.description}", { ${zodSecretName()}, selected_repository_ids: z.array(z.number().int().positive()) }, async (input) => {\n        try {\n            const response = await octokit.request("PUT ${base}/{secret_name}/repositories", { secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids });\n            return textAndData({ success: true, message: "Repositories set successfully.", http_status: response.status, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);\n        } catch (error: unknown) {\n            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);\n        }\n    });\n}`,
        addRepo: () => `${stdImports(`${S}Success`, `${S}Failure`)}\n${regexConsts({ secret: true })}\nexport function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {\n    server.tool("${tool.name}", "${tool.description}", { ${zodSecretName()}, repository_id: z.number().int().positive() }, async (input) => {\n        try {\n            const response = await octokit.request("PUT ${base}/{secret_name}/repositories/{repository_id}", { secret_name: input.secret_name, repository_id: input.repository_id });\n            return textAndData({ success: true, message: "Repository added to user codespaces secret successfully.", http_status: response.status, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);\n        } catch (error: unknown) {\n            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);\n        }\n    });\n}`,
        removeRepo: () => `${stdImports(`${S}Success`, `${S}Failure`)}\n${regexConsts({ secret: true })}\nexport function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {\n    server.tool("${tool.name}", "${tool.description}", { ${zodSecretName()}, repository_id: z.number().int().positive() }, async (input) => {\n        try {\n            const response = await octokit.request("DELETE ${base}/{secret_name}/repositories/{repository_id}", { secret_name: input.secret_name, repository_id: input.repository_id });\n            return textAndData({ success: true, message: "Repository removed from user codespaces secret successfully.", http_status: response.status, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies ${S}Success);\n        } catch (error: unknown) {\n            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ${S}Failure);\n        }\n    });\n}`
    };
    if (tool.userSecretKind === "list") return genListPaginated({ ...tool, method: "GET /user/codespaces/secrets", arrayKey: "secrets", scope: "user", label: "User codespaces secrets" });
    return kinds[tool.userSecretKind]();
}

const DOC = "https://docs.github.com/en/rest/codespaces";
const CS = `${DOC}/codespaces?apiVersion=2026-03-10`;
const ORG = `${DOC}/organizations?apiVersion=2026-03-10`;
const ORG_SEC = `${DOC}/organization-secrets?apiVersion=2026-03-10`;
const REPO_SEC = `${DOC}/repository-secrets?apiVersion=2026-03-10`;
const USER_SEC = `${DOC}/secrets?apiVersion=2026-03-10`;

const SECTIONS = {
    1: {
        subdir: "codespaces/codespaces",
        readmeTitle: "Codespaces",
        readmeLink: "Codespaces",
        docsUrl: CS,
        intro: "Tools for [GitHub Codespaces](https://docs.github.com/en/codespaces) at the repository and user level.",
        tools: [
            { name: "github_list_repo_codespaces", template: "listPaginated", method: "GET /repos/{owner}/{repo}/codespaces", arrayKey: "codespaces", scope: "repo", label: "Repository codespaces", description: "List codespaces in a repository for the authenticated user (GET /repos/{owner}/{repo}/codespaces). Returns total_count and codespaces. Classic tokens need the codespace scope. See GitHub REST Codespaces." },
            { name: "github_create_repo_codespace", template: "createCodespace", method: "POST /repos/{owner}/{repo}/codespaces", scope: "repo", description: "Create a codespace in a repository (POST /repos/{owner}/{repo}/codespaces). Optional ref, location, geo, machine, devcontainer_path, and other create fields. Returns HTTP 201 or 202. See GitHub REST Codespaces." },
            { name: "github_list_repo_codespace_devcontainers", template: "listPaginated", method: "GET /repos/{owner}/{repo}/codespaces/devcontainers", arrayKey: "devcontainers", scope: "repo", label: "Repository devcontainer configurations", description: "List devcontainer configurations in a repository (GET /repos/{owner}/{repo}/codespaces/devcontainers). Returns total_count and devcontainers. See GitHub REST Codespaces." },
            { name: "github_get_repo_codespace_defaults", template: "getQuery", method: "GET /repos/{owner}/{repo}/codespaces/new", scope: "repo", query: [{ key: "ref", type: "string" }, { key: "client_ip", type: "string" }], responseField: "defaults", responseKind: "object", successMessage: "Repository codespace defaults retrieved successfully.", description: "Get default properties for a new codespace in a repository (GET /repos/{owner}/{repo}/codespaces/new). Optional ref and client_ip query params. See GitHub REST Codespaces." },
            { name: "github_check_repo_codespace_permissions", template: "getQuery", method: "GET /repos/{owner}/{repo}/codespaces/permissions_check", scope: "repo", query: [{ key: "ref", type: "string", required: true }, { key: "devcontainer_path", type: "string", required: true }], responseField: "accepted", responseKind: "boolean", successMessage: "Repository codespace permissions checked successfully.", description: "Check whether devcontainer permissions are accepted (GET /repos/{owner}/{repo}/codespaces/permissions_check). Requires ref and devcontainer_path. Returns accepted boolean. See GitHub REST Codespaces." },
            { name: "github_create_pull_request_codespace", template: "createCodespace", method: "POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces", scope: "repo", pull_number: true, description: "Create a codespace from a pull request (POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces). Same optional create body fields as create_repo_codespace. See GitHub REST Codespaces." },
            { name: "github_list_user_codespaces", template: "listPaginated", method: "GET /user/codespaces", arrayKey: "codespaces", scope: "user", filterQuery: "repository_id", label: "User codespaces", description: "List codespaces for the authenticated user (GET /user/codespaces). Optional repository_id filter. See GitHub REST Codespaces." },
            { name: "github_create_user_codespace", template: "createUserCodespace", method: "POST /user/codespaces", description: "Create a codespace for the authenticated user (POST /user/codespaces). Provide repository_id OR pull_request (not both). See GitHub REST Codespaces." },
            { name: "github_get_user_codespace", template: "getSingle", method: "GET /user/codespaces/{codespace_name}", responseField: "codespace", successMessage: "Codespace retrieved successfully.", description: "Get a codespace for the authenticated user (GET /user/codespaces/{codespace_name}). See GitHub REST Codespaces." },
            { name: "github_update_user_codespace", template: "updatePatch", method: "PATCH /user/codespaces/{codespace_name}", successMessage: "Codespace updated successfully.", description: "Update a codespace for the authenticated user (PATCH /user/codespaces/{codespace_name}). Optional machine, display_name, recent_folders. See GitHub REST Codespaces." },
            { name: "github_delete_user_codespace", template: "deleteAccepted", method: "DELETE /user/codespaces/{codespace_name}", successMessage: "Codespace deletion accepted.", description: "Delete a codespace for the authenticated user (DELETE /user/codespaces/{codespace_name}). Returns HTTP 202. See GitHub REST Codespaces." },
            { name: "github_export_user_codespace", template: "postExport", method: "POST /user/codespaces/{codespace_name}/exports", description: "Export a codespace for the authenticated user (POST /user/codespaces/{codespace_name}/exports). Returns HTTP 202 with export object. See GitHub REST Codespaces." },
            { name: "github_get_user_codespace_export", template: "getSingle", method: "GET /user/codespaces/{codespace_name}/exports/{export_id}", pathParams: [{ key: "codespace_name", zod: zodCodespaceName() }, { key: "export_id", zod: 'export_id: z.number().int().positive().describe("The export id.")' }], responseField: "export", successMessage: "Codespace export retrieved successfully.", description: "Get details about a codespace export (GET /user/codespaces/{codespace_name}/exports/{export_id}). See GitHub REST Codespaces." },
            { name: "github_publish_user_codespace", template: "postAction", method: "POST /user/codespaces/{codespace_name}/publish", extraZod: ["name", "private"], returnsObject: true, successMessage: "Codespace published successfully.", description: "Publish a codespace to a repository (POST /user/codespaces/{codespace_name}/publish). Optional name and private. See GitHub REST Codespaces." },
            { name: "github_start_user_codespace", template: "postAction", method: "POST /user/codespaces/{codespace_name}/start", returnsObject: true, successMessage: "Codespace started successfully.", description: "Start a codespace (POST /user/codespaces/{codespace_name}/start). See GitHub REST Codespaces." },
            { name: "github_stop_user_codespace", template: "postAction", method: "POST /user/codespaces/{codespace_name}/stop", returnsObject: true, successMessage: "Codespace stopped successfully.", description: "Stop a codespace (POST /user/codespaces/{codespace_name}/stop). See GitHub REST Codespaces." }
        ]
    },
    2: {
        subdir: "codespaces/organizations",
        readmeTitle: "Organizations",
        readmeLink: "Organizations",
        docsUrl: ORG,
        intro: "Tools for managing organization-level GitHub Codespaces access and member codespaces.",
        tools: [
            { name: "github_list_org_codespaces", template: "listPaginated", method: "GET /orgs/{org}/codespaces", arrayKey: "codespaces", scope: "org", label: "Organization codespaces", description: "List codespaces for an organization (GET /orgs/{org}/codespaces). See GitHub REST Codespaces organizations." },
            { name: "github_set_org_codespaces_access", template: "setPut", method: "PUT /orgs/{org}/codespaces/access", description: "Manage codespaces access for organization members (PUT /orgs/{org}/codespaces/access). visibility required. See GitHub REST Codespaces organizations." },
            { name: "github_add_org_codespaces_access_users", template: "selectedUsersPost", method: "POST /orgs/{org}/codespaces/access/selected_users", successMessage: "Users added to organization codespaces access successfully.", description: "Add users to selected codespaces access (POST /orgs/{org}/codespaces/access/selected_users). selected_usernames required. See GitHub REST Codespaces organizations." },
            { name: "github_remove_org_codespaces_access_users", template: "selectedUsersDelete", method: "DELETE /orgs/{org}/codespaces/access/selected_users", successMessage: "Users removed from organization codespaces access successfully.", description: "Remove users from selected codespaces access (DELETE /orgs/{org}/codespaces/access/selected_users). selected_usernames required in body. See GitHub REST Codespaces organizations." },
            { name: "github_list_org_user_codespaces", template: "listPaginated", method: "GET /orgs/{org}/members/{username}/codespaces", arrayKey: "codespaces", scope: "orgUser", label: "Organization member codespaces", description: "List codespaces for an organization member (GET /orgs/{org}/members/{username}/codespaces). See GitHub REST Codespaces organizations." },
            { name: "github_delete_org_user_codespace", template: "deleteAccepted", method: "DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}", scope: "orgUser", successMessage: "Organization member codespace deletion accepted.", description: "Delete an organization member codespace (DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}). Returns HTTP 202. See GitHub REST Codespaces organizations." },
            { name: "github_stop_org_user_codespace", template: "postAction", method: "POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop", scope: "orgUser", returnsObject: true, successMessage: "Organization member codespace stopped successfully.", description: "Stop an organization member codespace (POST .../stop). Returns HTTP 200 with codespace. See GitHub REST Codespaces organizations." }
        ]
    },
    3: {
        subdir: "codespaces/organization-secrets",
        readmeTitle: "Organization secrets",
        readmeLink: "Organization secrets",
        docsUrl: ORG_SEC,
        intro: "Tools for organization GitHub Codespaces secrets. create_or_update accepts plaintext value and encrypts it automatically.",
        tools: [
            { name: "github_list_org_codespaces_secrets", template: "orgSecret", orgSecretKind: "list", description: "List organization codespaces secrets (GET /orgs/{org}/codespaces/secrets). See GitHub REST organization secrets." },
            { name: "github_get_org_codespaces_public_key", template: "orgSecret", orgSecretKind: "getPublicKey", description: "Get organization codespaces public key (GET /orgs/{org}/codespaces/secrets/public-key). See GitHub REST organization secrets." },
            { name: "github_get_org_codespaces_secret", template: "orgSecret", orgSecretKind: "getSecret", description: "Get organization codespaces secret metadata (GET /orgs/{org}/codespaces/secrets/{secret_name}). See GitHub REST organization secrets." },
            { name: "github_create_or_update_org_codespaces_secret", template: "orgSecret", orgSecretKind: "createOrUpdate", description: "Create or update organization codespaces secret (PUT /orgs/{org}/codespaces/secrets/{secret_name}). Plaintext value, visibility all|private|selected. See GitHub REST organization secrets." },
            { name: "github_delete_org_codespaces_secret", template: "orgSecret", orgSecretKind: "deleteSecret", description: "Delete organization codespaces secret (DELETE /orgs/{org}/codespaces/secrets/{secret_name}). See GitHub REST organization secrets." },
            { name: "github_list_selected_repos_for_org_codespaces_secret", template: "orgSecret", orgSecretKind: "listSelected", description: "List selected repositories for organization codespaces secret. See GitHub REST organization secrets." },
            { name: "github_set_selected_repos_for_org_codespaces_secret", template: "orgSecret", orgSecretKind: "setSelected", description: "Set selected repositories for organization codespaces secret. See GitHub REST organization secrets." },
            { name: "github_add_selected_repo_to_org_codespaces_secret", template: "orgSecret", orgSecretKind: "addSelected", description: "Add repository to organization codespaces secret. See GitHub REST organization secrets." },
            { name: "github_remove_selected_repo_from_org_codespaces_secret", template: "orgSecret", orgSecretKind: "removeSelected", description: "Remove repository from organization codespaces secret. See GitHub REST organization secrets." }
        ]
    },
    4: {
        subdir: "codespaces/machines",
        readmeTitle: "Machines",
        readmeLink: "Machines",
        docsUrl: CS,
        intro: "Tools for listing available machine types for GitHub Codespaces.",
        tools: [
            { name: "github_list_repo_codespace_machines", template: "listMachines", method: "GET /repos/{owner}/{repo}/codespaces/machines", scope: "repo", query: [{ key: "location" }, { key: "client_ip" }, { key: "ref" }], description: "List machine types for a repository codespace (GET /repos/{owner}/{repo}/codespaces/machines). Optional location, client_ip, ref. See GitHub REST Codespaces." },
            { name: "github_list_user_codespace_machines", template: "listMachines", method: "GET /user/codespaces/{codespace_name}/machines", scope: "user", description: "List machine types for a user codespace (GET /user/codespaces/{codespace_name}/machines). See GitHub REST Codespaces." }
        ]
    },
    5: {
        subdir: "codespaces/repository-secrets",
        readmeTitle: "Repository secrets",
        readmeLink: "Repository secrets",
        docsUrl: REPO_SEC,
        intro: "Tools for repository GitHub Codespaces secrets.",
        tools: [
            { name: "github_list_repo_codespaces_secrets", template: "repoSecret", repoSecretKind: "list", description: "List repository codespaces secrets. See GitHub REST repository secrets." },
            { name: "github_get_repo_codespaces_public_key", template: "repoSecret", repoSecretKind: "getPublicKey", description: "Get repository codespaces public key. See GitHub REST repository secrets." },
            { name: "github_get_repo_codespaces_secret", template: "repoSecret", repoSecretKind: "getSecret", description: "Get repository codespaces secret metadata. See GitHub REST repository secrets." },
            { name: "github_create_or_update_repo_codespaces_secret", template: "repoSecret", repoSecretKind: "createOrUpdate", description: "Create or update repository codespaces secret with encrypted value. See GitHub REST repository secrets." },
            { name: "github_delete_repo_codespaces_secret", template: "repoSecret", repoSecretKind: "deleteSecret", description: "Delete repository codespaces secret. See GitHub REST repository secrets." }
        ]
    },
    6: {
        subdir: "codespaces/secrets",
        readmeTitle: "User secrets",
        readmeLink: "User secrets",
        docsUrl: USER_SEC,
        intro: "Tools for user GitHub Codespaces secrets.",
        tools: [
            { name: "github_list_user_codespaces_secrets", template: "userSecret", userSecretKind: "list", description: "List user codespaces secrets. See GitHub REST secrets." },
            { name: "github_get_user_codespaces_public_key", template: "userSecret", userSecretKind: "getPublicKey", description: "Get user codespaces public key. See GitHub REST secrets." },
            { name: "github_get_user_codespaces_secret", template: "userSecret", userSecretKind: "getSecret", description: "Get user codespaces secret metadata. See GitHub REST secrets." },
            { name: "github_create_or_update_user_codespaces_secret", template: "userSecret", userSecretKind: "createOrUpdate", description: "Create or update user codespaces secret with optional selected_repository_ids. See GitHub REST secrets." },
            { name: "github_delete_user_codespaces_secret", template: "userSecret", userSecretKind: "deleteSecret", description: "Delete user codespaces secret. See GitHub REST secrets." },
            { name: "github_list_repos_for_user_codespaces_secret", template: "userSecret", userSecretKind: "listRepos", description: "List repositories for user codespaces secret. See GitHub REST secrets." },
            { name: "github_set_repos_for_user_codespaces_secret", template: "userSecret", userSecretKind: "setRepos", description: "Set repositories for user codespaces secret. See GitHub REST secrets." },
            { name: "github_add_repo_to_user_codespaces_secret", template: "userSecret", userSecretKind: "addRepo", description: "Add repository to user codespaces secret. See GitHub REST secrets." },
            { name: "github_remove_repo_from_user_codespaces_secret", template: "userSecret", userSecretKind: "removeRepo", description: "Remove repository from user codespaces secret. See GitHub REST secrets." }
        ]
    }
};

function genTypes(tool) {
    const S = pascalFromTool(tool.name);
    const lines = [`/** MCP tool: \`${tool.name}\`. */`];
    const fail = `export type ${S}Failure = CreateRepoFailure;`;

    if (tool.template === "listPaginated") {
        const ctx = tool.scope === "repo"
            ? "owner: string;\n    repo: string;\n    full_name: string;"
            : tool.scope === "org"
              ? "org: string;"
              : tool.scope === "orgUser"
                ? "org: string;\n    username: string;"
                : tool.filterQuery
                  ? ""
                  : "";
        lines.push(`export type ${S}Success = {
    success: true;
    message: string;
    ${ctx ? ctx + "\n    " : ""}total_count: number;
    ${tool.arrayKey}: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};`);
    } else if (tool.template === "createCodespace" || tool.template === "createUserCodespace") {
        lines.push(`export type ${S}Success = {
    success: true;
    message: string;
    http_status: number;
    ${tool.scope === "repo" ? "owner: string;\n    repo: string;\n    full_name: string;\n    " : ""}codespace: Record<string, unknown>;
    request_id: string | null;
};`);
    } else if (tool.template === "getQuery") {
        const fieldType = tool.responseKind === "boolean" ? "boolean" : "Record<string, unknown>";
        lines.push(`export type ${S}Success = {
    success: true;
    message: string;
    http_status: number;
    ${tool.scope === "repo" ? "owner: string;\n    repo: string;\n    full_name: string;\n    " : ""}${tool.responseField}: ${fieldType};
    request_id: string | null;
};`);
    } else if (tool.template === "getSingle") {
        lines.push(`export type ${S}Success = {
    success: true;
    message: string;
    http_status: number;
    ${(tool.pathParams || [{ key: "codespace_name" }]).map((p) => `${p.key}: ${p.key === "export_id" ? "number" : "string"};`).join("\n    ")}
    ${tool.responseField}: Record<string, unknown>;
    request_id: string | null;
};`);
    } else if (tool.template === "updatePatch") {
        lines.push(`export type ${S}Success = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    codespace: Record<string, unknown>;
    request_id: string | null;
};`);
    } else if (tool.template === "deleteAccepted") {
        lines.push(`export type ${S}Success = {
    success: true;
    message: string;
    http_status: number;
    ${tool.scope === "orgUser" ? "org: string;\n    username: string;\n    " : ""}codespace_name: string;
    request_id: string | null;
};`);
    } else if (tool.template === "postExport") {
        lines.push(`export type ${S}Success = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    export: Record<string, unknown>;
    request_id: string | null;
};`);
    } else if (tool.template === "postAction") {
        lines.push(`export type ${S}Success = {
    success: true;
    message: string;
    http_status: number;
    ${tool.scope === "orgUser" ? "org: string;\n    username: string;\n    codespace_name: string;\n    " : "codespace_name: string;\n    "}${tool.returnsObject ? "codespace: Record<string, unknown>;\n    " : ""}request_id: string | null;
};`);
    } else if (tool.template === "listMachines") {
        lines.push(`export type ${S}Success = {
    success: true;
    message: string;
    http_status: number;
    ${tool.scope === "repo" ? "owner: string;\n    repo: string;\n    full_name: string;" : "codespace_name: string;"}
    machines: Record<string, unknown>[];
    request_id: string | null;
};`);
    } else if (tool.template === "setPut") {
        lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; org: string; visibility: string; request_id: string | null; };`);
    } else if (tool.template === "selectedUsersPost" || tool.template === "selectedUsersDelete") {
        lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; org: string; selected_usernames: string[]; request_id: string | null; };`);
    } else if (tool.template === "orgSecret") {
        const k = tool.orgSecretKind;
        if (k === "list") lines.push(`export type ${S}Success = { success: true; message: string; org: string; total_count: number; secrets: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };`);
        else if (k === "getPublicKey") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; org: string; public_key: Record<string, unknown>; request_id: string | null; };`);
        else if (k === "getSecret") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; org: string; secret_name: string; secret: Record<string, unknown>; request_id: string | null; };`);
        else if (k === "createOrUpdate") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; org: string; secret_name: string; created: boolean; request_id: string | null; };`);
        else if (k === "deleteSecret") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; org: string; secret_name: string; request_id: string | null; };`);
        else if (k === "listSelected") lines.push(`export type ${S}Success = { success: true; message: string; org: string; secret_name: string; total_count: number; repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };`);
        else if (k === "setSelected") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; org: string; secret_name: string; selected_repository_ids: number[]; request_id: string | null; };`);
        else if (k === "addSelected" || k === "removeSelected") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; org: string; secret_name: string; repository_id: number; request_id: string | null; };`);
    } else if (tool.template === "repoSecret") {
        const k = tool.repoSecretKind;
        const repoFields = "owner: string;\n    repo: string;\n    full_name: string;";
        if (k === "list") lines.push(`export type ${S}Success = { success: true; message: string; ${repoFields}; total_count: number; secrets: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };`);
        else if (k === "getPublicKey") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; ${repoFields}; public_key: Record<string, unknown>; request_id: string | null; };`);
        else if (k === "getSecret") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; ${repoFields}; secret_name: string; secret: Record<string, unknown>; request_id: string | null; };`);
        else if (k === "createOrUpdate") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; ${repoFields}; secret_name: string; created: boolean; request_id: string | null; };`);
        else lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; ${repoFields}; secret_name: string; request_id: string | null; };`);
    } else if (tool.template === "userSecret") {
        const k = tool.userSecretKind;
        if (k === "list") lines.push(`export type ${S}Success = { success: true; message: string; total_count: number; secrets: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };`);
        else if (k === "getPublicKey") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; public_key: Record<string, unknown>; request_id: string | null; };`);
        else if (k === "getSecret") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; secret_name: string; secret: Record<string, unknown>; request_id: string | null; };`);
        else if (k === "createOrUpdate") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; secret_name: string; created: boolean; request_id: string | null; };`);
        else if (k === "deleteSecret") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; secret_name: string; request_id: string | null; };`);
        else if (k === "listRepos") lines.push(`export type ${S}Success = { success: true; message: string; secret_name: string; total_count: number; repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };`);
        else if (k === "setRepos") lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; secret_name: string; selected_repository_ids: number[]; request_id: string | null; };`);
        else lines.push(`export type ${S}Success = { success: true; message: string; http_status: number; secret_name: string; repository_id: number; request_id: string | null; };`);
    }
    lines.push(fail);
    return lines.join("\n");
}

function genMcpJson(tool) {
    const props = {};
    const required = [];
    const add = (key, schema, req = false) => {
        props[key] = schema;
        if (req) required.push(key);
    };
    if (tool.scope === "repo" || tool.repoSecretKind) {
        add("owner", { type: "string", minLength: 1, maxLength: 39, pattern: "^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$" }, true);
        add("name", { type: "string", minLength: 1, maxLength: 100, pattern: "^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$" }, true);
    }
    if (tool.scope === "org" || tool.template === "setPut" || tool.template === "selectedUsersPost" || tool.template === "selectedUsersDelete" || tool.orgSecretKind) {
        if (!tool.repoSecretKind) add("org", { type: "string", minLength: 1, maxLength: 39, pattern: "^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$" }, true);
    }
    if (tool.scope === "orgUser") {
        add("username", { type: "string", minLength: 1 }, true);
        add("codespace_name", { type: "string", minLength: 1 }, true);
    }
    if (tool.template === "listPaginated" && !tool.scope?.includes("org")) {
        if (tool.filterQuery) add(tool.filterQuery, { type: "integer" });
        add("per_page", { type: "integer", minimum: 1, maximum: 100 });
        add("page", { type: "integer", minimum: 1 });
        add("all_pages", { type: "boolean" });
        add("max_pages", { type: "integer", minimum: 1, maximum: 500 });
    }
    if (tool.template === "listPaginated" && (tool.scope === "org" || tool.scope === "orgUser")) {
        add("per_page", { type: "integer", minimum: 1, maximum: 100 });
        add("page", { type: "integer", minimum: 1 });
        add("all_pages", { type: "boolean" });
        add("max_pages", { type: "integer", minimum: 1, maximum: 500 });
    }
    if (tool.pull_number) add("pull_number", { type: "integer", minimum: 1 }, true);
    if (tool.template === "createCodespace") Object.assign(props, createBodyJson().properties);
    if (tool.template === "createUserCodespace") {
        add("repository_id", { type: "integer" });
        add("pull_request", { type: "object", properties: { pull_request_number: { type: "integer" }, repository_id: { type: "integer" } } });
        Object.assign(props, createBodyJson().properties);
    }
    if (tool.template === "getQuery" && tool.query) {
        for (const q of tool.query) add(q.key, { type: "string" }, q.required);
    }
    if (tool.name.includes("codespace_name") || ["getSingle", "updatePatch", "deleteAccepted", "postExport", "postAction"].includes(tool.template)) {
        if (!tool.scope?.includes("orgUser") && tool.name !== "github_get_user_codespace_export") add("codespace_name", { type: "string", minLength: 1 }, true);
    }
    if (tool.name === "github_get_user_codespace_export") {
        add("codespace_name", { type: "string", minLength: 1 }, true);
        add("export_id", { type: "integer", minimum: 1 }, true);
    }
    if (tool.template === "setPut") {
        add("visibility", { type: "string", enum: VISIBILITY_ENUM }, true);
        add("selected_usernames", { type: "array", items: { type: "string" } });
    }
    if (tool.template === "selectedUsersPost" || tool.template === "selectedUsersDelete") {
        add("selected_usernames", { type: "array", items: { type: "string", minLength: 1 } }, true);
    }
    if (tool.orgSecretKind || tool.repoSecretKind || tool.userSecretKind) {
        if (tool.orgSecretKind !== "list" && tool.orgSecretKind !== "getPublicKey" && tool.userSecretKind !== "list" && tool.userSecretKind !== "getPublicKey" && tool.repoSecretKind !== "list" && tool.repoSecretKind !== "getPublicKey") {
            add("secret_name", { type: "string", pattern: "^[A-Za-z_][A-Za-z0-9_]*$" }, true);
        }
        if (tool.orgSecretKind === "createOrUpdate" || tool.userSecretKind === "createOrUpdate") {
            add("value", { type: "string" }, true);
            if (tool.orgSecretKind) add("visibility", { type: "string", enum: SECRET_VISIBILITY_ENUM }, true);
            add("selected_repository_ids", { type: "array", items: { type: "integer" } });
        }
        if (tool.orgSecretKind === "listSelected" || tool.userSecretKind === "listRepos") {
            add("per_page", { type: "integer", minimum: 1, maximum: 100 });
            add("page", { type: "integer", minimum: 1 });
            add("all_pages", { type: "boolean" });
            add("max_pages", { type: "integer", minimum: 1, maximum: 500 });
        }
        if (tool.orgSecretKind === "setSelected" || tool.userSecretKind === "setRepos") add("selected_repository_ids", { type: "array", items: { type: "integer" } }, true);
        if (tool.orgSecretKind === "addSelected" || tool.orgSecretKind === "removeSelected" || tool.userSecretKind === "addRepo" || tool.userSecretKind === "removeRepo") add("repository_id", { type: "integer", minimum: 1 }, true);
    }
    if (tool.template === "listMachines" && tool.scope === "user") add("codespace_name", { type: "string", minLength: 1 }, true);
    if (tool.template === "listMachines" && tool.scope === "repo") {
        add("location", { type: "string" });
        add("client_ip", { type: "string" });
        add("ref", { type: "string" });
    }
    if (tool.name === "github_publish_user_codespace") {
        add("name", { type: "string" });
        add("private", { type: "boolean" });
    }
    return JSON.stringify({ name: tool.name, description: tool.description, arguments: { type: "object", properties: props, required, $schema: "http://json-schema.org/draft-07/schema#" } }, null, 2);
}

function appendTypes(tools) {
    const file = path.join(ROOT, "src/types.ts");
    let content = fs.readFileSync(file, "utf8");
    const block = tools.map(genTypes).join("\n\n") + "\n";
    if (!content.endsWith("\n")) content += "\n";
    fs.writeFileSync(file, content + block);
}

function updateMcpResponse(tools) {
    const file = path.join(ROOT, "src/utils/mcp-response.ts");
    let content = fs.readFileSync(file, "utf8");
    const newTypes = [];
    for (const tool of tools) {
        const S = pascalFromTool(tool.name);
        newTypes.push(`${S}Failure`, `${S}Success`);
    }
    const importMatch = content.match(/import type \{([\s\S]*?)\} from "\.\.\/types\.js";/);
    if (!importMatch) throw new Error("Could not find types import in mcp-response.ts");
    const existing = importMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
    const merged = [...new Set([...existing, ...newTypes])].sort((a, b) => a.localeCompare(b));
    content = content.replace(importMatch[0], `import type {\n    ${merged.join(",\n    ")}\n} from "../types.js";`);
    const unionLines = newTypes.flatMap((t) => [`        | ${t}`]);
    content = content.replace(/\n(\) \{\n    \/\/ Provide both human-readable text)/, `\n${unionLines.join("\n")}$1`);
    fs.writeFileSync(file, content);
}

function updateIndex(tools, subdir) {
    const file = path.join(ROOT, "src/index.ts");
    let content = fs.readFileSync(file, "utf8");
    const importLines = tools.map((t) => `import { ${registerFn(t.name)} } from "./tools/${subdir}/${kebabFromTool(t.name)}.js";`);
    const registerLines = tools.map((t) => `${registerFn(t.name)}(server, octokit);`);
    const marker = "installCompactToolsListHandler(server);";
    if (!content.includes(marker)) throw new Error("installCompactToolsListHandler marker not found");
    const insertAt = content.indexOf(marker);
    content = content.slice(0, insertAt) + registerLines.join("\n") + "\n\n" + content.slice(insertAt);
    const tokenMarker = 'const token = getRequiredEnv("GITHUB_TOKEN");';
    const tokenIdx = content.indexOf(tokenMarker);
    content = content.slice(0, tokenIdx) + importLines.join("\n") + "\n" + content.slice(tokenIdx);
    fs.writeFileSync(file, content);
}

function writeReadme(section, tools) {
    const dir = path.join(ROOT, "src/tools", section.subdir);
    fs.mkdirSync(dir, { recursive: true });
    const table = tools.map((t) => `| \`${t.name}\` | |`).join("\n");
    fs.writeFileSync(
        path.join(dir, "README.md"),
        `# ${section.readmeTitle} MCP tools\n\n${section.intro}\n\nSuccess payloads follow the shared MCP shape; failures use **CreateRepoFailure**.\n\n## Tools\n\n| Tool | Notes |\n| --- | --- |\n${table}\n`
    );
}

function updateRootReadme(sectionNum, section) {
    const file = path.join(ROOT, "README.md");
    let content = fs.readFileSync(file, "utf8");
    const bullet = `- **[${section.readmeLink}](src/tools/${section.subdir}/README.md)**`;
    if (sectionNum === 1) {
        const anchor = "- **[Codes of conduct](src/tools/codes-of-conduct/codes-of-conduct/README.md)**";
        const idx = content.indexOf(anchor);
        if (idx === -1) throw new Error("Codes of conduct bullet not found in README");
        const lineEnd = content.indexOf("\n", idx);
        const insert = `\n\n### Codespaces\n\n${bullet}`;
        content = content.slice(0, lineEnd) + insert + content.slice(lineEnd);
    } else {
        const header = "### Codespaces";
        const idx = content.indexOf(header);
        if (idx === -1) throw new Error("Codespaces section not found in README");
        const nextSection = content.indexOf("\n### ", idx + header.length);
        const insertAt = nextSection === -1 ? content.length : nextSection;
        content = content.slice(0, insertAt) + `\n${bullet}` + content.slice(insertAt);
    }
    fs.writeFileSync(file, content);
}

function main() {
    const sectionNum = Number(process.argv[2]);
    if (!SECTIONS[sectionNum]) {
        console.error("Usage: node scripts/generate-codespaces-section.mjs <section-number> (1-6)");
        process.exit(1);
    }
    const section = SECTIONS[sectionNum];
    const tsDir = path.join(ROOT, "src/tools", section.subdir);
    const mcpDir = path.join(ROOT, "mcps/user-github-mcp/tools", section.subdir);
    fs.mkdirSync(tsDir, { recursive: true });
    fs.mkdirSync(mcpDir, { recursive: true });
    const generated = [];
    for (const tool of section.tools) {
        const tsPath = path.join(tsDir, `${kebabFromTool(tool.name)}.ts`);
        const mcpPath = path.join(mcpDir, `${tool.name}.json`);
        fs.writeFileSync(tsPath, generateToolSource(tool));
        fs.writeFileSync(mcpPath, genMcpJson(tool));
        generated.push(tsPath, mcpPath);
    }
    appendTypes(section.tools);
    updateMcpResponse(section.tools);
    updateIndex(section.tools, section.subdir);
    writeReadme(section, section.tools);
    updateRootReadme(sectionNum, section);
    console.log(`Generated section ${sectionNum} (${section.subdir}): ${section.tools.length} tools, ${generated.length} files`);
    for (const f of generated) console.log(`  ${path.relative(ROOT, f)}`);
}

main();
