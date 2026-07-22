import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { normalizeObjectSchema } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { toJsonSchemaCompat } from "@modelcontextprotocol/sdk/server/zod-json-schema-compat.js";

/**
 * Cursor's MCP process calls `tools/list` once and does **not** follow `nextCursor`.
 * A full dump of ~500 tools with long descriptions is ~0.5MB+ and can fail Cursor's
 * offerings/snapshot refresh, leaving Settings stuck on an older tool set (~169).
 * Keep one response, but shrink descriptions for the list payload.
 */
const MAX_LIST_DESCRIPTION_CHARS = 180;

const EMPTY_OBJECT_JSON_SCHEMA = {
    type: "object",
    properties: {}
} as const;

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

function serializeTool(name: string, tool: RegisteredTool) {
    const inputObj = normalizeObjectSchema(tool.inputSchema as never);
    const toolDefinition: Record<string, unknown> = {
        name,
        description: compactDescription(tool.description),
        inputSchema: inputObj
            ? toJsonSchemaCompat(inputObj, {
                  strictUnions: true,
                  pipeStrategy: "input"
              })
            : EMPTY_OBJECT_JSON_SCHEMA
    };
    if (tool.title) {
        toolDefinition.title = tool.title;
    }
    if (tool.annotations) {
        toolDefinition.annotations = tool.annotations;
    }
    if (tool.execution) {
        toolDefinition.execution = tool.execution;
    }
    if (tool._meta) {
        toolDefinition._meta = tool._meta;
    }
    if (tool.outputSchema) {
        const outputObj = normalizeObjectSchema(tool.outputSchema as never);
        if (outputObj) {
            toolDefinition.outputSchema = toJsonSchemaCompat(outputObj, {
                strictUnions: true,
                pipeStrategy: "output"
            });
        }
    }
    return toolDefinition;
}

function getRegisteredTools(server: McpServer): Record<string, RegisteredTool> {
    return (server as unknown as { _registeredTools: Record<string, RegisteredTool> })._registeredTools;
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
