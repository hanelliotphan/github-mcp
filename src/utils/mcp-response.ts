import type {
    BlockOrgUserFailure,
    BlockOrgUserSuccess,
    BulkListOrgAttestationsFailure,
    BulkListOrgAttestationsSuccess,
    CancelOrgInvitationFailure,
    CancelOrgInvitationSuccess,
    CheckDependabotSecurityUpdatesFailure,
    CheckDependabotSecurityUpdatesSuccess,
    CheckPrivateVulnerabilityReportingFailure,
    CheckPrivateVulnerabilityReportingSuccess,
    CheckVulnerabilityAlertsFailure,
    CheckVulnerabilityAlertsSuccess,
    CheckImmutableReleasesFailure,
    CheckImmutableReleasesSuccess,
    CheckOrgBlockedUserFailure,
    CheckOrgBlockedUserSuccess,
    EnableImmutableReleasesFailure,
    EnableImmutableReleasesForOrgRepoFailure,
    EnableImmutableReleasesForOrgRepoSuccess,
    EnableImmutableReleasesSuccess,
    EnableOrDisableOrgSecurityFeatureFailure,
    EnableOrDisableOrgSecurityFeatureSuccess,
    CreateUpdateFileContentsFailure,
    CreateUpdateFileContentsSuccess,
    CreateUpdateOrgCustomPropertyValuesFailure,
    CreateUpdateOrgCustomPropertyValuesSuccess,
    CreateOrgArtifactDeploymentRecordFailure,
    CreateOrgArtifactDeploymentRecordSuccess,
    CreateOrgInvitationFailure,
    CreateOrgInvitationSuccess,
    CreateOrgIssueFieldFailure,
    CreateOrgIssueFieldSuccess,
    CreateOrgIssueTypeFailure,
    CreateOrgIssueTypeSuccess,
    CreateOrgMetadataStorageRecordFailure,
    CreateOrgMetadataStorageRecordSuccess,
    CreateRepoAttestationFailure,
    CreateRepoAttestationSuccess,
    CreateRepoAutolinkFailure,
    CreateRepoAutolinkSuccess,
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
    DeleteOrgAttestationByIdFailure,
    DeleteOrgAttestationByIdSuccess,
    DeleteOrgAttestationBySubjectDigestFailure,
    DeleteOrgAttestationBySubjectDigestSuccess,
    DeleteOrgAttestationsBulkFailure,
    DeleteOrgAttestationsBulkSuccess,
    DeleteOrgCustomPropertyFailure,
    DeleteOrgCustomPropertySuccess,
    DeleteOrgIssueFieldFailure,
    DeleteOrgIssueFieldSuccess,
    DeleteOrgIssueTypeFailure,
    DeleteOrgIssueTypeSuccess,
    DeleteOrgFailure,
    DeleteOrgSuccess,
    DeleteRepoRulesetFailure,
    DeleteRepoRulesetSuccess,
    DeleteRepoWebhookFailure,
    DeleteRepoWebhookSuccess,
    DeleteRepoAutolinkFailure,
    DeleteRepoAutolinkSuccess,
    DownloadRepoArchiveTarFailure,
    DownloadRepoArchiveTarSuccess,
    DownloadRepoArchiveZipFailure,
    DownloadRepoArchiveZipSuccess,
    DeleteRepoFailure,
    DeleteRepoSuccess,
    GetOrgCustomPropertiesFailure,
    GetOrgCustomPropertiesSuccess,
    GetOrgCustomPropertyFailure,
    GetOrgCustomPropertySuccess,
    GetOrgCustomPropertyValuesFailure,
    GetOrgCustomPropertyValuesSuccess,
    GetOrgFailure,
    GetOrgImmutableReleasesSettingsFailure,
    GetOrgImmutableReleasesSettingsSuccess,
    GetOrgSuccess,
    GetRouteStatsByActorFailure,
    GetRouteStatsByActorSuccess,
    GetSubjectStatsFailure,
    GetSubjectStatsSuccess,
    GetSummaryStatsByActorFailure,
    GetSummaryStatsByActorSuccess,
    GetSummaryStatsByUserFailure,
    GetSummaryStatsByUserSuccess,
    GetSummaryStatsFailure,
    GetSummaryStatsSuccess,
    GetTimeStatsByActorFailure,
    GetTimeStatsByActorSuccess,
    GetTimeStatsByUserFailure,
    GetTimeStatsByUserSuccess,
    GetTimeStatsFailure,
    GetTimeStatsSuccess,
    GetUserStatsFailure,
    GetUserStatsSuccess,
    GetRepoFailure,
    GetRepoSuccess,
    GetRepoAutolinkFailure,
    GetRepoAutolinkSuccess,
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
    ListOrgArtifactDeploymentRecordsFailure,
    ListOrgArtifactDeploymentRecordsSuccess,
    ListOrgAttestationReposFailure,
    ListOrgAttestationReposSuccess,
    ListOrgAttestationsFailure,
    ListOrgAttestationsSuccess,
    ListOrgBlockedUsersFailure,
    ListOrgBlockedUsersSuccess,
    ListOrgFailedInvitationsFailure,
    ListOrgFailedInvitationsSuccess,
    ListOrgPendingInvitationsFailure,
    ListOrgPendingInvitationsSuccess,
    ListOrgInvitationTeamsFailure,
    ListOrgInvitationTeamsSuccess,
    ListOrgIssueFieldsFailure,
    ListOrgIssueFieldsSuccess,
    ListOrgIssueTypesFailure,
    ListOrgIssueTypesSuccess,
    ListOrgMetadataStorageRecordsFailure,
    ListOrgMetadataStorageRecordsSuccess,
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
    SetOrgClusterDeploymentRecordsFailure,
    SetOrgClusterDeploymentRecordsSuccess,
    SetOrgImmutableReleasesSettingsFailure,
    SetOrgImmutableReleasesSettingsSuccess,
    TransferRepoFailure,
    TransferRepoSuccess,
    UnblockOrgUserFailure,
    UnblockOrgUserSuccess,
    UpdateOrgIssueFieldFailure,
    UpdateOrgIssueFieldSuccess,
    UpdateOrgIssueTypeFailure,
    UpdateOrgIssueTypeSuccess,
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
        | BulkListOrgAttestationsSuccess
        | BulkListOrgAttestationsFailure
        | BlockOrgUserSuccess
        | BlockOrgUserFailure
        | CheckDependabotSecurityUpdatesSuccess
        | CheckDependabotSecurityUpdatesFailure
        | CheckPrivateVulnerabilityReportingSuccess
        | CheckPrivateVulnerabilityReportingFailure
        | CheckVulnerabilityAlertsSuccess
        | CheckVulnerabilityAlertsFailure
        | CheckImmutableReleasesSuccess
        | CheckImmutableReleasesFailure
        | CheckOrgBlockedUserSuccess
        | CheckOrgBlockedUserFailure
        | CancelOrgInvitationSuccess
        | CancelOrgInvitationFailure
        | ListOrgInvitationTeamsSuccess
        | ListOrgInvitationTeamsFailure
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
        | CreateOrgArtifactDeploymentRecordSuccess
        | CreateOrgArtifactDeploymentRecordFailure
        | CreateOrgInvitationSuccess
        | CreateOrgInvitationFailure
        | CreateOrgIssueFieldSuccess
        | CreateOrgIssueFieldFailure
        | CreateOrgIssueTypeSuccess
        | CreateOrgIssueTypeFailure
        | CreateOrgMetadataStorageRecordSuccess
        | CreateOrgMetadataStorageRecordFailure
        | CreateRepoAttestationSuccess
        | CreateRepoAttestationFailure
        | CreateRepoAutolinkSuccess
        | CreateRepoAutolinkFailure
        | CreateRepoDispatchSuccess
        | CreateRepoDispatchFailure
        | CreateUpdateRepoCustomPropertyValuesSuccess
        | CreateUpdateRepoCustomPropertyValuesFailure
        | CreateUpdateOrgCustomPropertyValuesSuccess
        | CreateUpdateOrgCustomPropertyValuesFailure
        | CreateRepoSuccess
        | CreateRepoFailure
        | DeleteRepoSuccess
        | DeleteRepoFailure
        | DeleteFileSuccess
        | DeleteFileFailure
        | DeleteOrgAttestationByIdSuccess
        | DeleteOrgAttestationByIdFailure
        | DeleteOrgAttestationBySubjectDigestSuccess
        | DeleteOrgAttestationBySubjectDigestFailure
        | DeleteOrgAttestationsBulkSuccess
        | DeleteOrgAttestationsBulkFailure
        | DeleteOrgSuccess
        | DeleteOrgFailure
        | DeleteOrgCustomPropertySuccess
        | DeleteOrgCustomPropertyFailure
        | DeleteOrgIssueFieldSuccess
        | DeleteOrgIssueFieldFailure
        | DeleteOrgIssueTypeSuccess
        | DeleteOrgIssueTypeFailure
        | DeleteRepoRulesetSuccess
        | DeleteRepoRulesetFailure
        | DeleteRepoWebhookSuccess
        | DeleteRepoWebhookFailure
        | DeleteRepoAutolinkSuccess
        | DeleteRepoAutolinkFailure
        | DownloadRepoArchiveTarSuccess
        | DownloadRepoArchiveTarFailure
        | DownloadRepoArchiveZipSuccess
        | DownloadRepoArchiveZipFailure
        | GetOrgSuccess
        | GetOrgFailure
        | GetOrgCustomPropertiesSuccess
        | GetOrgCustomPropertiesFailure
        | GetOrgCustomPropertySuccess
        | GetOrgCustomPropertyFailure
        | GetOrgCustomPropertyValuesSuccess
        | GetOrgCustomPropertyValuesFailure
        | GetOrgImmutableReleasesSettingsSuccess
        | GetOrgImmutableReleasesSettingsFailure
        | GetRouteStatsByActorSuccess
        | GetRouteStatsByActorFailure
        | GetSubjectStatsSuccess
        | GetSubjectStatsFailure
        | GetSummaryStatsByActorSuccess
        | GetSummaryStatsByActorFailure
        | GetSummaryStatsByUserSuccess
        | GetSummaryStatsByUserFailure
        | GetSummaryStatsSuccess
        | GetSummaryStatsFailure
        | GetTimeStatsByActorSuccess
        | GetTimeStatsByActorFailure
        | GetTimeStatsByUserSuccess
        | GetTimeStatsByUserFailure
        | GetTimeStatsSuccess
        | GetTimeStatsFailure
        | GetUserStatsSuccess
        | GetUserStatsFailure
        | GetRepoSuccess
        | GetRepoFailure
        | GetRepoAutolinkSuccess
        | GetRepoAutolinkFailure
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
        | ListOrgArtifactDeploymentRecordsSuccess
        | ListOrgArtifactDeploymentRecordsFailure
        | ListOrgAttestationReposSuccess
        | ListOrgAttestationReposFailure
        | ListOrgAttestationsSuccess
        | ListOrgAttestationsFailure
        | ListOrgBlockedUsersSuccess
        | ListOrgBlockedUsersFailure
        | ListOrgFailedInvitationsSuccess
        | ListOrgFailedInvitationsFailure
        | ListOrgPendingInvitationsSuccess
        | ListOrgPendingInvitationsFailure
        | ListOrgIssueFieldsSuccess
        | ListOrgIssueFieldsFailure
        | ListOrgIssueTypesSuccess
        | ListOrgIssueTypesFailure
        | ListOrgMetadataStorageRecordsSuccess
        | ListOrgMetadataStorageRecordsFailure
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
        | SetOrgClusterDeploymentRecordsSuccess
        | SetOrgClusterDeploymentRecordsFailure
        | SetOrgImmutableReleasesSettingsSuccess
        | SetOrgImmutableReleasesSettingsFailure
        | TransferRepoSuccess
        | TransferRepoFailure
        | UnblockOrgUserSuccess
        | UnblockOrgUserFailure
        | UpdateOrgIssueFieldSuccess
        | UpdateOrgIssueFieldFailure
        | UpdateOrgIssueTypeSuccess
        | UpdateOrgIssueTypeFailure
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
