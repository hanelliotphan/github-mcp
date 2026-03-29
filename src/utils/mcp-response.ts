import type {
    CheckDependabotSecurityUpdatesFailure,
    CheckDependabotSecurityUpdatesSuccess,
    CheckPrivateVulnerabilityReportingFailure,
    CheckPrivateVulnerabilityReportingSuccess,
    CheckVulnerabilityAlertsFailure,
    CheckVulnerabilityAlertsSuccess,
    CheckImmutableReleasesFailure,
    CheckImmutableReleasesSuccess,
    EnableImmutableReleasesFailure,
    EnableImmutableReleasesSuccess,
    CreateRepoDispatchFailure,
    CreateRepoDispatchSuccess,
    CreateRepoFailure,
    DisableDependabotSecurityUpdatesFailure,
    DisableDependabotSecurityUpdatesSuccess,
    DisablePrivateVulnerabilityReportingFailure,
    DisablePrivateVulnerabilityReportingSuccess,
    DisableImmutableReleasesFailure,
    DisableImmutableReleasesSuccess,
    EnableDependabotSecurityUpdatesFailure,
    EnableDependabotSecurityUpdatesSuccess,
    EnablePrivateVulnerabilityReportingFailure,
    EnablePrivateVulnerabilityReportingSuccess,
    EnableVulnerabilityAlertsFailure,
    EnableVulnerabilityAlertsSuccess,
    CreateRepoSuccess,
    DeleteRepoFailure,
    DeleteRepoSuccess,
    GetRepoFailure,
    GetRepoSuccess,
    ListCodeownersErrorsFailure,
    ListCodeownersErrorsSuccess,
    ListRepoContributorsFailure,
    ListRepoContributorsSuccess,
    ListRepoActivitiesFailure,
    ListRepoActivitiesSuccess,
    ListRepoLanguagesFailure,
    ListRepoLanguagesSuccess,
    ListRepoTagsFailure,
    ListRepoTagsSuccess,
    ListRepoTeamsFailure,
    ListRepoTeamsSuccess,
    ListRepoTopicsFailure,
    ListRepoTopicsSuccess,
    ReplaceRepoTopicsFailure,
    ReplaceRepoTopicsSuccess,
    TransferRepoFailure,
    TransferRepoSuccess,
    UpdateRepoFailure,
    UpdateRepoSuccess
} from "../types.js";

export function textAndData(
    payload:
        | CheckDependabotSecurityUpdatesSuccess
        | CheckDependabotSecurityUpdatesFailure
        | CheckPrivateVulnerabilityReportingSuccess
        | CheckPrivateVulnerabilityReportingFailure
        | CheckVulnerabilityAlertsSuccess
        | CheckVulnerabilityAlertsFailure
        | CheckImmutableReleasesSuccess
        | CheckImmutableReleasesFailure
        | EnableImmutableReleasesSuccess
        | EnableImmutableReleasesFailure
        | DisableImmutableReleasesSuccess
        | DisableImmutableReleasesFailure
        | EnableDependabotSecurityUpdatesSuccess
        | EnableDependabotSecurityUpdatesFailure
        | DisableDependabotSecurityUpdatesSuccess
        | DisableDependabotSecurityUpdatesFailure
        | DisablePrivateVulnerabilityReportingSuccess
        | DisablePrivateVulnerabilityReportingFailure
        | EnablePrivateVulnerabilityReportingSuccess
        | EnablePrivateVulnerabilityReportingFailure
        | EnableVulnerabilityAlertsSuccess
        | EnableVulnerabilityAlertsFailure
        | CreateRepoDispatchSuccess
        | CreateRepoDispatchFailure
        | CreateRepoSuccess
        | CreateRepoFailure
        | DeleteRepoSuccess
        | DeleteRepoFailure
        | GetRepoSuccess
        | GetRepoFailure
        | ListCodeownersErrorsSuccess
        | ListCodeownersErrorsFailure
        | ListRepoContributorsSuccess
        | ListRepoContributorsFailure
        | ListRepoActivitiesSuccess
        | ListRepoActivitiesFailure
        | ListRepoLanguagesSuccess
        | ListRepoLanguagesFailure
        | ListRepoTagsSuccess
        | ListRepoTagsFailure
        | ListRepoTeamsSuccess
        | ListRepoTeamsFailure
        | ListRepoTopicsSuccess
        | ListRepoTopicsFailure
        | ReplaceRepoTopicsSuccess
        | ReplaceRepoTopicsFailure
        | TransferRepoSuccess
        | TransferRepoFailure
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
