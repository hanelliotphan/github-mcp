import type { CreateRepoFailure, CreateRepoSuccess } from "../types.js";

export function textAndData(payload: CreateRepoSuccess | CreateRepoFailure) {
    // Provide both human-readable text and structured JSON for MCP consumers.
    return {
        content: [
            {
                type: "text" as const,
                text: JSON.stringify(payload, null, 2)
            }
        ],
        structuredContent: payload
    };
}
