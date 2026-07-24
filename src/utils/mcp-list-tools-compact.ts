import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { normalizeObjectSchema } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { toJsonSchemaCompat } from "@modelcontextprotocol/sdk/server/zod-json-schema-compat.js";

/**
 * Cursor's MCP process calls `tools/list` once and does **not** follow `nextCursor`.
 * A full dump of 1000+ tools with verbose Zod JSON Schema (~0.9MB) gets truncated in
 * Cursor's offerings snapshot (historically stuck near ~169, later ~607). Keep one
 * response, but shrink descriptions and strip schema noise for the list payload.
 */
const MAX_LIST_DESCRIPTION_CHARS = 100;

const EMPTY_OBJECT_JSON_SCHEMA = {
    type: "object",
    properties: {}
} as const;

/** Keys that bloat list payloads without changing how agents choose arguments. */
const SCHEMA_NOISE_KEYS = new Set([
    "$schema",
    "description",
    "title",
    "pattern",
    "minLength",
    "maxLength",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "minItems",
    "maxItems",
    "minProperties",
    "maxProperties",
    "format",
    "default",
    "examples",
    "markdownDescription"
]);

type RegisteredTool = {
    enabled?: boolean;
    title?: string;
    description?: string;
    inputSchema?: unknown;
    outputSchema?: unknown;
    annotations?: unknown;
    execution?: unknown;
    _meta?: unknown;
};

function compactDescription(description: string | undefined): string | undefined {
    if (!description) {
        return description;
    }
    const oneLine = description.replace(/\s+/g, " ").trim();
    if (oneLine.length <= MAX_LIST_DESCRIPTION_CHARS) {
        return oneLine;
    }
    return `${oneLine.slice(0, MAX_LIST_DESCRIPTION_CHARS - 1).trimEnd()}…`;
}

function compactJsonSchema(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => compactJsonSchema(item));
    }
    if (value === null || typeof value !== "object") {
        return value;
    }
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(input)) {
        if (SCHEMA_NOISE_KEYS.has(key)) {
            continue;
        }
        output[key] = compactJsonSchema(child);
    }
    return output;
}

function serializeTool(name: string, tool: RegisteredTool) {
    const inputObj = normalizeObjectSchema(tool.inputSchema as never);
    const rawInputSchema = inputObj
        ? toJsonSchemaCompat(inputObj, {
              strictUnions: true,
              pipeStrategy: "input"
          })
        : EMPTY_OBJECT_JSON_SCHEMA;
    const toolDefinition: Record<string, unknown> = {
        name,
        description: compactDescription(tool.description),
        inputSchema: compactJsonSchema(rawInputSchema)
    };
    // Omit title / annotations / execution / _meta / outputSchema from the list
    // payload — Cursor only needs name, description, and a lean input schema.
    return toolDefinition;
}

function getRegisteredTools(server: McpServer): Record<string, RegisteredTool> {
    return (server as unknown as { _registeredTools: Record<string, RegisteredTool> })._registeredTools;
}

/**
 * Cursor's MCP UI / offerings snapshot hard-caps around **607** tools per server.
 * Split one codebase across multiple MCP entries with:
 * - `GITHUB_MCP_SHARD_COUNT` — total shards (e.g. `2`)
 * - `GITHUB_MCP_SHARD` — this process's shard index (`0` .. count-1)
 *
 * Tools are partitioned by sorted name into contiguous slices so each shard stays
 * under the cap while the combined set covers every registered tool.
 */
export function applyGithubMcpToolShard(server: McpServer): void {
    const shardRaw = process.env.GITHUB_MCP_SHARD;
    const countRaw = process.env.GITHUB_MCP_SHARD_COUNT;
    if (shardRaw === undefined || countRaw === undefined || shardRaw === "" || countRaw === "") {
        return;
    }
    const shard = Number.parseInt(shardRaw, 10);
    const shardCount = Number.parseInt(countRaw, 10);
    if (!Number.isInteger(shard) || !Number.isInteger(shardCount) || shardCount < 2 || shard < 0 || shard >= shardCount) {
        console.error(
            `Invalid GITHUB_MCP_SHARD=${shardRaw} / GITHUB_MCP_SHARD_COUNT=${countRaw}; expected shard in 0..count-1 and count >= 2.`
        );
        process.exit(1);
    }
    const registered = getRegisteredTools(server);
    const names = Object.keys(registered).sort((a, b) => a.localeCompare(b));
    const start = Math.floor((names.length * shard) / shardCount);
    const end = Math.floor((names.length * (shard + 1)) / shardCount);
    const keep = new Set(names.slice(start, end));
    for (const name of names) {
        if (!keep.has(name)) {
            delete registered[name];
        }
    }
    console.error(
        `github-mcp shard ${shard}/${shardCount}: serving ${keep.size} of ${names.length} tools (${names[start] ?? "∅"} … ${names[end - 1] ?? "∅"}).`
    );
}

/** Replace the default `tools/list` handler with a compact all-tools response. */
export function installCompactToolsListHandler(server: McpServer): void {
    server.server.setRequestHandler(ListToolsRequestSchema, async () => {
        const registered = getRegisteredTools(server);
        const tools = Object.entries(registered)
            .filter(([, tool]) => tool.enabled !== false)
            .map(([name, tool]) => serializeTool(name, tool));
        return { tools };
    });
}
