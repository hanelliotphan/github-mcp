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
    CreateOrUpdateFileContentsFailure,
    CreateOrUpdateFileContentsSuccess,
    CreateRepoAttestationFailure,
    CreateRepoAttestationSuccess,
    CreateRepoDispatchFailure,
    CreateRepoDispatchSuccess,
    CreateRepoFailure,
    DisableDependabotSecurityUpdatesFailure,
    DisableDependabotSecurityUpdatesSuccess,
    DisablePrivateVulnerabilityReportingFailure,
    DisablePrivateVulnerabilityReportingSuccess,
    DisableImmutableReleasesFailure,
    DisableImmutableReleasesSuccess,
    DisableVulnerabilityAlertsFailure,
    DisableVulnerabilityAlertsSuccess,
    EnableDependabotSecurityUpdatesFailure,
    EnableDependabotSecurityUpdatesSuccess,
    EnablePrivateVulnerabilityReportingFailure,
    EnablePrivateVulnerabilityReportingSuccess,
    EnableVulnerabilityAlertsFailure,
    EnableVulnerabilityAlertsSuccess,
    CreateRepoSuccess,
    DeleteFileFailure,
    DeleteFileSuccess,
    DownloadRepoArchiveTarFailure,
    DownloadRepoArchiveTarSuccess,
    DownloadRepoArchiveZipFailure,
    DownloadRepoArchiveZipSuccess,
    DeleteRepoFailure,
    DeleteRepoSuccess,
    GetRepoFailure,
    GetRepoSuccess,
    GetRepoContentFailure,
    GetRepoContentSuccess,
    GetRepoReadmeFailure,
    GetRepoReadmeSuccess,
    ListCodeownersErrorsFailure,
    ListCodeownersErrorsSuccess,
    ListRepoContributorsFailure,
    ListRepoContributorsSuccess,
    ListRepoActivitiesFailure,
    ListRepoActivitiesSuccess,
    ListRepoAttestationsFailure,
    ListRepoAttestationsSuccess,
    ListRepoLanguagesFailure,
    ListRepoLanguagesSuccess,
    ListRepoAutolinksFailure,
    ListRepoAutolinksSuccess,
    ListAuthenticatedUserReposFailure,
    ListAuthenticatedUserReposSuccess,
    ListOrgReposFailure,
    ListOrgReposSuccess,
    ListPublicReposFailure,
    ListPublicReposSuccess,
    ListRepoTagsFailure,
    ListRepoTagsSuccess,
    ListRepoTeamsFailure,
    ListRepoTeamsSuccess,
    ListRepoTopicsFailure,
    ListRepoTopicsSuccess,
    ListUserReposFailure,
    ListUserReposSuccess,
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
        | DisableVulnerabilityAlertsSuccess
        | DisableVulnerabilityAlertsFailure
        | CreateOrUpdateFileContentsSuccess
        | CreateOrUpdateFileContentsFailure
        | CreateRepoAttestationSuccess
        | CreateRepoAttestationFailure
        | CreateRepoDispatchSuccess
        | CreateRepoDispatchFailure
        | CreateRepoSuccess
        | CreateRepoFailure
        | DeleteRepoSuccess
        | DeleteRepoFailure
        | DeleteFileSuccess
        | DeleteFileFailure
        | DownloadRepoArchiveTarSuccess
        | DownloadRepoArchiveTarFailure
        | DownloadRepoArchiveZipSuccess
        | DownloadRepoArchiveZipFailure
        | GetRepoSuccess
        | GetRepoFailure
        | GetRepoContentSuccess
        | GetRepoContentFailure
        | GetRepoReadmeSuccess
        | GetRepoReadmeFailure
        | ListCodeownersErrorsSuccess
        | ListCodeownersErrorsFailure
        | ListRepoContributorsSuccess
        | ListRepoContributorsFailure
        | ListRepoActivitiesSuccess
        | ListRepoActivitiesFailure
        | ListRepoAttestationsSuccess
        | ListRepoAttestationsFailure
        | ListRepoLanguagesSuccess
        | ListRepoLanguagesFailure
        | ListRepoAutolinksSuccess
        | ListRepoAutolinksFailure
        | ListAuthenticatedUserReposSuccess
        | ListAuthenticatedUserReposFailure
        | ListOrgReposSuccess
        | ListOrgReposFailure
        | ListPublicReposSuccess
        | ListPublicReposFailure
        | ListRepoTagsSuccess
        | ListRepoTagsFailure
        | ListRepoTeamsSuccess
        | ListRepoTeamsFailure
        | ListRepoTopicsSuccess
        | ListRepoTopicsFailure
        | ListUserReposSuccess
        | ListUserReposFailure
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
