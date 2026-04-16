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
    EnableImmutableReleasesForOrgRepoFailure,
    EnableImmutableReleasesForOrgRepoSuccess,
    EnableImmutableReleasesSuccess,
    EnableOrDisableOrgSecurityFeatureFailure,
    EnableOrDisableOrgSecurityFeatureSuccess,
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
    DisableImmutableReleasesForOrgRepoFailure,
    DisableImmutableReleasesForOrgRepoSuccess,
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
    DeleteOrgFailure,
    DeleteOrgSuccess,
    DeleteRepoRulesetFailure,
    DeleteRepoRulesetSuccess,
    DeleteRepoWebhookFailure,
    DeleteRepoWebhookSuccess,
    DownloadRepoArchiveTarFailure,
    DownloadRepoArchiveTarSuccess,
    DownloadRepoArchiveZipFailure,
    DownloadRepoArchiveZipSuccess,
    DeleteRepoFailure,
    DeleteRepoSuccess,
    GetOrgFailure,
    GetOrgImmutableReleasesSettingsFailure,
    GetOrgImmutableReleasesSettingsSuccess,
    GetOrgSuccess,
    GetRouteStatsByActorFailure,
    GetRouteStatsByActorSuccess,
    GetSubjectStatsFailure,
    GetSubjectStatsSuccess,
    GetSummaryStatsFailure,
    GetSummaryStatsSuccess,
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
    GetRepoWebhookConfigFailure,
    GetRepoWebhookConfigSuccess,
    GetRepoWebhookDeliveryFailure,
    GetRepoWebhookDeliverySuccess,
    RedeliverRepoWebhookDeliveryFailure,
    RedeliverRepoWebhookDeliverySuccess,
    PingRepoWebhookFailure,
    PingRepoWebhookSuccess,
    TestPushRepoWebhookFailure,
    TestPushRepoWebhookSuccess,
    GetRepoWebhookFailure,
    GetRepoWebhookSuccess,
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
    CreateRepoWebhookFailure,
    CreateRepoWebhookSuccess,
    ListRepoForksFailure,
    ListRepoForksSuccess,
    ListRepoRuleSuitesFailure,
    ListRepoRuleSuitesSuccess,
    ListRepoRulesetsFailure,
    ListRepoRulesetsSuccess,
    ListRepoWebhookDeliveriesFailure,
    ListRepoWebhookDeliveriesSuccess,
    ListRepoWebhooksFailure,
    ListRepoWebhooksSuccess,
    ListAuthenticatedUserReposFailure,
    ListAuthenticatedUserReposSuccess,
    ListOrganizationsFailure,
    ListOrganizationsSuccess,
    ListOrgAppInstallationsFailure,
    ListOrgAppInstallationsSuccess,
    ListOrgsForAuthenticatedUserFailure,
    ListOrgsForAuthenticatedUserSuccess,
    ListOrgsForUserFailure,
    ListOrgsForUserSuccess,
    ListImmutableReleasesForOrgReposFailure,
    ListImmutableReleasesForOrgReposSuccess,
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
    SetImmutableReleasesForOrgReposFailure,
    SetImmutableReleasesForOrgReposSuccess,
    SetOrgImmutableReleasesSettingsFailure,
    SetOrgImmutableReleasesSettingsSuccess,
    TransferRepoFailure,
    TransferRepoSuccess,
    UpdateOrgFailure,
    UpdateOrgSuccess,
    UpdateRepoRulesetFailure,
    UpdateRepoRulesetSuccess,
    UpdateRepoWebhookConfigFailure,
    UpdateRepoWebhookConfigSuccess,
    UpdateRepoWebhookFailure,
    UpdateRepoWebhookSuccess,
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
        | EnableImmutableReleasesForOrgRepoSuccess
        | EnableImmutableReleasesForOrgRepoFailure
        | EnableOrDisableOrgSecurityFeatureSuccess
        | EnableOrDisableOrgSecurityFeatureFailure
        | DisableImmutableReleasesSuccess
        | DisableImmutableReleasesFailure
        | DisableImmutableReleasesForOrgRepoSuccess
        | DisableImmutableReleasesForOrgRepoFailure
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
        | DeleteOrgSuccess
        | DeleteOrgFailure
        | DeleteRepoRulesetSuccess
        | DeleteRepoRulesetFailure
        | DeleteRepoWebhookSuccess
        | DeleteRepoWebhookFailure
        | DownloadRepoArchiveTarSuccess
        | DownloadRepoArchiveTarFailure
        | DownloadRepoArchiveZipSuccess
        | DownloadRepoArchiveZipFailure
        | GetOrgSuccess
        | GetOrgFailure
        | GetOrgImmutableReleasesSettingsSuccess
        | GetOrgImmutableReleasesSettingsFailure
        | GetRouteStatsByActorSuccess
        | GetRouteStatsByActorFailure
        | GetSubjectStatsSuccess
        | GetSubjectStatsFailure
        | GetSummaryStatsSuccess
        | GetSummaryStatsFailure
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
        | GetRepoWebhookSuccess
        | GetRepoWebhookFailure
        | GetRepoWebhookDeliverySuccess
        | GetRepoWebhookDeliveryFailure
        | RedeliverRepoWebhookDeliverySuccess
        | RedeliverRepoWebhookDeliveryFailure
        | PingRepoWebhookSuccess
        | PingRepoWebhookFailure
        | TestPushRepoWebhookSuccess
        | TestPushRepoWebhookFailure
        | GetRepoWebhookConfigSuccess
        | GetRepoWebhookConfigFailure
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
        | CreateRepoWebhookSuccess
        | CreateRepoWebhookFailure
        | ListRepoForksSuccess
        | ListRepoForksFailure
        | ListRepoRuleSuitesSuccess
        | ListRepoRuleSuitesFailure
        | ListRepoRulesetsSuccess
        | ListRepoRulesetsFailure
        | ListRepoWebhookDeliveriesSuccess
        | ListRepoWebhookDeliveriesFailure
        | ListRepoWebhooksSuccess
        | ListRepoWebhooksFailure
        | ListAuthenticatedUserReposSuccess
        | ListAuthenticatedUserReposFailure
        | ListOrganizationsSuccess
        | ListOrganizationsFailure
        | ListOrgAppInstallationsSuccess
        | ListOrgAppInstallationsFailure
        | ListOrgsForAuthenticatedUserSuccess
        | ListOrgsForAuthenticatedUserFailure
        | ListOrgsForUserSuccess
        | ListOrgsForUserFailure
        | ListImmutableReleasesForOrgReposSuccess
        | ListImmutableReleasesForOrgReposFailure
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
        | SetImmutableReleasesForOrgReposSuccess
        | SetImmutableReleasesForOrgReposFailure
        | SetOrgImmutableReleasesSettingsSuccess
        | SetOrgImmutableReleasesSettingsFailure
        | TransferRepoSuccess
        | TransferRepoFailure
        | UpdateOrgSuccess
        | UpdateOrgFailure
        | UpdateRepoRulesetSuccess
        | UpdateRepoRulesetFailure
        | UpdateRepoWebhookSuccess
        | UpdateRepoWebhookFailure
        | UpdateRepoWebhookConfigSuccess
        | UpdateRepoWebhookConfigFailure
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
