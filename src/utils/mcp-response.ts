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
    CreateUpdateFileContentsFailure,
    CreateUpdateFileContentsSuccess,
    CreateRepoAttestationFailure,
    CreateRepoAttestationSuccess,
    CreateRepoDispatchFailure,
    CreateRepoDispatchSuccess,
    CreateUpdateRepoCustomPropertyValuesFailure,
    CreateUpdateRepoCustomPropertyValuesSuccess,
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
    DeleteRepoRulesetFailure,
    DeleteRepoRulesetSuccess,
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
    GetRepoBranchRulesFailure,
    GetRepoBranchRulesSuccess,
    GetRepoReadmeFailure,
    GetRepoReadmeSuccess,
    GetRepoRuleSuiteFailure,
    GetRepoRuleSuiteSuccess,
    GetRepoRulesetFailure,
    GetRepoRulesetSuccess,
    GetRepoRulesetHistoryFailure,
    GetRepoRulesetHistorySuccess,
    GetRepoRulesetVersionFailure,
    GetRepoRulesetVersionSuccess,
    GetRepoCustomPropertyValuesFailure,
    GetRepoCustomPropertyValuesSuccess,
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
    CreateRepoForkFailure,
    CreateRepoForkSuccess,
    CreateRepoRulesetFailure,
    CreateRepoRulesetSuccess,
    ListRepoForksFailure,
    ListRepoForksSuccess,
    ListRepoRuleSuitesFailure,
    ListRepoRuleSuitesSuccess,
    ListRepoRulesetsFailure,
    ListRepoRulesetsSuccess,
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
    UpdateRepoRulesetFailure,
    UpdateRepoRulesetSuccess,
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
        | CreateUpdateFileContentsSuccess
        | CreateUpdateFileContentsFailure
        | CreateRepoAttestationSuccess
        | CreateRepoAttestationFailure
        | CreateRepoDispatchSuccess
        | CreateRepoDispatchFailure
        | CreateUpdateRepoCustomPropertyValuesSuccess
        | CreateUpdateRepoCustomPropertyValuesFailure
        | CreateRepoSuccess
        | CreateRepoFailure
        | DeleteRepoSuccess
        | DeleteRepoFailure
        | DeleteFileSuccess
        | DeleteFileFailure
        | DeleteRepoRulesetSuccess
        | DeleteRepoRulesetFailure
        | DownloadRepoArchiveTarSuccess
        | DownloadRepoArchiveTarFailure
        | DownloadRepoArchiveZipSuccess
        | DownloadRepoArchiveZipFailure
        | GetRepoSuccess
        | GetRepoFailure
        | GetRepoContentSuccess
        | GetRepoContentFailure
        | GetRepoBranchRulesSuccess
        | GetRepoBranchRulesFailure
        | GetRepoReadmeSuccess
        | GetRepoReadmeFailure
        | GetRepoRuleSuiteSuccess
        | GetRepoRuleSuiteFailure
        | GetRepoRulesetSuccess
        | GetRepoRulesetFailure
        | GetRepoRulesetHistorySuccess
        | GetRepoRulesetHistoryFailure
        | GetRepoRulesetVersionSuccess
        | GetRepoRulesetVersionFailure
        | GetRepoCustomPropertyValuesSuccess
        | GetRepoCustomPropertyValuesFailure
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
        | CreateRepoForkSuccess
        | CreateRepoForkFailure
        | CreateRepoRulesetSuccess
        | CreateRepoRulesetFailure
        | ListRepoForksSuccess
        | ListRepoForksFailure
        | ListRepoRuleSuitesSuccess
        | ListRepoRuleSuitesFailure
        | ListRepoRulesetsSuccess
        | ListRepoRulesetsFailure
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
        | UpdateRepoRulesetSuccess
        | UpdateRepoRulesetFailure
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
