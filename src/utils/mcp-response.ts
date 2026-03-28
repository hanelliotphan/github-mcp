import type {
    CheckDependabotSecurityUpdatesFailure,
    CheckDependabotSecurityUpdatesSuccess,
    CreateRepoFailure,
    CreateRepoSuccess,
    DeleteRepoFailure,
    DeleteRepoSuccess,
    GetRepoFailure,
    GetRepoSuccess,
    ListRepoActivitiesFailure,
    ListRepoActivitiesSuccess,
    UpdateRepoFailure,
    UpdateRepoSuccess
} from "../types.js";

export function textAndData(
    payload:
        | CheckDependabotSecurityUpdatesSuccess
        | CheckDependabotSecurityUpdatesFailure
        | CreateRepoSuccess
        | CreateRepoFailure
        | DeleteRepoSuccess
        | DeleteRepoFailure
        | GetRepoSuccess
        | GetRepoFailure
        | ListRepoActivitiesSuccess
        | ListRepoActivitiesFailure
        | UpdateRepoSuccess
        | UpdateRepoFailure
) {
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
