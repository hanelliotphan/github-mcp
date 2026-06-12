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
    CheckOrgMembershipForUserFailure,
    CheckOrgMembershipForUserSuccess,
    CheckOrgPublicMembershipForUserFailure,
    CheckOrgPublicMembershipForUserSuccess,
    RemoveOrgMemberFailure,
    RemoveOrgMemberSuccess,
    RemoveOrgMembershipForUserFailure,
    RemoveOrgMembershipForUserSuccess,
    RemovePublicOrgMembershipForAuthUserFailure,
    RemovePublicOrgMembershipForAuthUserSuccess,
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
    CreateOrgNetworkConfigurationFailure,
    CreateOrgNetworkConfigurationSuccess,
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
    DeleteOrgNetworkConfigurationFailure,
    DeleteOrgNetworkConfigurationSuccess,
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
    GetOrgMembershipForAuthUserFailure,
    GetOrgMembershipForAuthUserSuccess,
    GetOrgNetworkConfigurationFailure,
    GetOrgNetworkConfigurationSuccess,
    GetOrgNetworkSettingsFailure,
    GetOrgNetworkSettingsSuccess,
    GetOrgMembershipForUserFailure,
    GetOrgMembershipForUserSuccess,
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
    ListOrgMembersFailure,
    ListOrgMembersSuccess,
    ListOrgIssueFieldsFailure,
    ListOrgIssueFieldsSuccess,
    ListOrgIssueTypesFailure,
    ListOrgIssueTypesSuccess,
    ListOrgMetadataStorageRecordsFailure,
    ListOrgMetadataStorageRecordsSuccess,
    ListOrgNetworkConfigurationsFailure,
    ListOrgNetworkConfigurationsSuccess,
    ListOrgRolesFailure,
    ListOrgRolesSuccess,
    RemoveAllOrgRolesForTeamFailure,
    RemoveAllOrgRolesForTeamSuccess,
    AssignOrgRoleToTeamFailure,
    AssignOrgRoleToTeamSuccess,
    RemoveOrgRoleFromTeamFailure,
    RemoveOrgRoleFromTeamSuccess,
    RemoveAllOrgRolesForUserFailure,
    RemoveAllOrgRolesForUserSuccess,
    AssignOrgRoleToUserFailure,
    AssignOrgRoleToUserSuccess,
    RemoveOrgRoleFromUserFailure,
    RemoveOrgRoleFromUserSuccess,
    GetOrgRoleFailure,
    GetOrgRoleSuccess,
    ListTeamsAssignedToOrgRoleFailure,
    ListTeamsAssignedToOrgRoleSuccess,
    ListUsersAssignedToOrgRoleFailure,
    ListUsersAssignedToOrgRoleSuccess,
    ListOrgOutsideCollaboratorsFailure,
    ListOrgOutsideCollaboratorsSuccess,
    ConvertOrgMemberToOutsideCollaboratorFailure,
    ConvertOrgMemberToOutsideCollaboratorSuccess,
    RemoveOrgOutsideCollaboratorFailure,
    RemoveOrgOutsideCollaboratorSuccess,
    ListOrgPatRequestsFailure,
    ListOrgPatRequestsSuccess,
    ReviewOrgPatRequestsFailure,
    ReviewOrgPatRequestsSuccess,
    ReviewOrgPatRequestFailure,
    ReviewOrgPatRequestSuccess,
    ListOrgPatRequestRepositoriesFailure,
    ListOrgPatRequestRepositoriesSuccess,
    ListOrgPatsFailure,
    ListOrgPatsSuccess,
    UpdateOrgPatsFailure,
    UpdateOrgPatsSuccess,
    UpdateOrgPatFailure,
    UpdateOrgPatSuccess,
    ListOrgPatRepositoriesFailure,
    ListOrgPatRepositoriesSuccess,
    ListOrgRuleSuitesFailure,
    ListOrgRuleSuitesSuccess,
    GetOrgRuleSuiteFailure,
    GetOrgRuleSuiteSuccess,
    ListOrgRulesetsFailure,
    ListOrgRulesetsSuccess,
    CreateOrgRulesetFailure,
    CreateOrgRulesetSuccess,
    GetOrgRulesetFailure,
    GetOrgRulesetSuccess,
    UpdateOrgRulesetFailure,
    UpdateOrgRulesetSuccess,
    DeleteOrgRulesetFailure,
    DeleteOrgRulesetSuccess,
    GetOrgRulesetHistoryFailure,
    GetOrgRulesetHistorySuccess,
    ListOrgsForAuthenticatedUserFailure,
    ListOrgsForAuthenticatedUserSuccess,
    ListOrgsForUserFailure,
    ListOrgsForUserSuccess,
    ListOrgMembershipsForAuthUserFailure,
    ListOrgMembershipsForAuthUserSuccess,
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
    SetOrgMembershipForUserFailure,
    SetOrgMembershipForUserSuccess,
    SetPublicOrgMembershipForAuthUserFailure,
    SetPublicOrgMembershipForAuthUserSuccess,
    TransferRepoFailure,
    TransferRepoSuccess,
    UnblockOrgUserFailure,
    UnblockOrgUserSuccess,
    UpdateOrgIssueFieldFailure,
    UpdateOrgIssueFieldSuccess,
    UpdateOrgIssueTypeFailure,
    UpdateOrgIssueTypeSuccess,
    UpdateOrgMembershipForAuthUserFailure,
    UpdateOrgMembershipForAuthUserSuccess,
    UpdateOrgNetworkConfigurationFailure,
    UpdateOrgNetworkConfigurationSuccess,
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
        | CheckOrgMembershipForUserSuccess
        | CheckOrgMembershipForUserFailure
        | CheckOrgPublicMembershipForUserSuccess
        | CheckOrgPublicMembershipForUserFailure
        | RemoveOrgMemberSuccess
        | RemoveOrgMemberFailure
        | RemoveOrgMembershipForUserSuccess
        | RemoveOrgMembershipForUserFailure
        | RemovePublicOrgMembershipForAuthUserSuccess
        | RemovePublicOrgMembershipForAuthUserFailure
        | CancelOrgInvitationSuccess
        | CancelOrgInvitationFailure
        | ListOrgInvitationTeamsSuccess
        | ListOrgInvitationTeamsFailure
        | ListOrgMembersSuccess
        | ListOrgMembersFailure
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
        | CreateOrgNetworkConfigurationSuccess
        | CreateOrgNetworkConfigurationFailure
        | GetOrgNetworkConfigurationSuccess
        | GetOrgNetworkConfigurationFailure
        | GetOrgNetworkSettingsSuccess
        | GetOrgNetworkSettingsFailure
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
        | DeleteOrgNetworkConfigurationSuccess
        | DeleteOrgNetworkConfigurationFailure
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
        | GetOrgMembershipForAuthUserSuccess
        | GetOrgMembershipForAuthUserFailure
        | GetOrgMembershipForUserSuccess
        | GetOrgMembershipForUserFailure
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
        | ListOrgNetworkConfigurationsSuccess
        | ListOrgNetworkConfigurationsFailure
        | ListOrgRolesSuccess
        | ListOrgRolesFailure
        | RemoveAllOrgRolesForTeamSuccess
        | RemoveAllOrgRolesForTeamFailure
        | AssignOrgRoleToTeamSuccess
        | AssignOrgRoleToTeamFailure
        | RemoveOrgRoleFromTeamSuccess
        | RemoveOrgRoleFromTeamFailure
        | RemoveAllOrgRolesForUserSuccess
        | RemoveAllOrgRolesForUserFailure
        | AssignOrgRoleToUserSuccess
        | AssignOrgRoleToUserFailure
        | RemoveOrgRoleFromUserSuccess
        | RemoveOrgRoleFromUserFailure
        | GetOrgRoleSuccess
        | GetOrgRoleFailure
        | ListTeamsAssignedToOrgRoleSuccess
        | ListTeamsAssignedToOrgRoleFailure
        | ListUsersAssignedToOrgRoleSuccess
        | ListUsersAssignedToOrgRoleFailure
        | ListOrgOutsideCollaboratorsSuccess
        | ListOrgOutsideCollaboratorsFailure
        | ConvertOrgMemberToOutsideCollaboratorSuccess
        | ConvertOrgMemberToOutsideCollaboratorFailure
        | RemoveOrgOutsideCollaboratorSuccess
        | RemoveOrgOutsideCollaboratorFailure
        | ListOrgPatRequestsSuccess
        | ListOrgPatRequestsFailure
        | ReviewOrgPatRequestsSuccess
        | ReviewOrgPatRequestsFailure
        | ReviewOrgPatRequestSuccess
        | ReviewOrgPatRequestFailure
        | ListOrgPatRequestRepositoriesSuccess
        | ListOrgPatRequestRepositoriesFailure
        | ListOrgPatsSuccess
        | ListOrgPatsFailure
        | UpdateOrgPatsSuccess
        | UpdateOrgPatsFailure
        | UpdateOrgPatSuccess
        | UpdateOrgPatFailure
        | ListOrgPatRepositoriesSuccess
        | ListOrgPatRepositoriesFailure
        | ListOrgRuleSuitesSuccess
        | ListOrgRuleSuitesFailure
        | GetOrgRuleSuiteSuccess
        | GetOrgRuleSuiteFailure
        | ListOrgRulesetsSuccess
        | ListOrgRulesetsFailure
        | CreateOrgRulesetSuccess
        | CreateOrgRulesetFailure
        | GetOrgRulesetSuccess
        | GetOrgRulesetFailure
        | UpdateOrgRulesetSuccess
        | UpdateOrgRulesetFailure
        | DeleteOrgRulesetSuccess
        | DeleteOrgRulesetFailure
        | GetOrgRulesetHistorySuccess
        | GetOrgRulesetHistoryFailure
        | ListOrgsForAuthenticatedUserSuccess
        | ListOrgsForAuthenticatedUserFailure
        | ListOrgsForUserSuccess
        | ListOrgsForUserFailure
        | ListOrgMembershipsForAuthUserSuccess
        | ListOrgMembershipsForAuthUserFailure
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
        | SetOrgMembershipForUserSuccess
        | SetOrgMembershipForUserFailure
        | SetPublicOrgMembershipForAuthUserSuccess
        | SetPublicOrgMembershipForAuthUserFailure
        | TransferRepoSuccess
        | TransferRepoFailure
        | UnblockOrgUserSuccess
        | UnblockOrgUserFailure
        | UpdateOrgIssueFieldSuccess
        | UpdateOrgIssueFieldFailure
        | UpdateOrgIssueTypeSuccess
        | UpdateOrgIssueTypeFailure
        | UpdateOrgMembershipForAuthUserSuccess
        | UpdateOrgMembershipForAuthUserFailure
        | UpdateOrgNetworkConfigurationSuccess
        | UpdateOrgNetworkConfigurationFailure
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
