import type {
    CheckDependabotSecurityUpdatesFailure,
    CheckDependabotSecurityUpdatesSuccess,
    CreateRepoFailure,
    DisableDependabotSecurityUpdatesFailure,
    DisableDependabotSecurityUpdatesSuccess,
    EnableDependabotSecurityUpdatesFailure,
    EnableDependabotSecurityUpdatesSuccess,
    EnableVulnerabilityAlertsFailure,
    EnableVulnerabilityAlertsSuccess,
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
        | EnableDependabotSecurityUpdatesSuccess
        | EnableDependabotSecurityUpdatesFailure
        | DisableDependabotSecurityUpdatesSuccess
        | DisableDependabotSecurityUpdatesFailure
        | EnableVulnerabilityAlertsSuccess
        | EnableVulnerabilityAlertsFailure
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
