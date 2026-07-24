import type {
    AddAppAccessRestrictionsFailure,
    AddAppAccessRestrictionsSuccess,
    AddCustomLabelsToSelfHostedRunnerForOrgFailure,
    AddCustomLabelsToSelfHostedRunnerForOrgSuccess,
    AddCustomLabelsToSelfHostedRunnerForRepoFailure,
    AddCustomLabelsToSelfHostedRunnerForRepoSuccess,
    AddOrgCodespacesAccessUsersFailure,
    AddOrgCodespacesAccessUsersSuccess,
    AddOrgSecurityManagerTeamFailure,
    AddOrgSecurityManagerTeamSuccess,
    AddRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    AddRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    AddRepoToAppInstallationFailure,
    AddRepoToAppInstallationSuccess,
    AddRepoToUserCodespacesSecretFailure,
    AddRepoToUserCodespacesSecretSuccess,
    AddResourcesToEnterpriseCostCenterFailure,
    AddResourcesToEnterpriseCostCenterSuccess,
    AddSelectedRepoToOrgActionsSecretFailure,
    AddSelectedRepoToOrgActionsSecretSuccess,
    AddSelectedRepoToOrgActionsVariableFailure,
    AddSelectedRepoToOrgActionsVariableSuccess,
    AddSelectedRepoToOrgAgentSecretFailure,
    AddSelectedRepoToOrgAgentSecretSuccess,
    AddSelectedRepoToOrgAgentVariableFailure,
    AddSelectedRepoToOrgAgentVariableSuccess,
    AddSelectedRepoToOrgCodespacesSecretFailure,
    AddSelectedRepoToOrgCodespacesSecretSuccess,
    AddSelfHostedRunnerToGroupForOrgFailure,
    AddSelfHostedRunnerToGroupForOrgSuccess,
    AddStatusCheckContextsFailure,
    AddStatusCheckContextsSuccess,
    AddTeamAccessRestrictionsFailure,
    AddTeamAccessRestrictionsSuccess,
    AddUserAccessRestrictionsFailure,
    AddUserAccessRestrictionsSuccess,
    ApproveWorkflowRunFailure,
    ApproveWorkflowRunSuccess,
    AssignOrgRoleToTeamFailure,
    AssignOrgRoleToTeamSuccess,
    AssignOrgRoleToUserFailure,
    AssignOrgRoleToUserSuccess,
    AttachEnterpriseCodeSecurityConfigurationFailure,
    AttachEnterpriseCodeSecurityConfigurationSuccess,
    AttachOrgCodeSecurityConfigurationFailure,
    AttachOrgCodeSecurityConfigurationSuccess,
    BlockOrgUserFailure,
    BlockOrgUserSuccess,
    BulkListOrgAttestationsFailure,
    BulkListOrgAttestationsSuccess,
    CancelOrgInvitationFailure,
    CancelOrgInvitationSuccess,
    CancelWorkflowRunFailure,
    CancelWorkflowRunSuccess,
    CheckAppTokenFailure,
    CheckAppTokenSuccess,
    CheckDependabotSecurityUpdatesFailure,
    CheckDependabotSecurityUpdatesSuccess,
    CheckImmutableReleasesFailure,
    CheckImmutableReleasesSuccess,
    CheckOrgBlockedUserFailure,
    CheckOrgBlockedUserSuccess,
    CheckOrgMembershipForUserFailure,
    CheckOrgMembershipForUserSuccess,
    CheckOrgPublicMembershipForUserFailure,
    CheckOrgPublicMembershipForUserSuccess,
    CheckPrivateVulnerabilityReportingFailure,
    CheckPrivateVulnerabilityReportingSuccess,
    CheckRepoCodespacePermissionsFailure,
    CheckRepoCodespacePermissionsSuccess,
    CheckRepoIsStarredByAuthenticatedUserFailure,
    CheckRepoIsStarredByAuthenticatedUserSuccess,
    CheckVulnerabilityAlertsFailure,
    CheckVulnerabilityAlertsSuccess,
    CommitCodeScanningAutofixFailure,
    CommitCodeScanningAutofixSuccess,
    ConvertOrgMemberToOutsideCollaboratorFailure,
    ConvertOrgMemberToOutsideCollaboratorSuccess,
    CreateCheckRunFailure,
    CreateCheckRunSuccess,
    CreateCheckSuiteFailure,
    CreateCheckSuiteSuccess,
    CreateCodeqlVariantAnalysisFailure,
    CreateCodeqlVariantAnalysisSuccess,
    CreateCodeScanningAutofixFailure,
    CreateCodeScanningAutofixSuccess,
    CreateCommitSignatureProtectionFailure,
    CreateCommitSignatureProtectionSuccess,
    CreateEnterpriseCodeSecurityConfigurationFailure,
    CreateEnterpriseCodeSecurityConfigurationSuccess,
    CreateEnterpriseCostCenterFailure,
    CreateEnterpriseCostCenterSuccess,
    CreateEnterpriseUsageReportExportFailure,
    CreateEnterpriseUsageReportExportSuccess,
    CreateEnvironmentActionsVariableFailure,
    CreateEnvironmentActionsVariableSuccess,
    CreateGithubAppFromManifestFailure,
    CreateGithubAppFromManifestSuccess,
    CreateHostedRunnerForOrgFailure,
    CreateHostedRunnerForOrgSuccess,
    CreateInstallationAccessTokenFailure,
    CreateInstallationAccessTokenSuccess,
    CreateOrgActionsVariableFailure,
    CreateOrgActionsVariableSuccess,
    CreateOrgAgentVariableFailure,
    CreateOrgAgentVariableSuccess,
    CreateOrgArtifactDeploymentRecordFailure,
    CreateOrgArtifactDeploymentRecordSuccess,
    CreateOrgBudgetFailure,
    CreateOrgBudgetSuccess,
    CreateOrgCampaignFailure,
    CreateOrgCampaignSuccess,
    CreateOrgCodeSecurityConfigurationFailure,
    CreateOrgCodeSecurityConfigurationSuccess,
    CreateOrgInvitationFailure,
    CreateOrgInvitationSuccess,
    CreateOrgIssueFieldFailure,
    CreateOrgIssueFieldSuccess,
    CreateOrgIssueTypeFailure,
    CreateOrgIssueTypeSuccess,
    CreateOrgMetadataStorageRecordFailure,
    CreateOrgMetadataStorageRecordSuccess,
    CreateOrgNetworkConfigurationFailure,
    CreateOrgNetworkConfigurationSuccess,
    CreateOrgRulesetFailure,
    CreateOrgRulesetSuccess,
    CreateOrgWebhookFailure,
    CreateOrgWebhookSuccess,
    CreateOrUpdateEnvironmentActionsSecretFailure,
    CreateOrUpdateEnvironmentActionsSecretSuccess,
    CreateOrUpdateOrgActionsSecretFailure,
    CreateOrUpdateOrgActionsSecretSuccess,
    CreateOrUpdateOrgAgentSecretFailure,
    CreateOrUpdateOrgAgentSecretSuccess,
    CreateOrUpdateOrgCodespacesSecretFailure,
    CreateOrUpdateOrgCodespacesSecretSuccess,
    CreateOrUpdateRepoActionsSecretFailure,
    CreateOrUpdateRepoActionsSecretSuccess,
    CreateOrUpdateRepoAgentSecretFailure,
    CreateOrUpdateRepoAgentSecretSuccess,
    CreateOrUpdateRepoCodespacesSecretFailure,
    CreateOrUpdateRepoCodespacesSecretSuccess,
    CreateOrUpdateUserCodespacesSecretFailure,
    CreateOrUpdateUserCodespacesSecretSuccess,
    CreatePullRequestCodespaceFailure,
    CreatePullRequestCodespaceSuccess,
    CreateRegistrationTokenForOrgFailure,
    CreateRegistrationTokenForOrgSuccess,
    CreateRegistrationTokenForRepoFailure,
    CreateRegistrationTokenForRepoSuccess,
    CreateRemoveTokenForOrgFailure,
    CreateRemoveTokenForOrgSuccess,
    CreateRemoveTokenForRepoFailure,
    CreateRemoveTokenForRepoSuccess,
    CreateRepoActionsVariableFailure,
    CreateRepoActionsVariableSuccess,
    CreateRepoAgentVariableFailure,
    CreateRepoAgentVariableSuccess,
    CreateRepoAttestationFailure,
    CreateRepoAttestationSuccess,
    CreateRepoAutolinkFailure,
    CreateRepoAutolinkSuccess,
    CreateRepoCodespaceFailure,
    CreateRepoCodespaceSuccess,
    CreateRepoDispatchFailure,
    CreateRepoDispatchSuccess,
    CreateRepoFailure,
    CreateRepoForkFailure,
    CreateRepoForkSuccess,
    CreateRepoRulesetFailure,
    CreateRepoRulesetSuccess,
    CreateRepoSuccess,
    CreateRepoWebhookFailure,
    CreateRepoWebhookSuccess,
    CreateScopedAccessTokenFailure,
    CreateScopedAccessTokenSuccess,
    CreateSelfHostedRunnerGroupForOrgFailure,
    CreateSelfHostedRunnerGroupForOrgSuccess,
    CreateUpdateFileContentsFailure,
    CreateUpdateFileContentsSuccess,
    CreateUpdateOrgCustomPropertyValuesFailure,
    CreateUpdateOrgCustomPropertyValuesSuccess,
    CreateUpdateRepoCustomPropertyValuesFailure,
    CreateUpdateRepoCustomPropertyValuesSuccess,
    CreateUserCodespaceFailure,
    CreateUserCodespaceSuccess,
    CreateWorkflowDispatchFailure,
    CreateWorkflowDispatchSuccess,
    DeleteAccessRestrictionsFailure,
    DeleteAccessRestrictionsSuccess,
    DeleteActionsCacheByIdFailure,
    DeleteActionsCacheByIdSuccess,
    DeleteActionsCacheByKeyFailure,
    DeleteActionsCacheByKeySuccess,
    DeleteAdminBranchProtectionFailure,
    DeleteAdminBranchProtectionSuccess,
    DeleteAppAuthorizationFailure,
    DeleteAppAuthorizationSuccess,
    DeleteAppTokenFailure,
    DeleteAppTokenSuccess,
    DeleteArtifactFailure,
    DeleteArtifactSuccess,
    DeleteCodeqlDatabaseFailure,
    DeleteCodeqlDatabaseSuccess,
    DeleteCodeScanningAnalysisFailure,
    DeleteCodeScanningAnalysisSuccess,
    DeleteCommitSignatureProtectionFailure,
    DeleteCommitSignatureProtectionSuccess,
    DeleteCustomImageFromOrgFailure,
    DeleteCustomImageFromOrgSuccess,
    DeleteCustomImageVersionFromOrgFailure,
    DeleteCustomImageVersionFromOrgSuccess,
    DeleteEnterpriseCodeSecurityConfigurationFailure,
    DeleteEnterpriseCodeSecurityConfigurationSuccess,
    DeleteEnterpriseCostCenterFailure,
    DeleteEnterpriseCostCenterSuccess,
    DeleteEnvironmentActionsSecretFailure,
    DeleteEnvironmentActionsSecretSuccess,
    DeleteEnvironmentActionsVariableFailure,
    DeleteEnvironmentActionsVariableSuccess,
    DeleteFileFailure,
    DeleteFileSuccess,
    DeleteHostedRunnerForOrgFailure,
    DeleteHostedRunnerForOrgSuccess,
    DeleteInstallationForAuthenticatedAppFailure,
    DeleteInstallationForAuthenticatedAppSuccess,
    DeleteOrgActionsSecretFailure,
    DeleteOrgActionsSecretSuccess,
    DeleteOrgActionsVariableFailure,
    DeleteOrgActionsVariableSuccess,
    DeleteOrgAgentSecretFailure,
    DeleteOrgAgentSecretSuccess,
    DeleteOrgAgentVariableFailure,
    DeleteOrgAgentVariableSuccess,
    DeleteOrgAttestationByIdFailure,
    DeleteOrgAttestationByIdSuccess,
    DeleteOrgAttestationBySubjectDigestFailure,
    DeleteOrgAttestationBySubjectDigestSuccess,
    DeleteOrgAttestationsBulkFailure,
    DeleteOrgAttestationsBulkSuccess,
    DeleteOrgBudgetFailure,
    DeleteOrgBudgetSuccess,
    DeleteOrgCampaignFailure,
    DeleteOrgCampaignSuccess,
    DeleteOrgCodeSecurityConfigurationFailure,
    DeleteOrgCodeSecurityConfigurationSuccess,
    DeleteOrgCodespacesSecretFailure,
    DeleteOrgCodespacesSecretSuccess,
    DeleteOrgCustomPropertyFailure,
    DeleteOrgCustomPropertySuccess,
    DeleteOrgFailure,
    DeleteOrgIssueFieldFailure,
    DeleteOrgIssueFieldSuccess,
    DeleteOrgIssueTypeFailure,
    DeleteOrgIssueTypeSuccess,
    DeleteOrgNetworkConfigurationFailure,
    DeleteOrgNetworkConfigurationSuccess,
    DeleteOrgRulesetFailure,
    DeleteOrgRulesetSuccess,
    DeleteOrgSuccess,
    DeleteOrgUserCodespaceFailure,
    DeleteOrgUserCodespaceSuccess,
    DeleteOrgWebhookFailure,
    DeleteOrgWebhookSuccess,
    DeletePullRequestReviewProtectionFailure,
    DeletePullRequestReviewProtectionSuccess,
    DeleteRepoActionsSecretFailure,
    DeleteRepoActionsSecretSuccess,
    DeleteRepoActionsVariableFailure,
    DeleteRepoActionsVariableSuccess,
    DeleteRepoAgentSecretFailure,
    DeleteRepoAgentSecretSuccess,
    DeleteRepoAgentVariableFailure,
    DeleteRepoAgentVariableSuccess,
    DeleteRepoAutolinkFailure,
    DeleteRepoAutolinkSuccess,
    DeleteRepoBranchProtectionFailure,
    DeleteRepoBranchProtectionSuccess,
    DeleteRepoCodespacesSecretFailure,
    DeleteRepoCodespacesSecretSuccess,
    DeleteRepoFailure,
    DeleteRepoRulesetFailure,
    DeleteRepoRulesetSuccess,
    DeleteRepoSubscriptionFailure,
    DeleteRepoSubscriptionSuccess,
    DeleteRepoSuccess,
    DeleteRepoWebhookFailure,
    DeleteRepoWebhookSuccess,
    DeleteSelfHostedRunnerFromOrgFailure,
    DeleteSelfHostedRunnerFromOrgSuccess,
    DeleteSelfHostedRunnerFromRepoFailure,
    DeleteSelfHostedRunnerFromRepoSuccess,
    DeleteSelfHostedRunnerGroupFromOrgFailure,
    DeleteSelfHostedRunnerGroupFromOrgSuccess,
    DeleteThreadSubscriptionFailure,
    DeleteThreadSubscriptionSuccess,
    DeleteUserCodespaceFailure,
    DeleteUserCodespacesSecretFailure,
    DeleteUserCodespacesSecretSuccess,
    DeleteUserCodespaceSuccess,
    DeleteWorkflowRunFailure,
    DeleteWorkflowRunLogsFailure,
    DeleteWorkflowRunLogsSuccess,
    DeleteWorkflowRunSuccess,
    DetachOrgCodeSecurityConfigurationsFailure,
    DetachOrgCodeSecurityConfigurationsSuccess,
    DisableDependabotSecurityUpdatesFailure,
    DisableDependabotSecurityUpdatesSuccess,
    DisableImmutableReleasesFailure,
    DisableImmutableReleasesForOrgRepoFailure,
    DisableImmutableReleasesForOrgRepoSuccess,
    DisableImmutableReleasesSuccess,
    DisablePrivateVulnerabilityReportingFailure,
    DisablePrivateVulnerabilityReportingSuccess,
    DisableSelectedRepositoryGithubActionsOrganizationFailure,
    DisableSelectedRepositoryGithubActionsOrganizationSuccess,
    DisableVulnerabilityAlertsFailure,
    DisableVulnerabilityAlertsSuccess,
    DisableWorkflowFailure,
    DisableWorkflowSuccess,
    DownloadArtifactFailure,
    DownloadArtifactSuccess,
    DownloadJobLogsForWorkflowRunFailure,
    DownloadJobLogsForWorkflowRunSuccess,
    DownloadRepoArchiveTarFailure,
    DownloadRepoArchiveTarSuccess,
    DownloadRepoArchiveZipFailure,
    DownloadRepoArchiveZipSuccess,
    DownloadWorkflowRunAttemptLogsFailure,
    DownloadWorkflowRunAttemptLogsSuccess,
    DownloadWorkflowRunLogsFailure,
    DownloadWorkflowRunLogsSuccess,
    EnableDependabotSecurityUpdatesFailure,
    EnableDependabotSecurityUpdatesSuccess,
    EnableImmutableReleasesFailure,
    EnableImmutableReleasesForOrgRepoFailure,
    EnableImmutableReleasesForOrgRepoSuccess,
    EnableImmutableReleasesSuccess,
    EnableOrDisableOrgSecurityFeatureFailure,
    EnableOrDisableOrgSecurityFeatureSuccess,
    EnablePrivateVulnerabilityReportingFailure,
    EnablePrivateVulnerabilityReportingSuccess,
    EnableSelectedRepositoryGithubActionsOrganizationFailure,
    EnableSelectedRepositoryGithubActionsOrganizationSuccess,
    EnableVulnerabilityAlertsFailure,
    EnableVulnerabilityAlertsSuccess,
    EnableWorkflowFailure,
    EnableWorkflowSuccess,
    ExportUserCodespaceFailure,
    ExportUserCodespaceSuccess,
    ForceCancelWorkflowRunFailure,
    ForceCancelWorkflowRunSuccess,
    GenerateRunnerJitconfigForOrgFailure,
    GenerateRunnerJitconfigForOrgSuccess,
    GenerateRunnerJitconfigForRepoFailure,
    GenerateRunnerJitconfigForRepoSuccess,
    GetAccessRestrictionsFailure,
    GetAccessRestrictionsSuccess,
    GetActionsCacheUsageByRepoForOrgFailure,
    GetActionsCacheUsageByRepoForOrgSuccess,
    GetActionsCacheUsageForOrgFailure,
    GetActionsCacheUsageForOrgSuccess,
    GetActionsCacheUsageForRepoFailure,
    GetActionsCacheUsageForRepoSuccess,
    GetAdminBranchProtectionFailure,
    GetAdminBranchProtectionSuccess,
    GetAgentTaskFailure,
    GetAgentTaskForRepoFailure,
    GetAgentTaskForRepoSuccess,
    GetAgentTaskSuccess,
    GetAllowedActionsOrganizationFailure,
    GetAllowedActionsOrganizationSuccess,
    GetAllowedActionsRepositoryFailure,
    GetAllowedActionsRepositorySuccess,
    GetAllStatusCheckContextsFailure,
    GetAllStatusCheckContextsSuccess,
    GetAppFailure,
    GetAppSuccess,
    GetAppsWithAccessToProtectedBranchFailure,
    GetAppsWithAccessToProtectedBranchSuccess,
    GetAppWebhookConfigFailure,
    GetAppWebhookConfigSuccess,
    GetAppWebhookDeliveryFailure,
    GetAppWebhookDeliverySuccess,
    GetArtifactFailure,
    GetArtifactSuccess,
    GetAuthenticatedAppFailure,
    GetAuthenticatedAppSuccess,
    GetCheckRunFailure,
    GetCheckRunSuccess,
    GetCheckSuiteFailure,
    GetCheckSuiteSuccess,
    GetClassroomAssignmentFailure,
    GetClassroomAssignmentGradesFailure,
    GetClassroomAssignmentGradesSuccess,
    GetClassroomAssignmentSuccess,
    GetClassroomFailure,
    GetClassroomSuccess,
    GetCodeOfConductFailure,
    GetCodeOfConductSuccess,
    GetCodeqlDatabaseFailure,
    GetCodeqlDatabaseSuccess,
    GetCodeqlVariantAnalysisFailure,
    GetCodeqlVariantAnalysisRepoTaskFailure,
    GetCodeqlVariantAnalysisRepoTaskSuccess,
    GetCodeqlVariantAnalysisSuccess,
    GetCodeScanningAlertFailure,
    GetCodeScanningAlertSuccess,
    GetCodeScanningAnalysisFailure,
    GetCodeScanningAnalysisSuccess,
    GetCodeScanningAutofixFailure,
    GetCodeScanningAutofixSuccess,
    GetCodeScanningDefaultSetupFailure,
    GetCodeScanningDefaultSetupSuccess,
    GetCodeScanningSarifFailure,
    GetCodeScanningSarifSuccess,
    GetCommitSignatureProtectionFailure,
    GetCommitSignatureProtectionSuccess,
    GetConcurrencyGroupFailure,
    GetConcurrencyGroupSuccess,
    GetCustomImageForOrgFailure,
    GetCustomImageForOrgSuccess,
    GetCustomImageVersionForOrgFailure,
    GetCustomImageVersionForOrgSuccess,
    GetCustomOidcSubClaimForRepoFailure,
    GetCustomOidcSubClaimForRepoSuccess,
    GetEnterpriseCodeSecurityConfigurationFailure,
    GetEnterpriseCodeSecurityConfigurationSuccess,
    GetEnterpriseCostCenterFailure,
    GetEnterpriseCostCenterSuccess,
    GetEnterpriseUsageReportExportFailure,
    GetEnterpriseUsageReportExportSuccess,
    GetEnvironmentActionsPublicKeyFailure,
    GetEnvironmentActionsPublicKeySuccess,
    GetEnvironmentActionsSecretFailure,
    GetEnvironmentActionsSecretSuccess,
    GetEnvironmentActionsVariableFailure,
    GetEnvironmentActionsVariableSuccess,
    GetFeedsFailure,
    GetFeedsSuccess,
    GetGithubActionsDefaultWorkflowPermissionsOrganizationFailure,
    GetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess,
    GetGithubActionsDefaultWorkflowPermissionsRepositoryFailure,
    GetGithubActionsDefaultWorkflowPermissionsRepositorySuccess,
    GetGithubActionsPermissionsOrganizationFailure,
    GetGithubActionsPermissionsOrganizationSuccess,
    GetGithubActionsPermissionsRepositoryFailure,
    GetGithubActionsPermissionsRepositorySuccess,
    GetHostedRunnerForOrgFailure,
    GetHostedRunnerForOrgSuccess,
    GetHostedRunnersGithubOwnedImagesForOrgFailure,
    GetHostedRunnersGithubOwnedImagesForOrgSuccess,
    GetHostedRunnersLimitsForOrgFailure,
    GetHostedRunnersLimitsForOrgSuccess,
    GetHostedRunnersMachineSpecsForOrgFailure,
    GetHostedRunnersMachineSpecsForOrgSuccess,
    GetHostedRunnersPartnerImagesForOrgFailure,
    GetHostedRunnersPartnerImagesForOrgSuccess,
    GetHostedRunnersPlatformsForOrgFailure,
    GetHostedRunnersPlatformsForOrgSuccess,
    GetInstallationForAuthenticatedAppFailure,
    GetInstallationForAuthenticatedAppSuccess,
    GetJobForWorkflowRunFailure,
    GetJobForWorkflowRunSuccess,
    GetMarketplaceSubscriptionPlanForAccountFailure,
    GetMarketplaceSubscriptionPlanForAccountStubbedFailure,
    GetMarketplaceSubscriptionPlanForAccountStubbedSuccess,
    GetMarketplaceSubscriptionPlanForAccountSuccess,
    GetOidcCustomSubTemplateForOrgFailure,
    GetOidcCustomSubTemplateForOrgSuccess,
    GetOrgActionsPublicKeyFailure,
    GetOrgActionsPublicKeySuccess,
    GetOrgActionsSecretFailure,
    GetOrgActionsSecretSuccess,
    GetOrgActionsVariableFailure,
    GetOrgActionsVariableSuccess,
    GetOrgAdvancedSecurityActiveCommittersFailure,
    GetOrgAdvancedSecurityActiveCommittersSuccess,
    GetOrgAgentPublicKeyFailure,
    GetOrgAgentPublicKeySuccess,
    GetOrgAgentSecretFailure,
    GetOrgAgentSecretSuccess,
    GetOrgAgentVariableFailure,
    GetOrgAgentVariableSuccess,
    GetOrgAiCreditBillingUsageFailure,
    GetOrgAiCreditBillingUsageSuccess,
    GetOrgBillingUsageFailure,
    GetOrgBillingUsageSuccess,
    GetOrgBillingUsageSummaryFailure,
    GetOrgBillingUsageSummarySuccess,
    GetOrgBudgetFailure,
    GetOrgBudgetSuccess,
    GetOrgCampaignFailure,
    GetOrgCampaignSuccess,
    GetOrgCodeSecurityConfigurationFailure,
    GetOrgCodeSecurityConfigurationSuccess,
    GetOrgCodespacesPublicKeyFailure,
    GetOrgCodespacesPublicKeySuccess,
    GetOrgCodespacesSecretFailure,
    GetOrgCodespacesSecretSuccess,
    GetOrgCustomPropertiesFailure,
    GetOrgCustomPropertiesSuccess,
    GetOrgCustomPropertyFailure,
    GetOrgCustomPropertySuccess,
    GetOrgCustomPropertyValuesFailure,
    GetOrgCustomPropertyValuesSuccess,
    GetOrgFailure,
    GetOrgImmutableReleasesSettingsFailure,
    GetOrgImmutableReleasesSettingsSuccess,
    GetOrgInstallationForAuthenticatedAppFailure,
    GetOrgInstallationForAuthenticatedAppSuccess,
    GetOrgMembershipForAuthUserFailure,
    GetOrgMembershipForAuthUserSuccess,
    GetOrgMembershipForUserFailure,
    GetOrgMembershipForUserSuccess,
    GetOrgNetworkConfigurationFailure,
    GetOrgNetworkConfigurationSuccess,
    GetOrgNetworkSettingsFailure,
    GetOrgNetworkSettingsSuccess,
    GetOrgPremiumRequestBillingUsageFailure,
    GetOrgPremiumRequestBillingUsageSuccess,
    GetOrgRoleFailure,
    GetOrgRoleSuccess,
    GetOrgRulesetFailure,
    GetOrgRulesetHistoryFailure,
    GetOrgRulesetHistorySuccess,
    GetOrgRulesetSuccess,
    GetOrgRulesetVersionFailure,
    GetOrgRulesetVersionSuccess,
    GetOrgRuleSuiteFailure,
    GetOrgRuleSuiteSuccess,
    GetOrgSuccess,
    GetOrgWebhookConfigFailure,
    GetOrgWebhookConfigSuccess,
    GetOrgWebhookDeliveryFailure,
    GetOrgWebhookDeliverySuccess,
    GetOrgWebhookFailure,
    GetOrgWebhookSuccess,
    GetPendingDeploymentsForWorkflowRunFailure,
    GetPendingDeploymentsForWorkflowRunSuccess,
    GetPullRequestReviewProtectionFailure,
    GetPullRequestReviewProtectionSuccess,
    GetRepoActionsPublicKeyFailure,
    GetRepoActionsPublicKeySuccess,
    GetRepoActionsSecretFailure,
    GetRepoActionsSecretSuccess,
    GetRepoActionsVariableFailure,
    GetRepoActionsVariableSuccess,
    GetRepoAgentPublicKeyFailure,
    GetRepoAgentPublicKeySuccess,
    GetRepoAgentSecretFailure,
    GetRepoAgentSecretSuccess,
    GetRepoAgentVariableFailure,
    GetRepoAgentVariableSuccess,
    GetRepoAutolinkFailure,
    GetRepoAutolinkSuccess,
    GetRepoBranchFailure,
    GetRepoBranchProtectionFailure,
    GetRepoBranchProtectionSuccess,
    GetRepoBranchRulesFailure,
    GetRepoBranchRulesSuccess,
    GetRepoBranchSuccess,
    GetRepoCodeQualityFindingFailure,
    GetRepoCodeQualityFindingSuccess,
    GetRepoCodeQualitySetupFailure,
    GetRepoCodeQualitySetupSuccess,
    GetRepoCodeScanningDismissalRequestFailure,
    GetRepoCodeScanningDismissalRequestSuccess,
    GetRepoCodeSecurityConfigurationFailure,
    GetRepoCodeSecurityConfigurationSuccess,
    GetRepoCodespaceDefaultsFailure,
    GetRepoCodespaceDefaultsSuccess,
    GetRepoCodespacesPublicKeyFailure,
    GetRepoCodespacesPublicKeySuccess,
    GetRepoCodespacesSecretFailure,
    GetRepoCodespacesSecretSuccess,
    GetRepoContentFailure,
    GetRepoContentSuccess,
    GetRepoCustomPropertyValuesFailure,
    GetRepoCustomPropertyValuesSuccess,
    GetRepoFailure,
    GetRepoInstallationForAuthenticatedAppFailure,
    GetRepoInstallationForAuthenticatedAppSuccess,
    GetRepoReadmeFailure,
    GetRepoReadmeSuccess,
    GetRepoRulesetFailure,
    GetRepoRulesetHistoryFailure,
    GetRepoRulesetHistorySuccess,
    GetRepoRulesetSuccess,
    GetRepoRulesetVersionFailure,
    GetRepoRulesetVersionSuccess,
    GetRepoRuleSuiteFailure,
    GetRepoRuleSuiteSuccess,
    GetRepoSubscriptionFailure,
    GetRepoSubscriptionSuccess,
    GetRepoSuccess,
    GetRepoWebhookConfigFailure,
    GetRepoWebhookConfigSuccess,
    GetRepoWebhookDeliveryFailure,
    GetRepoWebhookDeliverySuccess,
    GetRepoWebhookFailure,
    GetRepoWebhookSuccess,
    GetReviewsForWorkflowRunFailure,
    GetReviewsForWorkflowRunSuccess,
    GetRouteStatsByActorFailure,
    GetRouteStatsByActorSuccess,
    GetSelfHostedRunnerForOrgFailure,
    GetSelfHostedRunnerForOrgSuccess,
    GetSelfHostedRunnerForRepoFailure,
    GetSelfHostedRunnerForRepoSuccess,
    GetSelfHostedRunnerGroupForOrgFailure,
    GetSelfHostedRunnerGroupForOrgSuccess,
    GetStatusChecksProtectionFailure,
    GetStatusChecksProtectionSuccess,
    GetSubjectStatsFailure,
    GetSubjectStatsSuccess,
    GetSummaryStatsByActorFailure,
    GetSummaryStatsByActorSuccess,
    GetSummaryStatsByUserFailure,
    GetSummaryStatsByUserSuccess,
    GetSummaryStatsFailure,
    GetSummaryStatsSuccess,
    GetTeamsWithAccessToProtectedBranchFailure,
    GetTeamsWithAccessToProtectedBranchSuccess,
    GetThreadFailure,
    GetThreadSubscriptionForAuthenticatedUserFailure,
    GetThreadSubscriptionForAuthenticatedUserSuccess,
    GetThreadSuccess,
    GetTimeStatsByActorFailure,
    GetTimeStatsByActorSuccess,
    GetTimeStatsByUserFailure,
    GetTimeStatsByUserSuccess,
    GetTimeStatsFailure,
    GetTimeStatsSuccess,
    GetUserAiCreditBillingUsageFailure,
    GetUserAiCreditBillingUsageSuccess,
    GetUserBillingUsageFailure,
    GetUserBillingUsageSuccess,
    GetUserBillingUsageSummaryFailure,
    GetUserBillingUsageSummarySuccess,
    GetUserCodespaceExportFailure,
    GetUserCodespaceExportSuccess,
    GetUserCodespaceFailure,
    GetUserCodespacesPublicKeyFailure,
    GetUserCodespacesPublicKeySuccess,
    GetUserCodespacesSecretFailure,
    GetUserCodespacesSecretSuccess,
    GetUserCodespaceSuccess,
    GetUserInstallationForAuthenticatedAppFailure,
    GetUserInstallationForAuthenticatedAppSuccess,
    GetUserPremiumRequestBillingUsageFailure,
    GetUserPremiumRequestBillingUsageSuccess,
    GetUserStatsFailure,
    GetUserStatsSuccess,
    GetUsersWithAccessToProtectedBranchFailure,
    GetUsersWithAccessToProtectedBranchSuccess,
    GetWorkflowAccessToRepositoryFailure,
    GetWorkflowAccessToRepositorySuccess,
    GetWorkflowFailure,
    GetWorkflowRunAttemptFailure,
    GetWorkflowRunAttemptSuccess,
    GetWorkflowRunFailure,
    GetWorkflowRunSuccess,
    GetWorkflowRunUsageFailure,
    GetWorkflowRunUsageSuccess,
    GetWorkflowSuccess,
    GetWorkflowUsageFailure,
    GetWorkflowUsageSuccess,
    ListAcceptedClassroomAssignmentsFailure,
    ListAcceptedClassroomAssignmentsSuccess,
    ListActionsCachesFailure,
    ListActionsCachesSuccess,
    ListAgentTasksFailure,
    ListAgentTasksForRepoFailure,
    ListAgentTasksForRepoSuccess,
    ListAgentTasksSuccess,
    ListAppInstallationsAccessibleToUserFailure,
    ListAppInstallationsAccessibleToUserSuccess,
    ListAppWebhookDeliveriesFailure,
    ListAppWebhookDeliveriesSuccess,
    ListArtifactsForRepoFailure,
    ListArtifactsForRepoSuccess,
    ListAuthenticatedUserReposFailure,
    ListAuthenticatedUserReposSuccess,
    ListCheckRunAnnotationsFailure,
    ListCheckRunAnnotationsSuccess,
    ListCheckRunsForRefFailure,
    ListCheckRunsForRefSuccess,
    ListCheckRunsForSuiteFailure,
    ListCheckRunsForSuiteSuccess,
    ListCheckSuitesForRefFailure,
    ListCheckSuitesForRefSuccess,
    ListClassroomAssignmentsFailure,
    ListClassroomAssignmentsSuccess,
    ListClassroomsFailure,
    ListClassroomsSuccess,
    ListCodeownersErrorsFailure,
    ListCodeownersErrorsSuccess,
    ListCodeqlDatabasesFailure,
    ListCodeqlDatabasesSuccess,
    ListCodeScanningAlertInstancesFailure,
    ListCodeScanningAlertInstancesSuccess,
    ListCodesOfConductFailure,
    ListCodesOfConductSuccess,
    ListConcurrencyGroupsForRepoFailure,
    ListConcurrencyGroupsForRepoSuccess,
    ListConcurrencyGroupsForWorkflowRunFailure,
    ListConcurrencyGroupsForWorkflowRunSuccess,
    ListCustomImagesForOrgFailure,
    ListCustomImagesForOrgSuccess,
    ListCustomImageVersionsForOrgFailure,
    ListCustomImageVersionsForOrgSuccess,
    ListEnterpriseCodeSecurityConfigurationRepositoriesFailure,
    ListEnterpriseCodeSecurityConfigurationRepositoriesSuccess,
    ListEnterpriseCodeSecurityConfigurationsFailure,
    ListEnterpriseCodeSecurityConfigurationsSuccess,
    ListEnterpriseCodeSecurityDefaultConfigurationsFailure,
    ListEnterpriseCodeSecurityDefaultConfigurationsSuccess,
    ListEnterpriseCostCentersFailure,
    ListEnterpriseCostCentersSuccess,
    ListEnterpriseUsageReportExportsFailure,
    ListEnterpriseUsageReportExportsSuccess,
    ListEnvironmentActionsSecretsFailure,
    ListEnvironmentActionsSecretsSuccess,
    ListEnvironmentActionsVariablesFailure,
    ListEnvironmentActionsVariablesSuccess,
    ListEventsForAuthenticatedUserFailure,
    ListEventsForAuthenticatedUserSuccess,
    ListGithubHostedRunnersInGroupForOrgFailure,
    ListGithubHostedRunnersInGroupForOrgSuccess,
    ListHostedRunnersForOrgFailure,
    ListHostedRunnersForOrgSuccess,
    ListImmutableReleasesForOrgReposFailure,
    ListImmutableReleasesForOrgReposSuccess,
    ListInstallationReposForAuthenticatedUserFailure,
    ListInstallationReposForAuthenticatedUserSuccess,
    ListInstallationRequestsForAuthenticatedAppFailure,
    ListInstallationRequestsForAuthenticatedAppSuccess,
    ListInstallationsForAuthenticatedAppFailure,
    ListInstallationsForAuthenticatedAppSuccess,
    ListJobsForWorkflowRunAttemptFailure,
    ListJobsForWorkflowRunAttemptSuccess,
    ListJobsForWorkflowRunFailure,
    ListJobsForWorkflowRunSuccess,
    ListLabelsForSelfHostedRunnerForOrgFailure,
    ListLabelsForSelfHostedRunnerForOrgSuccess,
    ListLabelsForSelfHostedRunnerForRepoFailure,
    ListLabelsForSelfHostedRunnerForRepoSuccess,
    ListMarketplaceAccountsForPlanFailure,
    ListMarketplaceAccountsForPlanStubbedFailure,
    ListMarketplaceAccountsForPlanStubbedSuccess,
    ListMarketplaceAccountsForPlanSuccess,
    ListMarketplacePlansFailure,
    ListMarketplacePlansStubbedFailure,
    ListMarketplacePlansStubbedSuccess,
    ListMarketplacePlansSuccess,
    ListMarketplacePurchasesForAuthenticatedUserFailure,
    ListMarketplacePurchasesForAuthenticatedUserStubbedFailure,
    ListMarketplacePurchasesForAuthenticatedUserStubbedSuccess,
    ListMarketplacePurchasesForAuthenticatedUserSuccess,
    ListNotificationsForAuthenticatedUserFailure,
    ListNotificationsForAuthenticatedUserSuccess,
    ListOrgActionsSecretsFailure,
    ListOrgActionsSecretsSuccess,
    ListOrgActionsVariablesFailure,
    ListOrgActionsVariablesSuccess,
    ListOrgAgentSecretsFailure,
    ListOrgAgentSecretsSuccess,
    ListOrgAgentVariablesFailure,
    ListOrgAgentVariablesSuccess,
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
    ListOrgBudgetsFailure,
    ListOrgBudgetsSuccess,
    ListOrgCampaignsFailure,
    ListOrgCampaignsSuccess,
    ListOrgCodeScanningAlertsFailure,
    ListOrgCodeScanningAlertsSuccess,
    ListOrgCodeScanningDismissalRequestsFailure,
    ListOrgCodeScanningDismissalRequestsSuccess,
    ListOrgCodeSecurityConfigurationRepositoriesFailure,
    ListOrgCodeSecurityConfigurationRepositoriesSuccess,
    ListOrgCodeSecurityConfigurationsFailure,
    ListOrgCodeSecurityConfigurationsSuccess,
    ListOrgCodeSecurityDefaultConfigurationsFailure,
    ListOrgCodeSecurityDefaultConfigurationsSuccess,
    ListOrgCodespacesFailure,
    ListOrgCodespacesSecretsFailure,
    ListOrgCodespacesSecretsSuccess,
    ListOrgCodespacesSuccess,
    ListOrgEventsForAuthenticatedUserFailure,
    ListOrgEventsForAuthenticatedUserSuccess,
    ListOrgFailedInvitationsFailure,
    ListOrgFailedInvitationsSuccess,
    ListOrgInvitationTeamsFailure,
    ListOrgInvitationTeamsSuccess,
    ListOrgIssueFieldsFailure,
    ListOrgIssueFieldsSuccess,
    ListOrgIssueTypesFailure,
    ListOrgIssueTypesSuccess,
    ListOrgMembersFailure,
    ListOrgMembershipsForAuthUserFailure,
    ListOrgMembershipsForAuthUserSuccess,
    ListOrgMembersSuccess,
    ListOrgMetadataStorageRecordsFailure,
    ListOrgMetadataStorageRecordsSuccess,
    ListOrgNetworkConfigurationsFailure,
    ListOrgNetworkConfigurationsSuccess,
    ListOrgOutsideCollaboratorsFailure,
    ListOrgOutsideCollaboratorsSuccess,
    ListOrgPatRepositoriesFailure,
    ListOrgPatRepositoriesSuccess,
    ListOrgPatRequestRepositoriesFailure,
    ListOrgPatRequestRepositoriesSuccess,
    ListOrgPatRequestsFailure,
    ListOrgPatRequestsSuccess,
    ListOrgPatsFailure,
    ListOrgPatsSuccess,
    ListOrgPendingInvitationsFailure,
    ListOrgPendingInvitationsSuccess,
    ListOrgReposFailure,
    ListOrgReposSuccess,
    ListOrgRolesFailure,
    ListOrgRolesSuccess,
    ListOrgRulesetsFailure,
    ListOrgRulesetsSuccess,
    ListOrgRuleSuitesFailure,
    ListOrgRuleSuitesSuccess,
    ListOrgSecurityManagerTeamsFailure,
    ListOrgSecurityManagerTeamsSuccess,
    ListOrgsForAuthenticatedUserFailure,
    ListOrgsForAuthenticatedUserSuccess,
    ListOrgsForUserFailure,
    ListOrgsForUserSuccess,
    ListOrgUserCodespacesFailure,
    ListOrgUserCodespacesSuccess,
    ListOrgWebhookDeliveriesFailure,
    ListOrgWebhookDeliveriesSuccess,
    ListOrgWebhooksFailure,
    ListOrgWebhooksSuccess,
    ListPublicEventsFailure,
    ListPublicEventsForRepoNetworkFailure,
    ListPublicEventsForRepoNetworkSuccess,
    ListPublicEventsForUserFailure,
    ListPublicEventsForUserSuccess,
    ListPublicEventsSuccess,
    ListPublicOrgEventsFailure,
    ListPublicOrgEventsSuccess,
    ListPublicReposFailure,
    ListPublicReposSuccess,
    ListReceivedEventsForUserFailure,
    ListReceivedEventsForUserSuccess,
    ListReceivedPublicEventsForUserFailure,
    ListReceivedPublicEventsForUserSuccess,
    ListRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    ListRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    ListRepoActionsSecretsFailure,
    ListRepoActionsSecretsSuccess,
    ListRepoActionsVariablesFailure,
    ListRepoActionsVariablesSuccess,
    ListRepoActivitiesFailure,
    ListRepoActivitiesSuccess,
    ListRepoAgentSecretsFailure,
    ListRepoAgentSecretsSuccess,
    ListRepoAgentVariablesFailure,
    ListRepoAgentVariablesSuccess,
    ListRepoAttestationsFailure,
    ListRepoAttestationsSuccess,
    ListRepoAutolinksFailure,
    ListRepoAutolinksSuccess,
    ListRepoBranchesFailure,
    ListRepoBranchesSuccess,
    ListRepoCodeQualityFindingsFailure,
    ListRepoCodeQualityFindingsSuccess,
    ListRepoCodeScanningAlertsFailure,
    ListRepoCodeScanningAlertsSuccess,
    ListRepoCodeScanningAnalysesFailure,
    ListRepoCodeScanningAnalysesSuccess,
    ListRepoCodeScanningDismissalRequestsFailure,
    ListRepoCodeScanningDismissalRequestsSuccess,
    ListRepoCodespaceDevcontainersFailure,
    ListRepoCodespaceDevcontainersSuccess,
    ListRepoCodespaceMachinesFailure,
    ListRepoCodespaceMachinesSuccess,
    ListRepoCodespacesFailure,
    ListRepoCodespacesSecretsFailure,
    ListRepoCodespacesSecretsSuccess,
    ListRepoCodespacesSuccess,
    ListRepoContributorsFailure,
    ListRepoContributorsSuccess,
    ListRepoEventsFailure,
    ListRepoEventsSuccess,
    ListRepoForksFailure,
    ListRepoForksSuccess,
    ListRepoLanguagesFailure,
    ListRepoLanguagesSuccess,
    ListRepoNotificationsForAuthenticatedUserFailure,
    ListRepoNotificationsForAuthenticatedUserSuccess,
    ListRepoOrganizationActionsSecretsFailure,
    ListRepoOrganizationActionsSecretsSuccess,
    ListRepoOrganizationActionsVariablesFailure,
    ListRepoOrganizationActionsVariablesSuccess,
    ListRepoOrganizationAgentSecretsFailure,
    ListRepoOrganizationAgentSecretsSuccess,
    ListRepoOrganizationAgentVariablesFailure,
    ListRepoOrganizationAgentVariablesSuccess,
    ListRepoRulesetsFailure,
    ListRepoRulesetsSuccess,
    ListRepoRuleSuitesFailure,
    ListRepoRuleSuitesSuccess,
    ListReposAccessibleToInstallationFailure,
    ListReposAccessibleToInstallationSuccess,
    ListReposForUserCodespacesSecretFailure,
    ListReposForUserCodespacesSecretSuccess,
    ListReposStarredByAuthenticatedUserFailure,
    ListReposStarredByAuthenticatedUserSuccess,
    ListReposStarredByUserFailure,
    ListReposStarredByUserSuccess,
    ListReposWatchedByUserFailure,
    ListReposWatchedByUserSuccess,
    ListRepoTagsFailure,
    ListRepoTagsSuccess,
    ListRepoTeamsFailure,
    ListRepoTeamsSuccess,
    ListRepoTopicsFailure,
    ListRepoTopicsSuccess,
    ListRepoWebhookDeliveriesFailure,
    ListRepoWebhookDeliveriesSuccess,
    ListRepoWebhooksFailure,
    ListRepoWebhooksSuccess,
    ListRepoWorkflowsFailure,
    ListRepoWorkflowsSuccess,
    ListRunnerApplicationsForOrgFailure,
    ListRunnerApplicationsForOrgSuccess,
    ListRunnerApplicationsForRepoFailure,
    ListRunnerApplicationsForRepoSuccess,
    ListSelectedReposForOrgActionsSecretFailure,
    ListSelectedReposForOrgActionsSecretSuccess,
    ListSelectedReposForOrgActionsVariableFailure,
    ListSelectedReposForOrgActionsVariableSuccess,
    ListSelectedReposForOrgAgentSecretFailure,
    ListSelectedReposForOrgAgentSecretSuccess,
    ListSelectedReposForOrgAgentVariableFailure,
    ListSelectedReposForOrgAgentVariableSuccess,
    ListSelectedReposForOrgCodespacesSecretFailure,
    ListSelectedReposForOrgCodespacesSecretSuccess,
    ListSelectedRepositoriesEnabledGithubActionsOrganizationFailure,
    ListSelectedRepositoriesEnabledGithubActionsOrganizationSuccess,
    ListSelfHostedRunnerGroupsForOrgFailure,
    ListSelfHostedRunnerGroupsForOrgSuccess,
    ListSelfHostedRunnersForOrgFailure,
    ListSelfHostedRunnersForOrgSuccess,
    ListSelfHostedRunnersForRepoFailure,
    ListSelfHostedRunnersForRepoSuccess,
    ListSelfHostedRunnersInGroupForOrgFailure,
    ListSelfHostedRunnersInGroupForOrgSuccess,
    ListStargazersFailure,
    ListStargazersSuccess,
    ListTeamsAssignedToOrgRoleFailure,
    ListTeamsAssignedToOrgRoleSuccess,
    ListUserCodespaceMachinesFailure,
    ListUserCodespaceMachinesSuccess,
    ListUserCodespacesFailure,
    ListUserCodespacesSecretsFailure,
    ListUserCodespacesSecretsSuccess,
    ListUserCodespacesSuccess,
    ListUserReposFailure,
    ListUserReposSuccess,
    ListUsersAssignedToOrgRoleFailure,
    ListUsersAssignedToOrgRoleSuccess,
    ListWatchedReposForAuthenticatedUserFailure,
    ListWatchedReposForAuthenticatedUserSuccess,
    ListWatchersFailure,
    ListWatchersSuccess,
    ListWorkflowRunArtifactsFailure,
    ListWorkflowRunArtifactsSuccess,
    ListWorkflowRunsFailure,
    ListWorkflowRunsForRepoFailure,
    ListWorkflowRunsForRepoSuccess,
    ListWorkflowRunsSuccess,
    MarkNotificationsAsReadFailure,
    MarkNotificationsAsReadSuccess,
    MarkRepoNotificationsAsReadFailure,
    MarkRepoNotificationsAsReadSuccess,
    MarkThreadAsDoneFailure,
    MarkThreadAsDoneSuccess,
    MarkThreadAsReadFailure,
    MarkThreadAsReadSuccess,
    MergeRepoBranchFailure,
    MergeRepoBranchSuccess,
    PingOrgWebhookFailure,
    PingOrgWebhookSuccess,
    PingRepoWebhookFailure,
    PingRepoWebhookSuccess,
    PublishUserCodespaceFailure,
    PublishUserCodespaceSuccess,
    RedeliverAppWebhookDeliveryFailure,
    RedeliverAppWebhookDeliverySuccess,
    RedeliverOrgWebhookDeliveryFailure,
    RedeliverOrgWebhookDeliverySuccess,
    RedeliverRepoWebhookDeliveryFailure,
    RedeliverRepoWebhookDeliverySuccess,
    RemoveAllCustomLabelsFromSelfHostedRunnerForOrgFailure,
    RemoveAllCustomLabelsFromSelfHostedRunnerForOrgSuccess,
    RemoveAllCustomLabelsFromSelfHostedRunnerForRepoFailure,
    RemoveAllCustomLabelsFromSelfHostedRunnerForRepoSuccess,
    RemoveAllOrgRolesForTeamFailure,
    RemoveAllOrgRolesForTeamSuccess,
    RemoveAllOrgRolesForUserFailure,
    RemoveAllOrgRolesForUserSuccess,
    RemoveAppAccessRestrictionsFailure,
    RemoveAppAccessRestrictionsSuccess,
    RemoveCustomLabelFromSelfHostedRunnerForOrgFailure,
    RemoveCustomLabelFromSelfHostedRunnerForOrgSuccess,
    RemoveCustomLabelFromSelfHostedRunnerForRepoFailure,
    RemoveCustomLabelFromSelfHostedRunnerForRepoSuccess,
    RemoveOrgCodespacesAccessUsersFailure,
    RemoveOrgCodespacesAccessUsersSuccess,
    RemoveOrgMemberFailure,
    RemoveOrgMembershipForUserFailure,
    RemoveOrgMembershipForUserSuccess,
    RemoveOrgMemberSuccess,
    RemoveOrgOutsideCollaboratorFailure,
    RemoveOrgOutsideCollaboratorSuccess,
    RemoveOrgRoleFromTeamFailure,
    RemoveOrgRoleFromTeamSuccess,
    RemoveOrgRoleFromUserFailure,
    RemoveOrgRoleFromUserSuccess,
    RemoveOrgSecurityManagerTeamFailure,
    RemoveOrgSecurityManagerTeamSuccess,
    RemovePublicOrgMembershipForAuthUserFailure,
    RemovePublicOrgMembershipForAuthUserSuccess,
    RemoveRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    RemoveRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    RemoveRepoFromAppInstallationFailure,
    RemoveRepoFromAppInstallationSuccess,
    RemoveRepoFromUserCodespacesSecretFailure,
    ListRepoCollaboratorsSuccess,
    ListRepoCollaboratorsFailure,
    CheckRepoCollaboratorSuccess,
    CheckRepoCollaboratorFailure,
    AddRepoCollaboratorSuccess,
    AddRepoCollaboratorFailure,
    RemoveRepoCollaboratorSuccess,
    RemoveRepoCollaboratorFailure,
    GetRepoCollaboratorPermissionSuccess,
    GetRepoCollaboratorPermissionFailure,
    ListRepoInvitationsSuccess,
    ListRepoInvitationsFailure,
    UpdateRepoInvitationSuccess,
    UpdateRepoInvitationFailure,
    DeleteRepoInvitationSuccess,
    DeleteRepoInvitationFailure,
    ListUserRepositoryInvitationsSuccess,
    ListUserRepositoryInvitationsFailure,
    AcceptRepositoryInvitationSuccess,
    AcceptRepositoryInvitationFailure,
    DeclineRepositoryInvitationSuccess,
    DeclineRepositoryInvitationFailure,
    ListRepoCommitsSuccess,
    ListRepoCommitsFailure,
    GetRepoCommitSuccess,
    GetRepoCommitFailure,
    CompareRepoCommitsSuccess,
    CompareRepoCommitsFailure,
    ListBranchesForHeadCommitSuccess,
    ListBranchesForHeadCommitFailure,
    ListPullRequestsAssociatedWithCommitSuccess,
    ListPullRequestsAssociatedWithCommitFailure,
    ListRepoCommitCommentsSuccess,
    ListRepoCommitCommentsFailure,
    GetCommitCommentSuccess,
    GetCommitCommentFailure,
    UpdateCommitCommentSuccess,
    UpdateCommitCommentFailure,
    DeleteCommitCommentSuccess,
    DeleteCommitCommentFailure,
    ListCommitCommentsSuccess,
    ListCommitCommentsFailure,
    CreateCommitCommentSuccess,
    CreateCommitCommentFailure,
    GetCombinedCommitStatusSuccess,
    GetCombinedCommitStatusFailure,
    ListCommitStatusesSuccess,
    ListCommitStatusesFailure,
    CreateCommitStatusSuccess,
    CreateCommitStatusFailure,
    GetOrgCopilotSeatDetailsForUserSuccess,
    GetOrgCopilotSeatDetailsForUserFailure,
    RemoveOrgCopilotSeatsForUsersSuccess,
    RemoveOrgCopilotSeatsForUsersFailure,
    AddOrgCopilotSeatsForUsersSuccess,
    AddOrgCopilotSeatsForUsersFailure,
    RemoveOrgCopilotSeatsForTeamsSuccess,
    RemoveOrgCopilotSeatsForTeamsFailure,
    AddOrgCopilotSeatsForTeamsSuccess,
    AddOrgCopilotSeatsForTeamsFailure,
    ListOrgCopilotSeatsSuccess,
    ListOrgCopilotSeatsFailure,
    GetOrgCopilotBillingSuccess,
    GetOrgCopilotBillingFailure,
    GetOrgCopilotUsersMetrics28DaySuccess,
    GetOrgCopilotUsersMetrics28DayFailure,
    GetOrgCopilotUsersMetrics1DaySuccess,
    GetOrgCopilotUsersMetrics1DayFailure,
    GetOrgCopilotUserTeamsMetrics1DaySuccess,
    GetOrgCopilotUserTeamsMetrics1DayFailure,
    GetOrgCopilotReposMetrics1DaySuccess,
    GetOrgCopilotReposMetrics1DayFailure,
    GetOrgCopilotMetrics28DaySuccess,
    GetOrgCopilotMetrics28DayFailure,
    GetOrgCopilotMetrics1DaySuccess,
    GetOrgCopilotMetrics1DayFailure,
    GetEnterpriseCopilotUsersMetrics28DaySuccess,
    GetEnterpriseCopilotUsersMetrics28DayFailure,
    GetEnterpriseCopilotUsersMetrics1DaySuccess,
    GetEnterpriseCopilotUsersMetrics1DayFailure,
    GetEnterpriseCopilotUserTeamsMetrics1DaySuccess,
    GetEnterpriseCopilotUserTeamsMetrics1DayFailure,
    GetEnterpriseCopilotReposMetrics1DaySuccess,
    GetEnterpriseCopilotReposMetrics1DayFailure,
    GetEnterpriseCopilotMetrics28DaySuccess,
    GetEnterpriseCopilotMetrics28DayFailure,
    GetEnterpriseCopilotMetrics1DaySuccess,
    GetEnterpriseCopilotMetrics1DayFailure,
    DeleteEnterpriseCopilotCustomAgentsSourceSuccess,
    DeleteEnterpriseCopilotCustomAgentsSourceFailure,
    SetEnterpriseCopilotCustomAgentsSourceSuccess,
    SetEnterpriseCopilotCustomAgentsSourceFailure,
    GetEnterpriseCopilotCustomAgentsSourceSuccess,
    GetEnterpriseCopilotCustomAgentsSourceFailure,
    ListEnterpriseCopilotCustomAgentsSuccess,
    ListEnterpriseCopilotCustomAgentsFailure,
    SetOrgCopilotContentExclusionSuccess,
    SetOrgCopilotContentExclusionFailure,
    GetOrgCopilotContentExclusionSuccess,
    GetOrgCopilotContentExclusionFailure,
    DisableOrgCopilotCodingAgentRepositorySuccess,
    DisableOrgCopilotCodingAgentRepositoryFailure,
    EnableOrgCopilotCodingAgentRepositorySuccess,
    EnableOrgCopilotCodingAgentRepositoryFailure,
    SetOrgCopilotCodingAgentRepositoriesSuccess,
    SetOrgCopilotCodingAgentRepositoriesFailure,
    ListOrgCopilotCodingAgentRepositoriesSuccess,
    ListOrgCopilotCodingAgentRepositoriesFailure,
    SetOrgCopilotCodingAgentPermissionsSuccess,
    SetOrgCopilotCodingAgentPermissionsFailure,
    GetOrgCopilotCodingAgentPermissionsSuccess,
    GetOrgCopilotCodingAgentPermissionsFailure,
    RemoveEnterpriseCopilotCodingAgentOrganizationsSuccess,
    RemoveEnterpriseCopilotCodingAgentOrganizationsFailure,
    AddEnterpriseCopilotCodingAgentOrganizationsSuccess,
    AddEnterpriseCopilotCodingAgentOrganizationsFailure,
    SetEnterpriseCopilotCodingAgentPolicySuccess,
    SetEnterpriseCopilotCodingAgentPolicyFailure,
    GetRepoCopilotCloudAgentConfigurationSuccess,
    GetRepoCopilotCloudAgentConfigurationFailure,
    ListOrgCopilotSpaceCollaboratorsSuccess,
    ListOrgCopilotSpaceCollaboratorsFailure,
    AddOrgCopilotSpaceCollaboratorSuccess,
    AddOrgCopilotSpaceCollaboratorFailure,
    SetOrgCopilotSpaceCollaboratorRoleSuccess,
    SetOrgCopilotSpaceCollaboratorRoleFailure,
    RemoveOrgCopilotSpaceCollaboratorSuccess,
    RemoveOrgCopilotSpaceCollaboratorFailure,
    ListUserCopilotSpaceCollaboratorsSuccess,
    ListUserCopilotSpaceCollaboratorsFailure,
    AddUserCopilotSpaceCollaboratorSuccess,
    AddUserCopilotSpaceCollaboratorFailure,
    SetUserCopilotSpaceCollaboratorRoleSuccess,
    SetUserCopilotSpaceCollaboratorRoleFailure,
    RemoveUserCopilotSpaceCollaboratorSuccess,
    RemoveUserCopilotSpaceCollaboratorFailure,
    ListOrgCopilotSpacesSuccess,
    ListOrgCopilotSpacesFailure,
    CreateOrgCopilotSpaceSuccess,
    CreateOrgCopilotSpaceFailure,
    GetOrgCopilotSpaceSuccess,
    GetOrgCopilotSpaceFailure,
    SetOrgCopilotSpaceSuccess,
    SetOrgCopilotSpaceFailure,
    DeleteOrgCopilotSpaceSuccess,
    DeleteOrgCopilotSpaceFailure,
    ListUserCopilotSpacesSuccess,
    ListUserCopilotSpacesFailure,
    CreateUserCopilotSpaceSuccess,
    CreateUserCopilotSpaceFailure,
    GetUserCopilotSpaceSuccess,
    GetUserCopilotSpaceFailure,
    SetUserCopilotSpaceSuccess,
    SetUserCopilotSpaceFailure,
    DeleteUserCopilotSpaceSuccess,
    DeleteUserCopilotSpaceFailure,
    ListOrgCopilotSpaceResourcesSuccess,
    ListOrgCopilotSpaceResourcesFailure,
    CreateOrgCopilotSpaceResourceSuccess,
    CreateOrgCopilotSpaceResourceFailure,
    GetOrgCopilotSpaceResourceSuccess,
    GetOrgCopilotSpaceResourceFailure,
    SetOrgCopilotSpaceResourceSuccess,
    SetOrgCopilotSpaceResourceFailure,
    DeleteOrgCopilotSpaceResourceSuccess,
    DeleteOrgCopilotSpaceResourceFailure,
    ListUserCopilotSpaceResourcesSuccess,
    ListUserCopilotSpaceResourcesFailure,
    CreateUserCopilotSpaceResourceSuccess,
    CreateUserCopilotSpaceResourceFailure,
    GetUserCopilotSpaceResourceSuccess,
    GetUserCopilotSpaceResourceFailure,
    SetUserCopilotSpaceResourceSuccess,
    SetUserCopilotSpaceResourceFailure,
    DeleteUserCopilotSpaceResourceSuccess,
    DeleteUserCopilotSpaceResourceFailure,
    RevokeCredentialsSuccess,
    RevokeCredentialsFailure,
    ListOrgDependabotDismissalRequestsSuccess,
    ListOrgDependabotDismissalRequestsFailure,
    ListRepoDependabotDismissalRequestsSuccess,
    ListRepoDependabotDismissalRequestsFailure,
    GetRepoDependabotDismissalRequestSuccess,
    GetRepoDependabotDismissalRequestFailure,
    CreateRepoDependabotDismissalRequestSuccess,
    CreateRepoDependabotDismissalRequestFailure,
    ReviewRepoDependabotDismissalRequestSuccess,
    ReviewRepoDependabotDismissalRequestFailure,
    CancelRepoDependabotDismissalRequestSuccess,
    CancelRepoDependabotDismissalRequestFailure,
    ListEnterpriseDependabotAlertsSuccess,
    ListEnterpriseDependabotAlertsFailure,
    ListOrgDependabotAlertsSuccess,
    ListOrgDependabotAlertsFailure,
    ListRepoDependabotAlertsSuccess,
    ListRepoDependabotAlertsFailure,
    GetRepoDependabotAlertSuccess,
    GetRepoDependabotAlertFailure,
    UpdateRepoDependabotAlertSuccess,
    UpdateRepoDependabotAlertFailure,
    ListOrgDependabotSecretsSuccess,
    ListOrgDependabotSecretsFailure,
    GetOrgDependabotPublicKeySuccess,
    GetOrgDependabotPublicKeyFailure,
    GetOrgDependabotSecretSuccess,
    GetOrgDependabotSecretFailure,
    CreateOrUpdateOrgDependabotSecretSuccess,
    CreateOrUpdateOrgDependabotSecretFailure,
    DeleteOrgDependabotSecretSuccess,
    DeleteOrgDependabotSecretFailure,
    ListSelectedReposForOrgDependabotSecretSuccess,
    ListSelectedReposForOrgDependabotSecretFailure,
    SetSelectedReposForOrgDependabotSecretSuccess,
    SetSelectedReposForOrgDependabotSecretFailure,
    AddSelectedRepoToOrgDependabotSecretSuccess,
    AddSelectedRepoToOrgDependabotSecretFailure,
    RemoveSelectedRepoFromOrgDependabotSecretSuccess,
    RemoveSelectedRepoFromOrgDependabotSecretFailure,
    ListRepoDependabotSecretsSuccess,
    ListRepoDependabotSecretsFailure,
    GetRepoDependabotPublicKeySuccess,
    GetRepoDependabotPublicKeyFailure,
    GetRepoDependabotSecretSuccess,
    GetRepoDependabotSecretFailure,
    CreateOrUpdateRepoDependabotSecretSuccess,
    CreateOrUpdateRepoDependabotSecretFailure,
    DeleteRepoDependabotSecretSuccess,
    DeleteRepoDependabotSecretFailure,
    CompareRepoDependencyGraphSuccess,
    CompareRepoDependencyGraphFailure,
    CreateRepoDependencySnapshotSuccess,
    CreateRepoDependencySnapshotFailure,
    ExportRepoSbomSuccess,
    ExportRepoSbomFailure,
    FetchRepoSbomReportSuccess,
    FetchRepoSbomReportFailure,
    GenerateRepoSbomReportSuccess,
    GenerateRepoSbomReportFailure,
    ListRepoDeployKeysSuccess,
    ListRepoDeployKeysFailure,
    CreateRepoDeployKeySuccess,
    CreateRepoDeployKeyFailure,
    GetRepoDeployKeySuccess,
    GetRepoDeployKeyFailure,
    DeleteRepoDeployKeySuccess,
    DeleteRepoDeployKeyFailure,
    ListRepoEnvironmentDeploymentBranchPoliciesSuccess,
    ListRepoEnvironmentDeploymentBranchPoliciesFailure,
    CreateRepoEnvironmentDeploymentBranchPolicySuccess,
    CreateRepoEnvironmentDeploymentBranchPolicyFailure,
    GetRepoEnvironmentDeploymentBranchPolicySuccess,
    GetRepoEnvironmentDeploymentBranchPolicyFailure,
    UpdateRepoEnvironmentDeploymentBranchPolicySuccess,
    UpdateRepoEnvironmentDeploymentBranchPolicyFailure,
    DeleteRepoEnvironmentDeploymentBranchPolicySuccess,
    DeleteRepoEnvironmentDeploymentBranchPolicyFailure,
    ListRepoDeploymentsSuccess,
    ListRepoDeploymentsFailure,
    CreateRepoDeploymentSuccess,
    CreateRepoDeploymentFailure,
    GetRepoDeploymentSuccess,
    GetRepoDeploymentFailure,
    DeleteRepoDeploymentSuccess,
    DeleteRepoDeploymentFailure,
    ListRepoEnvironmentsSuccess,
    ListRepoEnvironmentsFailure,
    GetRepoEnvironmentSuccess,
    GetRepoEnvironmentFailure,
    CreateOrUpdateRepoEnvironmentSuccess,
    CreateOrUpdateRepoEnvironmentFailure,
    DeleteRepoEnvironmentSuccess,
    DeleteRepoEnvironmentFailure,
    ListRepoEnvironmentDeploymentProtectionRulesSuccess,
    ListRepoEnvironmentDeploymentProtectionRulesFailure,
    CreateRepoEnvironmentDeploymentProtectionRuleSuccess,
    CreateRepoEnvironmentDeploymentProtectionRuleFailure,
    ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsSuccess,
    ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsFailure,
    GetRepoEnvironmentDeploymentProtectionRuleSuccess,
    GetRepoEnvironmentDeploymentProtectionRuleFailure,
    DeleteRepoEnvironmentDeploymentProtectionRuleSuccess,
    DeleteRepoEnvironmentDeploymentProtectionRuleFailure,
    ListRepoDeploymentStatusesSuccess,
    ListRepoDeploymentStatusesFailure,
    CreateRepoDeploymentStatusSuccess,
    CreateRepoDeploymentStatusFailure,
    GetRepoDeploymentStatusSuccess,
    GetRepoDeploymentStatusFailure,
    GetEmojisSuccess,
    GetEmojisFailure,
    ListEnterpriseTeamMembersSuccess,
    ListEnterpriseTeamMembersFailure,
    BulkAddEnterpriseTeamMembersSuccess,
    BulkAddEnterpriseTeamMembersFailure,
    BulkRemoveEnterpriseTeamMembersSuccess,
    BulkRemoveEnterpriseTeamMembersFailure,
    GetEnterpriseTeamMembershipSuccess,
    GetEnterpriseTeamMembershipFailure,
    AddEnterpriseTeamMemberSuccess,
    AddEnterpriseTeamMemberFailure,
    RemoveEnterpriseTeamMembershipSuccess,
    RemoveEnterpriseTeamMembershipFailure,
    ListEnterpriseTeamOrganizationAssignmentsSuccess,
    ListEnterpriseTeamOrganizationAssignmentsFailure,
    BulkAddEnterpriseTeamOrganizationAssignmentsSuccess,
    BulkAddEnterpriseTeamOrganizationAssignmentsFailure,
    BulkRemoveEnterpriseTeamOrganizationAssignmentsSuccess,
    BulkRemoveEnterpriseTeamOrganizationAssignmentsFailure,
    GetEnterpriseTeamOrganizationAssignmentSuccess,
    GetEnterpriseTeamOrganizationAssignmentFailure,
    AddEnterpriseTeamOrganizationAssignmentSuccess,
    AddEnterpriseTeamOrganizationAssignmentFailure,
    DeleteEnterpriseTeamOrganizationAssignmentSuccess,
    DeleteEnterpriseTeamOrganizationAssignmentFailure,
    ListEnterpriseTeamsSuccess,
    ListEnterpriseTeamsFailure,
    CreateEnterpriseTeamSuccess,
    CreateEnterpriseTeamFailure,
    GetEnterpriseTeamSuccess,
    GetEnterpriseTeamFailure,
    UpdateEnterpriseTeamSuccess,
    UpdateEnterpriseTeamFailure,
    DeleteEnterpriseTeamSuccess,
    DeleteEnterpriseTeamFailure,
    CreateRepoGitBlobSuccess,
    CreateRepoGitBlobFailure,
    GetRepoGitBlobSuccess,
    GetRepoGitBlobFailure,
    CreateRepoGitCommitSuccess,
    CreateRepoGitCommitFailure,
    GetRepoGitCommitSuccess,
    GetRepoGitCommitFailure,
    ListRepoGitMatchingRefsSuccess,
    ListRepoGitMatchingRefsFailure,
    GetRepoGitRefSuccess,
    GetRepoGitRefFailure,
    CreateRepoGitRefSuccess,
    CreateRepoGitRefFailure,
    UpdateRepoGitRefSuccess,
    UpdateRepoGitRefFailure,
    DeleteRepoGitRefSuccess,
    DeleteRepoGitRefFailure,
    CreateRepoGitTagSuccess,
    CreateRepoGitTagFailure,
    GetRepoGitTagSuccess,
    GetRepoGitTagFailure,
    CreateRepoGitTreeSuccess,
    CreateRepoGitTreeFailure,
    GetRepoGitTreeSuccess,
    GetRepoGitTreeFailure,
    ListGitignoreTemplatesSuccess,
    ListGitignoreTemplatesFailure,
    GetGitignoreTemplateSuccess,
    GetGitignoreTemplateFailure,
    GetOrgInteractionLimitsSuccess,
    GetOrgInteractionLimitsFailure,
    SetOrgInteractionLimitsSuccess,
    SetOrgInteractionLimitsFailure,
    RemoveOrgInteractionLimitsSuccess,
    RemoveOrgInteractionLimitsFailure,
    GetRepoInteractionLimitsSuccess,
    GetRepoInteractionLimitsFailure,
    SetRepoInteractionLimitsSuccess,
    SetRepoInteractionLimitsFailure,
    RemoveRepoInteractionLimitsSuccess,
    RemoveRepoInteractionLimitsFailure,
    ListRepoPullRequestCreationCapBypassListSuccess,
    ListRepoPullRequestCreationCapBypassListFailure,
    AddRepoPullRequestCreationCapBypassUsersSuccess,
    AddRepoPullRequestCreationCapBypassUsersFailure,
    RemoveRepoPullRequestCreationCapBypassUsersSuccess,
    RemoveRepoPullRequestCreationCapBypassUsersFailure,
    GetRepoPullRequestCreationCapSuccess,
    GetRepoPullRequestCreationCapFailure,
    UpdateRepoPullRequestCreationCapSuccess,
    UpdateRepoPullRequestCreationCapFailure,
    GetAuthenticatedUserInteractionLimitsSuccess,
    GetAuthenticatedUserInteractionLimitsFailure,
    SetAuthenticatedUserInteractionLimitsSuccess,
    SetAuthenticatedUserInteractionLimitsFailure,
    RemoveAuthenticatedUserInteractionLimitsSuccess,
    RemoveAuthenticatedUserInteractionLimitsFailure,
    ListRepoAssigneesSuccess,
    ListRepoAssigneesFailure,
    CheckUserCanBeAssignedSuccess,
    CheckUserCanBeAssignedFailure,
    AddIssueAssigneesSuccess,
    AddIssueAssigneesFailure,
    RemoveIssueAssigneesSuccess,
    RemoveIssueAssigneesFailure,
    CheckUserCanBeAssignedToIssueSuccess,
    CheckUserCanBeAssignedToIssueFailure,
    ListRepoIssueCommentsSuccess,
    ListRepoIssueCommentsFailure,
    GetIssueCommentSuccess,
    GetIssueCommentFailure,
    UpdateIssueCommentSuccess,
    UpdateIssueCommentFailure,
    DeleteIssueCommentSuccess,
    DeleteIssueCommentFailure,
    PinIssueCommentSuccess,
    PinIssueCommentFailure,
    UnpinIssueCommentSuccess,
    UnpinIssueCommentFailure,
    ListIssueCommentsSuccess,
    ListIssueCommentsFailure,
    CreateIssueCommentSuccess,
    CreateIssueCommentFailure,
    ListRepoIssueEventsSuccess,
    ListRepoIssueEventsFailure,
    GetIssueEventSuccess,
    GetIssueEventFailure,
    ListIssueEventsSuccess,
    ListIssueEventsFailure,
    ListIssueDependenciesBlockedBySuccess,
    ListIssueDependenciesBlockedByFailure,
    AddIssueDependencyBlockedBySuccess,
    AddIssueDependencyBlockedByFailure,
    RemoveIssueDependencyBlockedBySuccess,
    RemoveIssueDependencyBlockedByFailure,
    ListIssueDependenciesBlockingSuccess,
    ListIssueDependenciesBlockingFailure,
    ListIssueFieldValuesSuccess,
    ListIssueFieldValuesFailure,
    AddIssueFieldValuesSuccess,
    AddIssueFieldValuesFailure,
    SetIssueFieldValuesSuccess,
    SetIssueFieldValuesFailure,
    DeleteIssueFieldValueSuccess,
    DeleteIssueFieldValueFailure,
    ListIssuesSuccess,
    ListIssuesFailure,
    ListUserAccountIssuesSuccess,
    ListUserAccountIssuesFailure,
    ListOrgIssuesSuccess,
    ListOrgIssuesFailure,
    ListRepoIssuesSuccess,
    ListRepoIssuesFailure,
    CreateRepoIssueSuccess,
    CreateRepoIssueFailure,
    GetRepoIssueSuccess,
    GetRepoIssueFailure,
    UpdateRepoIssueSuccess,
    UpdateRepoIssueFailure,
    LockRepoIssueSuccess,
    LockRepoIssueFailure,
    UnlockRepoIssueSuccess,
    UnlockRepoIssueFailure,
    ListIssueLabelsSuccess,
    ListIssueLabelsFailure,
    AddIssueLabelsSuccess,
    AddIssueLabelsFailure,
    SetIssueLabelsSuccess,
    SetIssueLabelsFailure,
    RemoveAllIssueLabelsSuccess,
    RemoveAllIssueLabelsFailure,
    RemoveIssueLabelSuccess,
    RemoveIssueLabelFailure,
    ListRepoLabelsSuccess,
    ListRepoLabelsFailure,
    CreateRepoLabelSuccess,
    CreateRepoLabelFailure,
    GetRepoLabelSuccess,
    GetRepoLabelFailure,
    UpdateRepoLabelSuccess,
    UpdateRepoLabelFailure,
    DeleteRepoLabelSuccess,
    DeleteRepoLabelFailure,
    ListMilestoneLabelsSuccess,
    ListMilestoneLabelsFailure,
    ListRepoMilestonesSuccess,
    ListRepoMilestonesFailure,
    CreateRepoMilestoneSuccess,
    CreateRepoMilestoneFailure,
    GetRepoMilestoneSuccess,
    GetRepoMilestoneFailure,
    UpdateRepoMilestoneSuccess,
    UpdateRepoMilestoneFailure,
    DeleteRepoMilestoneSuccess,
    DeleteRepoMilestoneFailure,
    GetIssueParentSuccess,
    GetIssueParentFailure,
    ListIssueSubIssuesSuccess,
    ListIssueSubIssuesFailure,
    AddIssueSubIssueSuccess,
    AddIssueSubIssueFailure,
    RemoveIssueSubIssueSuccess,
    RemoveIssueSubIssueFailure,
    ReprioritizeIssueSubIssueSuccess,
    ReprioritizeIssueSubIssueFailure,
    ListIssueTimelineEventsSuccess,
    ListIssueTimelineEventsFailure,
    ListCommonlyUsedLicensesSuccess,
    ListCommonlyUsedLicensesFailure,
    GetLicenseSuccess,
    GetLicenseFailure,
    GetRepoLicenseSuccess,
    GetRepoLicenseFailure,
    RenderMarkdownSuccess,
    RenderMarkdownFailure,
    RenderMarkdownRawSuccess,
    RenderMarkdownRawFailure,
    GetApiRootSuccess,
    GetApiRootFailure,
    GetMetaSuccess,
    GetMetaFailure,
    GetOctocatSuccess,
    GetOctocatFailure,
    ListApiVersionsSuccess,
    ListApiVersionsFailure,
    GetZenSuccess,
    GetZenFailure,
    GetRepoCommunityProfileMetricsSuccess,
    GetRepoCommunityProfileMetricsFailure,
    GetRepoCodeFrequencyStatsSuccess,
    GetRepoCodeFrequencyStatsFailure,
    GetRepoCommitActivityStatsSuccess,
    GetRepoCommitActivityStatsFailure,
    GetRepoContributorsStatsSuccess,
    GetRepoContributorsStatsFailure,
    GetRepoParticipationStatsSuccess,
    GetRepoParticipationStatsFailure,
    GetRepoPunchCardStatsSuccess,
    GetRepoPunchCardStatsFailure,
    GetRepoClonesSuccess,
    GetRepoClonesFailure,
    GetRepoTopPathsSuccess,
    GetRepoTopPathsFailure,
    GetRepoTopReferrersSuccess,
    GetRepoTopReferrersFailure,
    GetRepoViewsSuccess,
    GetRepoViewsFailure,
    ListModelsSuccess,
    ListModelsFailure,
    CreateModelEmbeddingsSuccess,
    CreateModelEmbeddingsFailure,
    CreateOrgModelEmbeddingsSuccess,
    CreateOrgModelEmbeddingsFailure,
    CreateModelChatCompletionSuccess,
    CreateModelChatCompletionFailure,
    CreateOrgModelChatCompletionSuccess,
    CreateOrgModelChatCompletionFailure,
    ListOrgDockerMigrationConflictsSuccess,
    ListOrgDockerMigrationConflictsFailure,
    ListOrgPackagesSuccess,
    ListOrgPackagesFailure,
    GetOrgPackageSuccess,
    GetOrgPackageFailure,
    DeleteOrgPackageSuccess,
    DeleteOrgPackageFailure,
    RestoreOrgPackageSuccess,
    RestoreOrgPackageFailure,
    ListOrgPackageVersionsSuccess,
    ListOrgPackageVersionsFailure,
    GetOrgPackageVersionSuccess,
    GetOrgPackageVersionFailure,
    DeleteOrgPackageVersionSuccess,
    DeleteOrgPackageVersionFailure,
    RestoreOrgPackageVersionSuccess,
    RestoreOrgPackageVersionFailure,
    ListAuthenticatedUserDockerMigrationConflictsSuccess,
    ListAuthenticatedUserDockerMigrationConflictsFailure,
    ListAuthenticatedUserPackagesSuccess,
    ListAuthenticatedUserPackagesFailure,
    GetAuthenticatedUserPackageSuccess,
    GetAuthenticatedUserPackageFailure,
    DeleteAuthenticatedUserPackageSuccess,
    DeleteAuthenticatedUserPackageFailure,
    RestoreAuthenticatedUserPackageSuccess,
    RestoreAuthenticatedUserPackageFailure,
    ListAuthenticatedUserPackageVersionsSuccess,
    ListAuthenticatedUserPackageVersionsFailure,
    GetAuthenticatedUserPackageVersionSuccess,
    GetAuthenticatedUserPackageVersionFailure,
    DeleteAuthenticatedUserPackageVersionSuccess,
    DeleteAuthenticatedUserPackageVersionFailure,
    RestoreAuthenticatedUserPackageVersionSuccess,
    RestoreAuthenticatedUserPackageVersionFailure,
    ListUserDockerMigrationConflictsSuccess,
    ListUserDockerMigrationConflictsFailure,
    ListUserPackagesSuccess,
    ListUserPackagesFailure,
    GetUserPackageSuccess,
    GetUserPackageFailure,
    DeleteUserPackageSuccess,
    DeleteUserPackageFailure,
    RestoreUserPackageSuccess,
    RestoreUserPackageFailure,
    ListUserPackageVersionsSuccess,
    ListUserPackageVersionsFailure,
    GetUserPackageVersionSuccess,
    GetUserPackageVersionFailure,
    DeleteUserPackageVersionSuccess,
    DeleteUserPackageVersionFailure,
    RestoreUserPackageVersionSuccess,
    RestoreUserPackageVersionFailure,
    GetRepoPagesSuccess,
    GetRepoPagesFailure,
    CreateRepoPagesSiteSuccess,
    CreateRepoPagesSiteFailure,
    UpdateRepoPagesSiteSuccess,
    UpdateRepoPagesSiteFailure,
    DeleteRepoPagesSiteSuccess,
    DeleteRepoPagesSiteFailure,
    ListRepoPagesBuildsSuccess,
    ListRepoPagesBuildsFailure,
    RequestRepoPagesBuildSuccess,
    RequestRepoPagesBuildFailure,
    GetLatestRepoPagesBuildSuccess,
    GetLatestRepoPagesBuildFailure,
    GetRepoPagesBuildSuccess,
    GetRepoPagesBuildFailure,
    CreateRepoPagesDeploymentSuccess,
    CreateRepoPagesDeploymentFailure,
    GetRepoPagesDeploymentSuccess,
    GetRepoPagesDeploymentFailure,
    CancelRepoPagesDeploymentSuccess,
    CancelRepoPagesDeploymentFailure,
    GetRepoPagesHealthCheckSuccess,
    GetRepoPagesHealthCheckFailure,
    ListEnterpriseDependabotRepositoryAccessSuccess,
    ListEnterpriseDependabotRepositoryAccessFailure,
    UpdateEnterpriseDependabotRepositoryAccessSuccess,
    UpdateEnterpriseDependabotRepositoryAccessFailure,
    SetEnterpriseDependabotRepositoryAccessDefaultLevelSuccess,
    SetEnterpriseDependabotRepositoryAccessDefaultLevelFailure,
    ListOrgDependabotRepositoryAccessSuccess,
    ListOrgDependabotRepositoryAccessFailure,
    UpdateOrgDependabotRepositoryAccessSuccess,
    UpdateOrgDependabotRepositoryAccessFailure,
    SetOrgDependabotRepositoryAccessDefaultLevelSuccess,
    SetOrgDependabotRepositoryAccessDefaultLevelFailure,
    RemoveRepoFromUserCodespacesSecretSuccess,
    RemoveResourcesFromEnterpriseCostCenterFailure,
    RemoveResourcesFromEnterpriseCostCenterSuccess,
    RemoveSelectedRepoFromOrgActionsSecretFailure,
    RemoveSelectedRepoFromOrgActionsSecretSuccess,
    RemoveSelectedRepoFromOrgActionsVariableFailure,
    RemoveSelectedRepoFromOrgActionsVariableSuccess,
    RemoveSelectedRepoFromOrgAgentSecretFailure,
    RemoveSelectedRepoFromOrgAgentSecretSuccess,
    RemoveSelectedRepoFromOrgAgentVariableFailure,
    RemoveSelectedRepoFromOrgAgentVariableSuccess,
    RemoveSelectedRepoFromOrgCodespacesSecretFailure,
    RemoveSelectedRepoFromOrgCodespacesSecretSuccess,
    RemoveSelfHostedRunnerFromGroupForOrgFailure,
    RemoveSelfHostedRunnerFromGroupForOrgSuccess,
    RemoveStatusCheckContextsFailure,
    RemoveStatusCheckContextsSuccess,
    RemoveStatusCheckProtectionFailure,
    RemoveStatusCheckProtectionSuccess,
    RemoveTeamAccessRestrictionsFailure,
    RemoveTeamAccessRestrictionsSuccess,
    RemoveUserAccessRestrictionsFailure,
    RemoveUserAccessRestrictionsSuccess,
    RenameRepoBranchFailure,
    RenameRepoBranchSuccess,
    ReplaceRepoTopicsFailure,
    ReplaceRepoTopicsSuccess,
    RerequestCheckRunFailure,
    RerequestCheckRunSuccess,
    RerequestCheckSuiteFailure,
    RerequestCheckSuiteSuccess,
    ReRunJobForWorkflowRunFailure,
    ReRunJobForWorkflowRunSuccess,
    ReRunWorkflowFailedJobsFailure,
    ReRunWorkflowFailedJobsSuccess,
    ReRunWorkflowFailure,
    ReRunWorkflowSuccess,
    ResetAppTokenFailure,
    ResetAppTokenSuccess,
    ReviewCustomGatesForWorkflowRunFailure,
    ReviewCustomGatesForWorkflowRunSuccess,
    ReviewOrgPatRequestFailure,
    ReviewOrgPatRequestsFailure,
    ReviewOrgPatRequestsSuccess,
    ReviewOrgPatRequestSuccess,
    ReviewPendingDeploymentsForWorkflowRunFailure,
    ReviewPendingDeploymentsForWorkflowRunSuccess,
    ReviewRepoCodeScanningDismissalRequestFailure,
    ReviewRepoCodeScanningDismissalRequestSuccess,
    RevokeInstallationAccessTokenFailure,
    RevokeInstallationAccessTokenSuccess,
    SetAdminBranchProtectionFailure,
    SetAdminBranchProtectionSuccess,
    SetAllowedActionsOrganizationFailure,
    SetAllowedActionsOrganizationSuccess,
    SetAllowedActionsRepositoryFailure,
    SetAllowedActionsRepositorySuccess,
    SetAppAccessRestrictionsFailure,
    SetAppAccessRestrictionsSuccess,
    SetCheckSuitesPreferencesFailure,
    SetCheckSuitesPreferencesSuccess,
    SetCustomLabelsForSelfHostedRunnerForOrgFailure,
    SetCustomLabelsForSelfHostedRunnerForOrgSuccess,
    SetCustomLabelsForSelfHostedRunnerForRepoFailure,
    SetCustomLabelsForSelfHostedRunnerForRepoSuccess,
    SetCustomOidcSubClaimForRepoFailure,
    SetCustomOidcSubClaimForRepoSuccess,
    SetEnterpriseCodeSecurityConfigurationAsDefaultFailure,
    SetEnterpriseCodeSecurityConfigurationAsDefaultSuccess,
    SetGithubActionsDefaultWorkflowPermissionsOrganizationFailure,
    SetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess,
    SetGithubActionsDefaultWorkflowPermissionsRepositoryFailure,
    SetGithubActionsDefaultWorkflowPermissionsRepositorySuccess,
    SetGithubActionsPermissionsOrganizationFailure,
    SetGithubActionsPermissionsOrganizationSuccess,
    SetGithubActionsPermissionsRepositoryFailure,
    SetGithubActionsPermissionsRepositorySuccess,
    SetImmutableReleasesForOrgReposFailure,
    SetImmutableReleasesForOrgReposSuccess,
    SetOrgClusterDeploymentRecordsFailure,
    SetOrgClusterDeploymentRecordsSuccess,
    SetOrgCodeSecurityConfigurationAsDefaultFailure,
    SetOrgCodeSecurityConfigurationAsDefaultSuccess,
    SetOrgCodespacesAccessFailure,
    SetOrgCodespacesAccessSuccess,
    SetOrgImmutableReleasesSettingsFailure,
    SetOrgImmutableReleasesSettingsSuccess,
    SetOrgMembershipForUserFailure,
    SetOrgMembershipForUserSuccess,
    SetPublicOrgMembershipForAuthUserFailure,
    SetPublicOrgMembershipForAuthUserSuccess,
    SetRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    SetRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    SetReposForUserCodespacesSecretFailure,
    SetReposForUserCodespacesSecretSuccess,
    SetRepoSubscriptionFailure,
    SetRepoSubscriptionSuccess,
    SetSelectedReposForOrgActionsSecretFailure,
    SetSelectedReposForOrgActionsSecretSuccess,
    SetSelectedReposForOrgActionsVariableFailure,
    SetSelectedReposForOrgActionsVariableSuccess,
    SetSelectedReposForOrgAgentSecretFailure,
    SetSelectedReposForOrgAgentSecretSuccess,
    SetSelectedReposForOrgAgentVariableFailure,
    SetSelectedReposForOrgAgentVariableSuccess,
    SetSelectedReposForOrgCodespacesSecretFailure,
    SetSelectedReposForOrgCodespacesSecretSuccess,
    SetSelectedRepositoriesEnabledGithubActionsOrganizationFailure,
    SetSelectedRepositoriesEnabledGithubActionsOrganizationSuccess,
    SetSelfHostedRunnersInGroupForOrgFailure,
    SetSelfHostedRunnersInGroupForOrgSuccess,
    SetStatusCheckContextsFailure,
    SetStatusCheckContextsSuccess,
    SetTeamAccessRestrictionsFailure,
    SetTeamAccessRestrictionsSuccess,
    SetThreadSubscriptionFailure,
    SetThreadSubscriptionSuccess,
    SetUserAccessRestrictionsFailure,
    SetUserAccessRestrictionsSuccess,
    SetWorkflowAccessToRepositoryFailure,
    SetWorkflowAccessToRepositorySuccess,
    StarRepoForAuthenticatedUserFailure,
    StarRepoForAuthenticatedUserSuccess,
    StartAgentTaskFailure,
    StartAgentTaskSuccess,
    StartUserCodespaceFailure,
    StartUserCodespaceSuccess,
    StopOrgUserCodespaceFailure,
    StopOrgUserCodespaceSuccess,
    StopUserCodespaceFailure,
    StopUserCodespaceSuccess,
    SuspendAppInstallationFailure,
    SuspendAppInstallationSuccess,
    SyncForkBranchWithUpstreamFailure,
    SyncForkBranchWithUpstreamSuccess,
    TestPushRepoWebhookFailure,
    TestPushRepoWebhookSuccess,
    TransferRepoFailure,
    TransferRepoSuccess,
    UnblockOrgUserFailure,
    UnblockOrgUserSuccess,
    UnstarRepoForAuthenticatedUserFailure,
    UnstarRepoForAuthenticatedUserSuccess,
    UnsuspendAppInstallationFailure,
    UnsuspendAppInstallationSuccess,
    UpdateAppWebhookConfigFailure,
    UpdateAppWebhookConfigSuccess,
    UpdateCheckRunFailure,
    UpdateCheckRunSuccess,
    UpdateCodeScanningAlertFailure,
    UpdateCodeScanningAlertSuccess,
    UpdateCodeScanningDefaultSetupFailure,
    UpdateCodeScanningDefaultSetupSuccess,
    UpdateEnterpriseCodeSecurityConfigurationFailure,
    UpdateEnterpriseCodeSecurityConfigurationSuccess,
    UpdateEnterpriseCostCenterFailure,
    UpdateEnterpriseCostCenterSuccess,
    UpdateEnvironmentActionsVariableFailure,
    UpdateEnvironmentActionsVariableSuccess,
    UpdateHostedRunnerForOrgFailure,
    UpdateHostedRunnerForOrgSuccess,
    UpdateOidcCustomSubTemplateForOrgFailure,
    UpdateOidcCustomSubTemplateForOrgSuccess,
    UpdateOrgActionsVariableFailure,
    UpdateOrgActionsVariableSuccess,
    UpdateOrgAgentVariableFailure,
    UpdateOrgAgentVariableSuccess,
    UpdateOrgBudgetFailure,
    UpdateOrgBudgetSuccess,
    UpdateOrgCampaignFailure,
    UpdateOrgCampaignSuccess,
    UpdateOrgCodeSecurityConfigurationFailure,
    UpdateOrgCodeSecurityConfigurationSuccess,
    UpdateOrgFailure,
    UpdateOrgIssueFieldFailure,
    UpdateOrgIssueFieldSuccess,
    UpdateOrgIssueTypeFailure,
    UpdateOrgIssueTypeSuccess,
    UpdateOrgMembershipForAuthUserFailure,
    UpdateOrgMembershipForAuthUserSuccess,
    UpdateOrgNetworkConfigurationFailure,
    UpdateOrgNetworkConfigurationSuccess,
    UpdateOrgPatFailure,
    UpdateOrgPatsFailure,
    UpdateOrgPatsSuccess,
    UpdateOrgPatSuccess,
    UpdateOrgRulesetFailure,
    UpdateOrgRulesetSuccess,
    UpdateOrgSuccess,
    UpdateOrgWebhookConfigFailure,
    UpdateOrgWebhookConfigSuccess,
    UpdateOrgWebhookFailure,
    UpdateOrgWebhookSuccess,
    UpdatePullRequestReviewProtectionFailure,
    UpdatePullRequestReviewProtectionSuccess,
    UpdateRepoActionsVariableFailure,
    UpdateRepoActionsVariableSuccess,
    UpdateRepoAgentVariableFailure,
    UpdateRepoAgentVariableSuccess,
    UpdateRepoBranchProtectionFailure,
    UpdateRepoBranchProtectionSuccess,
    UpdateRepoCodeQualitySetupFailure,
    UpdateRepoCodeQualitySetupSuccess,
    UpdateRepoFailure,
    UpdateRepoRulesetFailure,
    UpdateRepoRulesetSuccess,
    UpdateRepoSuccess,
    UpdateRepoWebhookConfigFailure,
    UpdateRepoWebhookConfigSuccess,
    UpdateRepoWebhookFailure,
    UpdateRepoWebhookSuccess,
    UpdateSelfHostedRunnerGroupForOrgFailure,
    UpdateSelfHostedRunnerGroupForOrgSuccess,
    UpdateStatusCheckProtectionFailure,
    UpdateStatusCheckProtectionSuccess,
    UpdateUserCodespaceFailure,
    UpdateUserCodespaceSuccess,
    UploadCodeScanningSarifFailure,
    UploadCodeScanningSarifSuccess
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
        | ListArtifactsForRepoSuccess
        | ListArtifactsForRepoFailure
        | GetArtifactSuccess
        | GetArtifactFailure
        | DeleteArtifactSuccess
        | DeleteArtifactFailure
        | DownloadArtifactSuccess
        | DownloadArtifactFailure
        | ListWorkflowRunArtifactsSuccess
        | ListWorkflowRunArtifactsFailure
        | GetActionsCacheUsageForRepoSuccess
        | GetActionsCacheUsageForRepoFailure
        | GetActionsCacheUsageForOrgSuccess
        | GetActionsCacheUsageForOrgFailure
        | GetActionsCacheUsageByRepoForOrgSuccess
        | GetActionsCacheUsageByRepoForOrgFailure
        | ListActionsCachesSuccess
        | ListActionsCachesFailure
        | DeleteActionsCacheByKeySuccess
        | DeleteActionsCacheByKeyFailure
        | DeleteActionsCacheByIdSuccess
        | DeleteActionsCacheByIdFailure
        | ListConcurrencyGroupsForRepoSuccess
        | ListConcurrencyGroupsForRepoFailure
        | GetConcurrencyGroupSuccess
        | GetConcurrencyGroupFailure
        | ListConcurrencyGroupsForWorkflowRunSuccess
        | ListConcurrencyGroupsForWorkflowRunFailure
        | ListHostedRunnersForOrgSuccess
        | ListHostedRunnersForOrgFailure
        | CreateHostedRunnerForOrgSuccess
        | CreateHostedRunnerForOrgFailure
        | ListCustomImagesForOrgSuccess
        | ListCustomImagesForOrgFailure
        | GetCustomImageForOrgSuccess
        | GetCustomImageForOrgFailure
        | DeleteCustomImageFromOrgSuccess
        | DeleteCustomImageFromOrgFailure
        | ListCustomImageVersionsForOrgSuccess
        | ListCustomImageVersionsForOrgFailure
        | GetCustomImageVersionForOrgSuccess
        | GetCustomImageVersionForOrgFailure
        | DeleteCustomImageVersionFromOrgSuccess
        | DeleteCustomImageVersionFromOrgFailure
        | GetHostedRunnersGithubOwnedImagesForOrgSuccess
        | GetHostedRunnersGithubOwnedImagesForOrgFailure
        | GetHostedRunnersPartnerImagesForOrgSuccess
        | GetHostedRunnersPartnerImagesForOrgFailure
        | GetHostedRunnersLimitsForOrgSuccess
        | GetHostedRunnersLimitsForOrgFailure
        | GetHostedRunnersMachineSpecsForOrgSuccess
        | GetHostedRunnersMachineSpecsForOrgFailure
        | GetHostedRunnersPlatformsForOrgSuccess
        | GetHostedRunnersPlatformsForOrgFailure
        | GetHostedRunnerForOrgSuccess
        | GetHostedRunnerForOrgFailure
        | UpdateHostedRunnerForOrgSuccess
        | UpdateHostedRunnerForOrgFailure
        | DeleteHostedRunnerForOrgSuccess
        | DeleteHostedRunnerForOrgFailure
        | GetOidcCustomSubTemplateForOrgSuccess
        | GetOidcCustomSubTemplateForOrgFailure
        | UpdateOidcCustomSubTemplateForOrgSuccess
        | UpdateOidcCustomSubTemplateForOrgFailure
        | GetCustomOidcSubClaimForRepoSuccess
        | GetCustomOidcSubClaimForRepoFailure
        | SetCustomOidcSubClaimForRepoSuccess
        | SetCustomOidcSubClaimForRepoFailure
        | GetGithubActionsPermissionsOrganizationSuccess
        | GetGithubActionsPermissionsOrganizationFailure
        | SetGithubActionsPermissionsOrganizationSuccess
        | SetGithubActionsPermissionsOrganizationFailure
        | ListSelectedRepositoriesEnabledGithubActionsOrganizationSuccess
        | ListSelectedRepositoriesEnabledGithubActionsOrganizationFailure
        | SetSelectedRepositoriesEnabledGithubActionsOrganizationSuccess
        | SetSelectedRepositoriesEnabledGithubActionsOrganizationFailure
        | EnableSelectedRepositoryGithubActionsOrganizationSuccess
        | EnableSelectedRepositoryGithubActionsOrganizationFailure
        | DisableSelectedRepositoryGithubActionsOrganizationSuccess
        | DisableSelectedRepositoryGithubActionsOrganizationFailure
        | GetAllowedActionsOrganizationSuccess
        | GetAllowedActionsOrganizationFailure
        | SetAllowedActionsOrganizationSuccess
        | SetAllowedActionsOrganizationFailure
        | GetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess
        | GetGithubActionsDefaultWorkflowPermissionsOrganizationFailure
        | SetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess
        | SetGithubActionsDefaultWorkflowPermissionsOrganizationFailure
        | GetGithubActionsPermissionsRepositorySuccess
        | GetGithubActionsPermissionsRepositoryFailure
        | SetGithubActionsPermissionsRepositorySuccess
        | SetGithubActionsPermissionsRepositoryFailure
        | GetWorkflowAccessToRepositorySuccess
        | GetWorkflowAccessToRepositoryFailure
        | SetWorkflowAccessToRepositorySuccess
        | SetWorkflowAccessToRepositoryFailure
        | GetAllowedActionsRepositorySuccess
        | GetAllowedActionsRepositoryFailure
        | SetAllowedActionsRepositorySuccess
        | SetAllowedActionsRepositoryFailure
        | GetGithubActionsDefaultWorkflowPermissionsRepositorySuccess
        | GetGithubActionsDefaultWorkflowPermissionsRepositoryFailure
        | SetGithubActionsDefaultWorkflowPermissionsRepositorySuccess
        | SetGithubActionsDefaultWorkflowPermissionsRepositoryFailure
        | ListOrgActionsSecretsSuccess
        | ListOrgActionsSecretsFailure
        | GetOrgActionsPublicKeySuccess
        | GetOrgActionsPublicKeyFailure
        | GetOrgActionsSecretSuccess
        | GetOrgActionsSecretFailure
        | CreateOrUpdateOrgActionsSecretSuccess
        | CreateOrUpdateOrgActionsSecretFailure
        | DeleteOrgActionsSecretSuccess
        | DeleteOrgActionsSecretFailure
        | ListSelectedReposForOrgActionsSecretSuccess
        | ListSelectedReposForOrgActionsSecretFailure
        | SetSelectedReposForOrgActionsSecretSuccess
        | SetSelectedReposForOrgActionsSecretFailure
        | AddSelectedRepoToOrgActionsSecretSuccess
        | AddSelectedRepoToOrgActionsSecretFailure
        | RemoveSelectedRepoFromOrgActionsSecretSuccess
        | RemoveSelectedRepoFromOrgActionsSecretFailure
        | ListRepoOrganizationActionsSecretsSuccess
        | ListRepoOrganizationActionsSecretsFailure
        | ListRepoActionsSecretsSuccess
        | ListRepoActionsSecretsFailure
        | GetRepoActionsPublicKeySuccess
        | GetRepoActionsPublicKeyFailure
        | GetRepoActionsSecretSuccess
        | GetRepoActionsSecretFailure
        | CreateOrUpdateRepoActionsSecretSuccess
        | CreateOrUpdateRepoActionsSecretFailure
        | DeleteRepoActionsSecretSuccess
        | DeleteRepoActionsSecretFailure
        | ListEnvironmentActionsSecretsSuccess
        | ListEnvironmentActionsSecretsFailure
        | GetEnvironmentActionsPublicKeySuccess
        | GetEnvironmentActionsPublicKeyFailure
        | GetEnvironmentActionsSecretSuccess
        | GetEnvironmentActionsSecretFailure
        | CreateOrUpdateEnvironmentActionsSecretSuccess
        | CreateOrUpdateEnvironmentActionsSecretFailure
        | DeleteEnvironmentActionsSecretSuccess
        | DeleteEnvironmentActionsSecretFailure
        | ListSelfHostedRunnerGroupsForOrgSuccess
        | ListSelfHostedRunnerGroupsForOrgFailure
        | CreateSelfHostedRunnerGroupForOrgSuccess
        | CreateSelfHostedRunnerGroupForOrgFailure
        | GetSelfHostedRunnerGroupForOrgSuccess
        | GetSelfHostedRunnerGroupForOrgFailure
        | UpdateSelfHostedRunnerGroupForOrgSuccess
        | UpdateSelfHostedRunnerGroupForOrgFailure
        | DeleteSelfHostedRunnerGroupFromOrgSuccess
        | DeleteSelfHostedRunnerGroupFromOrgFailure
        | ListGithubHostedRunnersInGroupForOrgSuccess
        | ListGithubHostedRunnersInGroupForOrgFailure
        | ListRepoAccessToSelfHostedRunnerGroupInOrgSuccess
        | ListRepoAccessToSelfHostedRunnerGroupInOrgFailure
        | SetRepoAccessToSelfHostedRunnerGroupInOrgSuccess
        | SetRepoAccessToSelfHostedRunnerGroupInOrgFailure
        | AddRepoAccessToSelfHostedRunnerGroupInOrgSuccess
        | AddRepoAccessToSelfHostedRunnerGroupInOrgFailure
        | RemoveRepoAccessToSelfHostedRunnerGroupInOrgSuccess
        | RemoveRepoAccessToSelfHostedRunnerGroupInOrgFailure
        | ListSelfHostedRunnersInGroupForOrgSuccess
        | ListSelfHostedRunnersInGroupForOrgFailure
        | SetSelfHostedRunnersInGroupForOrgSuccess
        | SetSelfHostedRunnersInGroupForOrgFailure
        | AddSelfHostedRunnerToGroupForOrgSuccess
        | AddSelfHostedRunnerToGroupForOrgFailure
        | RemoveSelfHostedRunnerFromGroupForOrgSuccess
        | RemoveSelfHostedRunnerFromGroupForOrgFailure
        | ListSelfHostedRunnersForOrgSuccess
        | ListSelfHostedRunnersForOrgFailure
        | ListRunnerApplicationsForOrgSuccess
        | ListRunnerApplicationsForOrgFailure
        | GenerateRunnerJitconfigForOrgSuccess
        | GenerateRunnerJitconfigForOrgFailure
        | CreateRegistrationTokenForOrgSuccess
        | CreateRegistrationTokenForOrgFailure
        | CreateRemoveTokenForOrgSuccess
        | CreateRemoveTokenForOrgFailure
        | GetSelfHostedRunnerForOrgSuccess
        | GetSelfHostedRunnerForOrgFailure
        | DeleteSelfHostedRunnerFromOrgSuccess
        | DeleteSelfHostedRunnerFromOrgFailure
        | ListLabelsForSelfHostedRunnerForOrgSuccess
        | ListLabelsForSelfHostedRunnerForOrgFailure
        | AddCustomLabelsToSelfHostedRunnerForOrgSuccess
        | AddCustomLabelsToSelfHostedRunnerForOrgFailure
        | SetCustomLabelsForSelfHostedRunnerForOrgSuccess
        | SetCustomLabelsForSelfHostedRunnerForOrgFailure
        | RemoveAllCustomLabelsFromSelfHostedRunnerForOrgSuccess
        | RemoveAllCustomLabelsFromSelfHostedRunnerForOrgFailure
        | RemoveCustomLabelFromSelfHostedRunnerForOrgSuccess
        | RemoveCustomLabelFromSelfHostedRunnerForOrgFailure
        | ListSelfHostedRunnersForRepoSuccess
        | ListSelfHostedRunnersForRepoFailure
        | ListRunnerApplicationsForRepoSuccess
        | ListRunnerApplicationsForRepoFailure
        | GenerateRunnerJitconfigForRepoSuccess
        | GenerateRunnerJitconfigForRepoFailure
        | CreateRegistrationTokenForRepoSuccess
        | CreateRegistrationTokenForRepoFailure
        | CreateRemoveTokenForRepoSuccess
        | CreateRemoveTokenForRepoFailure
        | GetSelfHostedRunnerForRepoSuccess
        | GetSelfHostedRunnerForRepoFailure
        | DeleteSelfHostedRunnerFromRepoSuccess
        | DeleteSelfHostedRunnerFromRepoFailure
        | ListLabelsForSelfHostedRunnerForRepoSuccess
        | ListLabelsForSelfHostedRunnerForRepoFailure
        | AddCustomLabelsToSelfHostedRunnerForRepoSuccess
        | AddCustomLabelsToSelfHostedRunnerForRepoFailure
        | SetCustomLabelsForSelfHostedRunnerForRepoSuccess
        | SetCustomLabelsForSelfHostedRunnerForRepoFailure
        | RemoveAllCustomLabelsFromSelfHostedRunnerForRepoSuccess
        | RemoveAllCustomLabelsFromSelfHostedRunnerForRepoFailure
        | RemoveCustomLabelFromSelfHostedRunnerForRepoSuccess
        | RemoveCustomLabelFromSelfHostedRunnerForRepoFailure
        | ListOrgActionsVariablesSuccess
        | ListOrgActionsVariablesFailure
        | CreateOrgActionsVariableSuccess
        | CreateOrgActionsVariableFailure
        | GetOrgActionsVariableSuccess
        | GetOrgActionsVariableFailure
        | UpdateOrgActionsVariableSuccess
        | UpdateOrgActionsVariableFailure
        | DeleteOrgActionsVariableSuccess
        | DeleteOrgActionsVariableFailure
        | ListSelectedReposForOrgActionsVariableSuccess
        | ListSelectedReposForOrgActionsVariableFailure
        | SetSelectedReposForOrgActionsVariableSuccess
        | SetSelectedReposForOrgActionsVariableFailure
        | AddSelectedRepoToOrgActionsVariableSuccess
        | AddSelectedRepoToOrgActionsVariableFailure
        | RemoveSelectedRepoFromOrgActionsVariableSuccess
        | RemoveSelectedRepoFromOrgActionsVariableFailure
        | ListRepoOrganizationActionsVariablesSuccess
        | ListRepoOrganizationActionsVariablesFailure
        | ListRepoActionsVariablesSuccess
        | ListRepoActionsVariablesFailure
        | CreateRepoActionsVariableSuccess
        | CreateRepoActionsVariableFailure
        | GetRepoActionsVariableSuccess
        | GetRepoActionsVariableFailure
        | UpdateRepoActionsVariableSuccess
        | UpdateRepoActionsVariableFailure
        | DeleteRepoActionsVariableSuccess
        | DeleteRepoActionsVariableFailure
        | ListEnvironmentActionsVariablesSuccess
        | ListEnvironmentActionsVariablesFailure
        | CreateEnvironmentActionsVariableSuccess
        | CreateEnvironmentActionsVariableFailure
        | GetEnvironmentActionsVariableSuccess
        | GetEnvironmentActionsVariableFailure
        | UpdateEnvironmentActionsVariableSuccess
        | UpdateEnvironmentActionsVariableFailure
        | DeleteEnvironmentActionsVariableSuccess
        | DeleteEnvironmentActionsVariableFailure
        | GetJobForWorkflowRunSuccess
        | GetJobForWorkflowRunFailure
        | DownloadJobLogsForWorkflowRunSuccess
        | DownloadJobLogsForWorkflowRunFailure
        | ListJobsForWorkflowRunAttemptSuccess
        | ListJobsForWorkflowRunAttemptFailure
        | ListJobsForWorkflowRunSuccess
        | ListJobsForWorkflowRunFailure
        | ReRunJobForWorkflowRunSuccess
        | ReRunJobForWorkflowRunFailure
        | ListWorkflowRunsForRepoSuccess
        | ListWorkflowRunsForRepoFailure
        | GetWorkflowRunSuccess
        | GetWorkflowRunFailure
        | DeleteWorkflowRunSuccess
        | DeleteWorkflowRunFailure
        | GetReviewsForWorkflowRunSuccess
        | GetReviewsForWorkflowRunFailure
        | ApproveWorkflowRunSuccess
        | ApproveWorkflowRunFailure
        | GetWorkflowRunAttemptSuccess
        | GetWorkflowRunAttemptFailure
        | DownloadWorkflowRunAttemptLogsSuccess
        | DownloadWorkflowRunAttemptLogsFailure
        | CancelWorkflowRunSuccess
        | CancelWorkflowRunFailure
        | ReviewCustomGatesForWorkflowRunSuccess
        | ReviewCustomGatesForWorkflowRunFailure
        | ForceCancelWorkflowRunSuccess
        | ForceCancelWorkflowRunFailure
        | DownloadWorkflowRunLogsSuccess
        | DownloadWorkflowRunLogsFailure
        | DeleteWorkflowRunLogsSuccess
        | DeleteWorkflowRunLogsFailure
        | GetPendingDeploymentsForWorkflowRunSuccess
        | GetPendingDeploymentsForWorkflowRunFailure
        | ReviewPendingDeploymentsForWorkflowRunSuccess
        | ReviewPendingDeploymentsForWorkflowRunFailure
        | ReRunWorkflowSuccess
        | ReRunWorkflowFailure
        | ReRunWorkflowFailedJobsSuccess
        | ReRunWorkflowFailedJobsFailure
        | GetWorkflowRunUsageSuccess
        | GetWorkflowRunUsageFailure
        | ListWorkflowRunsSuccess
        | ListWorkflowRunsFailure
        | ListRepoWorkflowsSuccess
        | ListRepoWorkflowsFailure
        | GetWorkflowSuccess
        | GetWorkflowFailure
        | DisableWorkflowSuccess
        | DisableWorkflowFailure
        | CreateWorkflowDispatchSuccess
        | CreateWorkflowDispatchFailure
        | EnableWorkflowSuccess
        | EnableWorkflowFailure
        | GetWorkflowUsageSuccess
        | GetWorkflowUsageFailure
        | ListPublicEventsSuccess
        | ListPublicEventsFailure
        | ListPublicEventsForRepoNetworkSuccess
        | ListPublicEventsForRepoNetworkFailure
        | ListPublicOrgEventsSuccess
        | ListPublicOrgEventsFailure
        | ListRepoEventsSuccess
        | ListRepoEventsFailure
        | ListEventsForAuthenticatedUserSuccess
        | ListEventsForAuthenticatedUserFailure
        | ListOrgEventsForAuthenticatedUserSuccess
        | ListOrgEventsForAuthenticatedUserFailure
        | ListPublicEventsForUserSuccess
        | ListPublicEventsForUserFailure
        | ListReceivedEventsForUserSuccess
        | ListReceivedEventsForUserFailure
        | ListReceivedPublicEventsForUserSuccess
        | ListReceivedPublicEventsForUserFailure
        | GetFeedsSuccess
        | GetFeedsFailure
        | ListNotificationsForAuthenticatedUserSuccess
        | ListNotificationsForAuthenticatedUserFailure
        | MarkNotificationsAsReadSuccess
        | MarkNotificationsAsReadFailure
        | GetThreadSuccess
        | GetThreadFailure
        | MarkThreadAsReadSuccess
        | MarkThreadAsReadFailure
        | MarkThreadAsDoneSuccess
        | MarkThreadAsDoneFailure
        | GetThreadSubscriptionForAuthenticatedUserSuccess
        | GetThreadSubscriptionForAuthenticatedUserFailure
        | SetThreadSubscriptionSuccess
        | SetThreadSubscriptionFailure
        | DeleteThreadSubscriptionSuccess
        | DeleteThreadSubscriptionFailure
        | ListRepoNotificationsForAuthenticatedUserSuccess
        | ListRepoNotificationsForAuthenticatedUserFailure
        | MarkRepoNotificationsAsReadSuccess
        | MarkRepoNotificationsAsReadFailure
        | ListStargazersSuccess
        | ListStargazersFailure
        | ListReposStarredByAuthenticatedUserSuccess
        | ListReposStarredByAuthenticatedUserFailure
        | CheckRepoIsStarredByAuthenticatedUserSuccess
        | CheckRepoIsStarredByAuthenticatedUserFailure
        | StarRepoForAuthenticatedUserSuccess
        | StarRepoForAuthenticatedUserFailure
        | UnstarRepoForAuthenticatedUserSuccess
        | UnstarRepoForAuthenticatedUserFailure
        | ListReposStarredByUserSuccess
        | ListReposStarredByUserFailure
        | ListWatchersSuccess
        | ListWatchersFailure
        | GetRepoSubscriptionSuccess
        | GetRepoSubscriptionFailure
        | SetRepoSubscriptionSuccess
        | SetRepoSubscriptionFailure
        | DeleteRepoSubscriptionSuccess
        | DeleteRepoSubscriptionFailure
        | ListWatchedReposForAuthenticatedUserSuccess
        | ListWatchedReposForAuthenticatedUserFailure
        | ListReposWatchedByUserSuccess
        | ListReposWatchedByUserFailure
        | ListAgentTasksForRepoSuccess
        | ListAgentTasksForRepoFailure
        | StartAgentTaskSuccess
        | StartAgentTaskFailure
        | GetAgentTaskForRepoSuccess
        | GetAgentTaskForRepoFailure
        | ListAgentTasksSuccess
        | ListAgentTasksFailure
        | GetAgentTaskSuccess
        | GetAgentTaskFailure
        | ListOrgAgentSecretsSuccess
        | ListOrgAgentSecretsFailure
        | GetOrgAgentPublicKeySuccess
        | GetOrgAgentPublicKeyFailure
        | GetOrgAgentSecretSuccess
        | GetOrgAgentSecretFailure
        | CreateOrUpdateOrgAgentSecretSuccess
        | CreateOrUpdateOrgAgentSecretFailure
        | DeleteOrgAgentSecretSuccess
        | DeleteOrgAgentSecretFailure
        | ListSelectedReposForOrgAgentSecretSuccess
        | ListSelectedReposForOrgAgentSecretFailure
        | SetSelectedReposForOrgAgentSecretSuccess
        | SetSelectedReposForOrgAgentSecretFailure
        | AddSelectedRepoToOrgAgentSecretSuccess
        | AddSelectedRepoToOrgAgentSecretFailure
        | RemoveSelectedRepoFromOrgAgentSecretSuccess
        | RemoveSelectedRepoFromOrgAgentSecretFailure
        | ListRepoOrganizationAgentSecretsSuccess
        | ListRepoOrganizationAgentSecretsFailure
        | ListRepoAgentSecretsSuccess
        | ListRepoAgentSecretsFailure
        | GetRepoAgentPublicKeySuccess
        | GetRepoAgentPublicKeyFailure
        | GetRepoAgentSecretSuccess
        | GetRepoAgentSecretFailure
        | CreateOrUpdateRepoAgentSecretSuccess
        | CreateOrUpdateRepoAgentSecretFailure
        | DeleteRepoAgentSecretSuccess
        | DeleteRepoAgentSecretFailure
        | ListOrgAgentVariablesSuccess
        | ListOrgAgentVariablesFailure
        | CreateOrgAgentVariableSuccess
        | CreateOrgAgentVariableFailure
        | GetOrgAgentVariableSuccess
        | GetOrgAgentVariableFailure
        | UpdateOrgAgentVariableSuccess
        | UpdateOrgAgentVariableFailure
        | DeleteOrgAgentVariableSuccess
        | DeleteOrgAgentVariableFailure
        | ListSelectedReposForOrgAgentVariableSuccess
        | ListSelectedReposForOrgAgentVariableFailure
        | SetSelectedReposForOrgAgentVariableSuccess
        | SetSelectedReposForOrgAgentVariableFailure
        | AddSelectedRepoToOrgAgentVariableSuccess
        | AddSelectedRepoToOrgAgentVariableFailure
        | RemoveSelectedRepoFromOrgAgentVariableSuccess
        | RemoveSelectedRepoFromOrgAgentVariableFailure
        | ListRepoOrganizationAgentVariablesSuccess
        | ListRepoOrganizationAgentVariablesFailure
        | ListRepoAgentVariablesSuccess
        | ListRepoAgentVariablesFailure
        | CreateRepoAgentVariableSuccess
        | CreateRepoAgentVariableFailure
        | GetRepoAgentVariableSuccess
        | GetRepoAgentVariableFailure
        | UpdateRepoAgentVariableSuccess
        | UpdateRepoAgentVariableFailure
        | DeleteRepoAgentVariableSuccess
        | DeleteRepoAgentVariableFailure
        | GetAuthenticatedAppSuccess
        | GetAuthenticatedAppFailure
        | CreateGithubAppFromManifestSuccess
        | CreateGithubAppFromManifestFailure
        | ListInstallationRequestsForAuthenticatedAppSuccess
        | ListInstallationRequestsForAuthenticatedAppFailure
        | ListInstallationsForAuthenticatedAppSuccess
        | ListInstallationsForAuthenticatedAppFailure
        | GetInstallationForAuthenticatedAppSuccess
        | GetInstallationForAuthenticatedAppFailure
        | DeleteInstallationForAuthenticatedAppSuccess
        | DeleteInstallationForAuthenticatedAppFailure
        | CreateInstallationAccessTokenSuccess
        | CreateInstallationAccessTokenFailure
        | SuspendAppInstallationSuccess
        | SuspendAppInstallationFailure
        | UnsuspendAppInstallationSuccess
        | UnsuspendAppInstallationFailure
        | CreateScopedAccessTokenSuccess
        | CreateScopedAccessTokenFailure
        | GetAppSuccess
        | GetAppFailure
        | GetOrgInstallationForAuthenticatedAppSuccess
        | GetOrgInstallationForAuthenticatedAppFailure
        | GetRepoInstallationForAuthenticatedAppSuccess
        | GetRepoInstallationForAuthenticatedAppFailure
        | GetUserInstallationForAuthenticatedAppSuccess
        | GetUserInstallationForAuthenticatedAppFailure
        | ListReposAccessibleToInstallationSuccess
        | ListReposAccessibleToInstallationFailure
        | RevokeInstallationAccessTokenSuccess
        | RevokeInstallationAccessTokenFailure
        | ListAppInstallationsAccessibleToUserSuccess
        | ListAppInstallationsAccessibleToUserFailure
        | ListInstallationReposForAuthenticatedUserSuccess
        | ListInstallationReposForAuthenticatedUserFailure
        | AddRepoToAppInstallationSuccess
        | AddRepoToAppInstallationFailure
        | RemoveRepoFromAppInstallationSuccess
        | RemoveRepoFromAppInstallationFailure
        | GetMarketplaceSubscriptionPlanForAccountSuccess
        | GetMarketplaceSubscriptionPlanForAccountFailure
        | ListMarketplacePlansSuccess
        | ListMarketplacePlansFailure
        | ListMarketplaceAccountsForPlanSuccess
        | ListMarketplaceAccountsForPlanFailure
        | GetMarketplaceSubscriptionPlanForAccountStubbedSuccess
        | GetMarketplaceSubscriptionPlanForAccountStubbedFailure
        | ListMarketplacePlansStubbedSuccess
        | ListMarketplacePlansStubbedFailure
        | ListMarketplaceAccountsForPlanStubbedSuccess
        | ListMarketplaceAccountsForPlanStubbedFailure
        | ListMarketplacePurchasesForAuthenticatedUserSuccess
        | ListMarketplacePurchasesForAuthenticatedUserFailure
        | ListMarketplacePurchasesForAuthenticatedUserStubbedSuccess
        | ListMarketplacePurchasesForAuthenticatedUserStubbedFailure
        | DeleteAppAuthorizationSuccess
        | DeleteAppAuthorizationFailure
        | CheckAppTokenSuccess
        | CheckAppTokenFailure
        | ResetAppTokenSuccess
        | ResetAppTokenFailure
        | DeleteAppTokenSuccess
        | DeleteAppTokenFailure
        | GetAppWebhookConfigSuccess
        | GetAppWebhookConfigFailure
        | UpdateAppWebhookConfigSuccess
        | UpdateAppWebhookConfigFailure
        | ListAppWebhookDeliveriesSuccess
        | ListAppWebhookDeliveriesFailure
        | GetAppWebhookDeliverySuccess
        | GetAppWebhookDeliveryFailure
        | RedeliverAppWebhookDeliverySuccess
        | RedeliverAppWebhookDeliveryFailure
        | GetOrgAdvancedSecurityActiveCommittersSuccess
        | GetOrgAdvancedSecurityActiveCommittersFailure
        | ListOrgBudgetsSuccess
        | ListOrgBudgetsFailure
        | CreateOrgBudgetSuccess
        | CreateOrgBudgetFailure
        | GetOrgBudgetSuccess
        | GetOrgBudgetFailure
        | UpdateOrgBudgetSuccess
        | UpdateOrgBudgetFailure
        | DeleteOrgBudgetSuccess
        | DeleteOrgBudgetFailure
        | ListEnterpriseCostCentersSuccess
        | ListEnterpriseCostCentersFailure
        | CreateEnterpriseCostCenterSuccess
        | CreateEnterpriseCostCenterFailure
        | GetEnterpriseCostCenterSuccess
        | GetEnterpriseCostCenterFailure
        | UpdateEnterpriseCostCenterSuccess
        | UpdateEnterpriseCostCenterFailure
        | DeleteEnterpriseCostCenterSuccess
        | DeleteEnterpriseCostCenterFailure
        | AddResourcesToEnterpriseCostCenterSuccess
        | AddResourcesToEnterpriseCostCenterFailure
        | RemoveResourcesFromEnterpriseCostCenterSuccess
        | RemoveResourcesFromEnterpriseCostCenterFailure
        | GetOrgAiCreditBillingUsageSuccess
        | GetOrgAiCreditBillingUsageFailure
        | GetOrgPremiumRequestBillingUsageSuccess
        | GetOrgPremiumRequestBillingUsageFailure
        | GetOrgBillingUsageSuccess
        | GetOrgBillingUsageFailure
        | GetOrgBillingUsageSummarySuccess
        | GetOrgBillingUsageSummaryFailure
        | GetUserAiCreditBillingUsageSuccess
        | GetUserAiCreditBillingUsageFailure
        | GetUserPremiumRequestBillingUsageSuccess
        | GetUserPremiumRequestBillingUsageFailure
        | GetUserBillingUsageSuccess
        | GetUserBillingUsageFailure
        | GetUserBillingUsageSummarySuccess
        | GetUserBillingUsageSummaryFailure
        | ListEnterpriseUsageReportExportsSuccess
        | ListEnterpriseUsageReportExportsFailure
        | CreateEnterpriseUsageReportExportSuccess
        | CreateEnterpriseUsageReportExportFailure
        | GetEnterpriseUsageReportExportSuccess
        | GetEnterpriseUsageReportExportFailure
        | ListRepoBranchesSuccess
        | ListRepoBranchesFailure
        | GetRepoBranchSuccess
        | GetRepoBranchFailure
        | RenameRepoBranchSuccess
        | RenameRepoBranchFailure
        | SyncForkBranchWithUpstreamSuccess
        | SyncForkBranchWithUpstreamFailure
        | MergeRepoBranchSuccess
        | MergeRepoBranchFailure
        | GetRepoBranchProtectionSuccess
        | GetRepoBranchProtectionFailure
        | UpdateRepoBranchProtectionSuccess
        | UpdateRepoBranchProtectionFailure
        | DeleteRepoBranchProtectionSuccess
        | DeleteRepoBranchProtectionFailure
        | GetAdminBranchProtectionSuccess
        | GetAdminBranchProtectionFailure
        | SetAdminBranchProtectionSuccess
        | SetAdminBranchProtectionFailure
        | DeleteAdminBranchProtectionSuccess
        | DeleteAdminBranchProtectionFailure
        | GetPullRequestReviewProtectionSuccess
        | GetPullRequestReviewProtectionFailure
        | UpdatePullRequestReviewProtectionSuccess
        | UpdatePullRequestReviewProtectionFailure
        | DeletePullRequestReviewProtectionSuccess
        | DeletePullRequestReviewProtectionFailure
        | GetCommitSignatureProtectionSuccess
        | GetCommitSignatureProtectionFailure
        | CreateCommitSignatureProtectionSuccess
        | CreateCommitSignatureProtectionFailure
        | DeleteCommitSignatureProtectionSuccess
        | DeleteCommitSignatureProtectionFailure
        | GetStatusChecksProtectionSuccess
        | GetStatusChecksProtectionFailure
        | UpdateStatusCheckProtectionSuccess
        | UpdateStatusCheckProtectionFailure
        | RemoveStatusCheckProtectionSuccess
        | RemoveStatusCheckProtectionFailure
        | GetAllStatusCheckContextsSuccess
        | GetAllStatusCheckContextsFailure
        | AddStatusCheckContextsSuccess
        | AddStatusCheckContextsFailure
        | SetStatusCheckContextsSuccess
        | SetStatusCheckContextsFailure
        | RemoveStatusCheckContextsSuccess
        | RemoveStatusCheckContextsFailure
        | GetAccessRestrictionsSuccess
        | GetAccessRestrictionsFailure
        | DeleteAccessRestrictionsSuccess
        | DeleteAccessRestrictionsFailure
        | GetAppsWithAccessToProtectedBranchSuccess
        | GetAppsWithAccessToProtectedBranchFailure
        | AddAppAccessRestrictionsSuccess
        | AddAppAccessRestrictionsFailure
        | SetAppAccessRestrictionsSuccess
        | SetAppAccessRestrictionsFailure
        | RemoveAppAccessRestrictionsSuccess
        | RemoveAppAccessRestrictionsFailure
        | GetTeamsWithAccessToProtectedBranchSuccess
        | GetTeamsWithAccessToProtectedBranchFailure
        | AddTeamAccessRestrictionsSuccess
        | AddTeamAccessRestrictionsFailure
        | SetTeamAccessRestrictionsSuccess
        | SetTeamAccessRestrictionsFailure
        | RemoveTeamAccessRestrictionsSuccess
        | RemoveTeamAccessRestrictionsFailure
        | GetUsersWithAccessToProtectedBranchSuccess
        | GetUsersWithAccessToProtectedBranchFailure
        | AddUserAccessRestrictionsSuccess
        | AddUserAccessRestrictionsFailure
        | SetUserAccessRestrictionsSuccess
        | SetUserAccessRestrictionsFailure
        | RemoveUserAccessRestrictionsSuccess
        | RemoveUserAccessRestrictionsFailure
        | ListOrgCampaignsSuccess
        | ListOrgCampaignsFailure
        | CreateOrgCampaignSuccess
        | CreateOrgCampaignFailure
        | GetOrgCampaignSuccess
        | GetOrgCampaignFailure
        | UpdateOrgCampaignSuccess
        | UpdateOrgCampaignFailure
        | DeleteOrgCampaignSuccess
        | DeleteOrgCampaignFailure
        | CreateCheckRunFailure
        | CreateCheckRunSuccess
        | GetCheckRunFailure
        | GetCheckRunSuccess
        | UpdateCheckRunFailure
        | UpdateCheckRunSuccess
        | ListCheckRunAnnotationsFailure
        | ListCheckRunAnnotationsSuccess
        | RerequestCheckRunFailure
        | RerequestCheckRunSuccess
        | ListCheckRunsForSuiteFailure
        | ListCheckRunsForSuiteSuccess
        | ListCheckRunsForRefFailure
        | ListCheckRunsForRefSuccess
        | CreateCheckSuiteSuccess
        | CreateCheckSuiteFailure
        | SetCheckSuitesPreferencesSuccess
        | SetCheckSuitesPreferencesFailure
        | GetCheckSuiteSuccess
        | GetCheckSuiteFailure
        | RerequestCheckSuiteSuccess
        | RerequestCheckSuiteFailure
        | ListCheckSuitesForRefSuccess
        | ListCheckSuitesForRefFailure
        | GetClassroomAssignmentSuccess
        | GetClassroomAssignmentFailure
        | ListAcceptedClassroomAssignmentsSuccess
        | ListAcceptedClassroomAssignmentsFailure
        | GetClassroomAssignmentGradesSuccess
        | GetClassroomAssignmentGradesFailure
        | ListClassroomsSuccess
        | ListClassroomsFailure
        | GetClassroomSuccess
        | GetClassroomFailure
        | ListClassroomAssignmentsSuccess
        | ListClassroomAssignmentsFailure
        | ListRepoCodeQualityFindingsSuccess
        | ListRepoCodeQualityFindingsFailure
        | GetRepoCodeQualityFindingSuccess
        | GetRepoCodeQualityFindingFailure
        | GetRepoCodeQualitySetupSuccess
        | GetRepoCodeQualitySetupFailure
        | UpdateRepoCodeQualitySetupSuccess
        | UpdateRepoCodeQualitySetupFailure
        | ListOrgCodeScanningDismissalRequestsSuccess
        | ListOrgCodeScanningDismissalRequestsFailure
        | ListRepoCodeScanningDismissalRequestsSuccess
        | ListRepoCodeScanningDismissalRequestsFailure
        | GetRepoCodeScanningDismissalRequestSuccess
        | GetRepoCodeScanningDismissalRequestFailure
        | ReviewRepoCodeScanningDismissalRequestSuccess
        | ReviewRepoCodeScanningDismissalRequestFailure
        | ListOrgCodeScanningAlertsSuccess
        | ListOrgCodeScanningAlertsFailure
        | ListRepoCodeScanningAlertsSuccess
        | ListRepoCodeScanningAlertsFailure
        | ListCodeScanningAlertInstancesSuccess
        | ListCodeScanningAlertInstancesFailure
        | ListRepoCodeScanningAnalysesSuccess
        | ListRepoCodeScanningAnalysesFailure
        | GetCodeScanningAlertSuccess
        | GetCodeScanningAlertFailure
        | UpdateCodeScanningAlertSuccess
        | UpdateCodeScanningAlertFailure
        | GetCodeScanningAutofixSuccess
        | GetCodeScanningAutofixFailure
        | CreateCodeScanningAutofixSuccess
        | CreateCodeScanningAutofixFailure
        | CommitCodeScanningAutofixSuccess
        | CommitCodeScanningAutofixFailure
        | GetCodeScanningAnalysisSuccess
        | GetCodeScanningAnalysisFailure
        | DeleteCodeScanningAnalysisSuccess
        | DeleteCodeScanningAnalysisFailure
        | ListCodeqlDatabasesSuccess
        | ListCodeqlDatabasesFailure
        | GetCodeqlDatabaseSuccess
        | GetCodeqlDatabaseFailure
        | DeleteCodeqlDatabaseSuccess
        | DeleteCodeqlDatabaseFailure
        | CreateCodeqlVariantAnalysisSuccess
        | CreateCodeqlVariantAnalysisFailure
        | GetCodeqlVariantAnalysisSuccess
        | GetCodeqlVariantAnalysisFailure
        | GetCodeqlVariantAnalysisRepoTaskSuccess
        | GetCodeqlVariantAnalysisRepoTaskFailure
        | GetCodeScanningDefaultSetupSuccess
        | GetCodeScanningDefaultSetupFailure
        | UpdateCodeScanningDefaultSetupSuccess
        | UpdateCodeScanningDefaultSetupFailure
        | UploadCodeScanningSarifSuccess
        | UploadCodeScanningSarifFailure
        | GetCodeScanningSarifSuccess
        | GetCodeScanningSarifFailure
        | ListEnterpriseCodeSecurityConfigurationsSuccess
        | ListEnterpriseCodeSecurityConfigurationsFailure
        | CreateEnterpriseCodeSecurityConfigurationSuccess
        | CreateEnterpriseCodeSecurityConfigurationFailure
        | ListEnterpriseCodeSecurityDefaultConfigurationsSuccess
        | ListEnterpriseCodeSecurityDefaultConfigurationsFailure
        | GetEnterpriseCodeSecurityConfigurationSuccess
        | GetEnterpriseCodeSecurityConfigurationFailure
        | UpdateEnterpriseCodeSecurityConfigurationSuccess
        | UpdateEnterpriseCodeSecurityConfigurationFailure
        | DeleteEnterpriseCodeSecurityConfigurationSuccess
        | DeleteEnterpriseCodeSecurityConfigurationFailure
        | AttachEnterpriseCodeSecurityConfigurationSuccess
        | AttachEnterpriseCodeSecurityConfigurationFailure
        | SetEnterpriseCodeSecurityConfigurationAsDefaultSuccess
        | SetEnterpriseCodeSecurityConfigurationAsDefaultFailure
        | ListEnterpriseCodeSecurityConfigurationRepositoriesSuccess
        | ListEnterpriseCodeSecurityConfigurationRepositoriesFailure
        | ListOrgCodeSecurityConfigurationsSuccess
        | ListOrgCodeSecurityConfigurationsFailure
        | CreateOrgCodeSecurityConfigurationSuccess
        | CreateOrgCodeSecurityConfigurationFailure
        | ListOrgCodeSecurityDefaultConfigurationsSuccess
        | ListOrgCodeSecurityDefaultConfigurationsFailure
        | DetachOrgCodeSecurityConfigurationsSuccess
        | DetachOrgCodeSecurityConfigurationsFailure
        | GetOrgCodeSecurityConfigurationSuccess
        | GetOrgCodeSecurityConfigurationFailure
        | UpdateOrgCodeSecurityConfigurationSuccess
        | UpdateOrgCodeSecurityConfigurationFailure
        | DeleteOrgCodeSecurityConfigurationSuccess
        | DeleteOrgCodeSecurityConfigurationFailure
        | AttachOrgCodeSecurityConfigurationSuccess
        | AttachOrgCodeSecurityConfigurationFailure
        | SetOrgCodeSecurityConfigurationAsDefaultSuccess
        | SetOrgCodeSecurityConfigurationAsDefaultFailure
        | ListOrgCodeSecurityConfigurationRepositoriesSuccess
        | ListOrgCodeSecurityConfigurationRepositoriesFailure
        | GetRepoCodeSecurityConfigurationSuccess
        | GetRepoCodeSecurityConfigurationFailure
        | ListCodesOfConductSuccess
        | ListCodesOfConductFailure
        | GetCodeOfConductSuccess
        | GetCodeOfConductFailure
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
        | GetOrgRulesetVersionSuccess
        | GetOrgRulesetVersionFailure
        | AddOrgSecurityManagerTeamSuccess
        | AddOrgSecurityManagerTeamFailure
        | RemoveOrgSecurityManagerTeamSuccess
        | RemoveOrgSecurityManagerTeamFailure
        | ListOrgSecurityManagerTeamsSuccess
        | ListOrgSecurityManagerTeamsFailure
        | CreateOrgWebhookSuccess
        | CreateOrgWebhookFailure
        | GetOrgWebhookConfigSuccess
        | GetOrgWebhookConfigFailure
        | GetOrgWebhookSuccess
        | GetOrgWebhookFailure
        | UpdateOrgWebhookConfigSuccess
        | UpdateOrgWebhookConfigFailure
        | UpdateOrgWebhookSuccess
        | UpdateOrgWebhookFailure
        | DeleteOrgWebhookSuccess
        | DeleteOrgWebhookFailure
        | GetOrgWebhookDeliverySuccess
        | GetOrgWebhookDeliveryFailure
        | PingOrgWebhookSuccess
        | PingOrgWebhookFailure
        | RedeliverOrgWebhookDeliverySuccess
        | RedeliverOrgWebhookDeliveryFailure
        | ListOrgWebhookDeliveriesSuccess
        | ListOrgWebhookDeliveriesFailure
        | ListOrgWebhooksSuccess
        | ListOrgWebhooksFailure
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
        | ListRepoCodespacesFailure
        | ListRepoCodespacesSuccess
        | CreateRepoCodespaceFailure
        | CreateRepoCodespaceSuccess
        | ListRepoCodespaceDevcontainersFailure
        | ListRepoCodespaceDevcontainersSuccess
        | GetRepoCodespaceDefaultsFailure
        | GetRepoCodespaceDefaultsSuccess
        | CheckRepoCodespacePermissionsFailure
        | CheckRepoCodespacePermissionsSuccess
        | CreatePullRequestCodespaceFailure
        | CreatePullRequestCodespaceSuccess
        | ListUserCodespacesFailure
        | ListUserCodespacesSuccess
        | CreateUserCodespaceFailure
        | CreateUserCodespaceSuccess
        | GetUserCodespaceFailure
        | GetUserCodespaceSuccess
        | UpdateUserCodespaceFailure
        | UpdateUserCodespaceSuccess
        | DeleteUserCodespaceFailure
        | DeleteUserCodespaceSuccess
        | ExportUserCodespaceFailure
        | ExportUserCodespaceSuccess
        | GetUserCodespaceExportFailure
        | GetUserCodespaceExportSuccess
        | PublishUserCodespaceFailure
        | PublishUserCodespaceSuccess
        | StartUserCodespaceFailure
        | StartUserCodespaceSuccess
        | StopUserCodespaceFailure
        | StopUserCodespaceSuccess
        | ListOrgCodespacesFailure
        | ListOrgCodespacesSuccess
        | SetOrgCodespacesAccessFailure
        | SetOrgCodespacesAccessSuccess
        | AddOrgCodespacesAccessUsersFailure
        | AddOrgCodespacesAccessUsersSuccess
        | RemoveOrgCodespacesAccessUsersFailure
        | RemoveOrgCodespacesAccessUsersSuccess
        | ListOrgUserCodespacesFailure
        | ListOrgUserCodespacesSuccess
        | DeleteOrgUserCodespaceFailure
        | DeleteOrgUserCodespaceSuccess
        | StopOrgUserCodespaceFailure
        | StopOrgUserCodespaceSuccess
        | ListOrgCodespacesSecretsFailure
        | ListOrgCodespacesSecretsSuccess
        | GetOrgCodespacesPublicKeyFailure
        | GetOrgCodespacesPublicKeySuccess
        | GetOrgCodespacesSecretFailure
        | GetOrgCodespacesSecretSuccess
        | CreateOrUpdateOrgCodespacesSecretFailure
        | CreateOrUpdateOrgCodespacesSecretSuccess
        | DeleteOrgCodespacesSecretFailure
        | DeleteOrgCodespacesSecretSuccess
        | ListSelectedReposForOrgCodespacesSecretFailure
        | ListSelectedReposForOrgCodespacesSecretSuccess
        | SetSelectedReposForOrgCodespacesSecretFailure
        | SetSelectedReposForOrgCodespacesSecretSuccess
        | AddSelectedRepoToOrgCodespacesSecretFailure
        | AddSelectedRepoToOrgCodespacesSecretSuccess
        | RemoveSelectedRepoFromOrgCodespacesSecretFailure
        | RemoveSelectedRepoFromOrgCodespacesSecretSuccess
        | ListRepoCodespaceMachinesFailure
        | ListRepoCodespaceMachinesSuccess
        | ListUserCodespaceMachinesFailure
        | ListUserCodespaceMachinesSuccess
        | ListRepoCodespacesSecretsFailure
        | ListRepoCodespacesSecretsSuccess
        | GetRepoCodespacesPublicKeyFailure
        | GetRepoCodespacesPublicKeySuccess
        | GetRepoCodespacesSecretFailure
        | GetRepoCodespacesSecretSuccess
        | CreateOrUpdateRepoCodespacesSecretFailure
        | CreateOrUpdateRepoCodespacesSecretSuccess
        | DeleteRepoCodespacesSecretFailure
        | DeleteRepoCodespacesSecretSuccess
        | ListUserCodespacesSecretsFailure
        | ListUserCodespacesSecretsSuccess
        | GetUserCodespacesPublicKeyFailure
        | GetUserCodespacesPublicKeySuccess
        | GetUserCodespacesSecretFailure
        | GetUserCodespacesSecretSuccess
        | CreateOrUpdateUserCodespacesSecretFailure
        | CreateOrUpdateUserCodespacesSecretSuccess
        | DeleteUserCodespacesSecretFailure
        | DeleteUserCodespacesSecretSuccess
        | ListReposForUserCodespacesSecretFailure
        | ListReposForUserCodespacesSecretSuccess
        | SetReposForUserCodespacesSecretFailure
        | SetReposForUserCodespacesSecretSuccess
        | AddRepoToUserCodespacesSecretFailure
        | AddRepoToUserCodespacesSecretSuccess
        | RemoveRepoFromUserCodespacesSecretFailure
        | RemoveRepoFromUserCodespacesSecretSuccess
        | ListRepoCollaboratorsSuccess
        | ListRepoCollaboratorsFailure
        | CheckRepoCollaboratorSuccess
        | CheckRepoCollaboratorFailure
        | AddRepoCollaboratorSuccess
        | AddRepoCollaboratorFailure
        | RemoveRepoCollaboratorSuccess
        | RemoveRepoCollaboratorFailure
        | GetRepoCollaboratorPermissionSuccess
        | GetRepoCollaboratorPermissionFailure
        | ListRepoInvitationsSuccess
        | ListRepoInvitationsFailure
        | UpdateRepoInvitationSuccess
        | UpdateRepoInvitationFailure
        | DeleteRepoInvitationSuccess
        | DeleteRepoInvitationFailure
        | ListUserRepositoryInvitationsSuccess
        | ListUserRepositoryInvitationsFailure
        | AcceptRepositoryInvitationSuccess
        | AcceptRepositoryInvitationFailure
        | DeclineRepositoryInvitationSuccess
        | DeclineRepositoryInvitationFailure
        | ListRepoCommitsSuccess
        | ListRepoCommitsFailure
        | GetRepoCommitSuccess
        | GetRepoCommitFailure
        | CompareRepoCommitsSuccess
        | CompareRepoCommitsFailure
        | ListBranchesForHeadCommitSuccess
        | ListBranchesForHeadCommitFailure
        | ListPullRequestsAssociatedWithCommitSuccess
        | ListPullRequestsAssociatedWithCommitFailure
        | ListRepoCommitCommentsSuccess
        | ListRepoCommitCommentsFailure
        | GetCommitCommentSuccess
        | GetCommitCommentFailure
        | UpdateCommitCommentSuccess
        | UpdateCommitCommentFailure
        | DeleteCommitCommentSuccess
        | DeleteCommitCommentFailure
        | ListCommitCommentsSuccess
        | ListCommitCommentsFailure
        | CreateCommitCommentSuccess
        | CreateCommitCommentFailure
        | GetCombinedCommitStatusSuccess
        | GetCombinedCommitStatusFailure
        | ListCommitStatusesSuccess
        | ListCommitStatusesFailure
        | CreateCommitStatusSuccess
        | CreateCommitStatusFailure
        | GetRepoCopilotCloudAgentConfigurationSuccess
        | GetRepoCopilotCloudAgentConfigurationFailure
        | ListOrgCopilotSpaceCollaboratorsSuccess
        | ListOrgCopilotSpaceCollaboratorsFailure
        | AddOrgCopilotSpaceCollaboratorSuccess
        | AddOrgCopilotSpaceCollaboratorFailure
        | SetOrgCopilotSpaceCollaboratorRoleSuccess
        | SetOrgCopilotSpaceCollaboratorRoleFailure
        | RemoveOrgCopilotSpaceCollaboratorSuccess
        | RemoveOrgCopilotSpaceCollaboratorFailure
        | ListUserCopilotSpaceCollaboratorsSuccess
        | ListUserCopilotSpaceCollaboratorsFailure
        | AddUserCopilotSpaceCollaboratorSuccess
        | AddUserCopilotSpaceCollaboratorFailure
        | SetUserCopilotSpaceCollaboratorRoleSuccess
        | SetUserCopilotSpaceCollaboratorRoleFailure
        | RemoveUserCopilotSpaceCollaboratorSuccess
        | RemoveUserCopilotSpaceCollaboratorFailure
        | ListOrgCopilotSpacesSuccess
        | ListOrgCopilotSpacesFailure
        | CreateOrgCopilotSpaceSuccess
        | CreateOrgCopilotSpaceFailure
        | GetOrgCopilotSpaceSuccess
        | GetOrgCopilotSpaceFailure
        | SetOrgCopilotSpaceSuccess
        | SetOrgCopilotSpaceFailure
        | DeleteOrgCopilotSpaceSuccess
        | DeleteOrgCopilotSpaceFailure
        | ListUserCopilotSpacesSuccess
        | ListUserCopilotSpacesFailure
        | CreateUserCopilotSpaceSuccess
        | CreateUserCopilotSpaceFailure
        | GetUserCopilotSpaceSuccess
        | GetUserCopilotSpaceFailure
        | SetUserCopilotSpaceSuccess
        | SetUserCopilotSpaceFailure
        | DeleteUserCopilotSpaceSuccess
        | DeleteUserCopilotSpaceFailure
        | ListOrgCopilotSpaceResourcesSuccess
        | ListOrgCopilotSpaceResourcesFailure
        | CreateOrgCopilotSpaceResourceSuccess
        | CreateOrgCopilotSpaceResourceFailure
        | GetOrgCopilotSpaceResourceSuccess
        | GetOrgCopilotSpaceResourceFailure
        | SetOrgCopilotSpaceResourceSuccess
        | SetOrgCopilotSpaceResourceFailure
        | DeleteOrgCopilotSpaceResourceSuccess
        | DeleteOrgCopilotSpaceResourceFailure
        | ListUserCopilotSpaceResourcesSuccess
        | ListUserCopilotSpaceResourcesFailure
        | CreateUserCopilotSpaceResourceSuccess
        | CreateUserCopilotSpaceResourceFailure
        | GetUserCopilotSpaceResourceSuccess
        | GetUserCopilotSpaceResourceFailure
        | SetUserCopilotSpaceResourceSuccess
        | SetUserCopilotSpaceResourceFailure
        | DeleteUserCopilotSpaceResourceSuccess
        | DeleteUserCopilotSpaceResourceFailure
        | SetEnterpriseCopilotCodingAgentPolicySuccess
        | SetEnterpriseCopilotCodingAgentPolicyFailure
        | AddEnterpriseCopilotCodingAgentOrganizationsSuccess
        | AddEnterpriseCopilotCodingAgentOrganizationsFailure
        | RemoveEnterpriseCopilotCodingAgentOrganizationsSuccess
        | RemoveEnterpriseCopilotCodingAgentOrganizationsFailure
        | GetOrgCopilotCodingAgentPermissionsSuccess
        | GetOrgCopilotCodingAgentPermissionsFailure
        | SetOrgCopilotCodingAgentPermissionsSuccess
        | SetOrgCopilotCodingAgentPermissionsFailure
        | ListOrgCopilotCodingAgentRepositoriesSuccess
        | ListOrgCopilotCodingAgentRepositoriesFailure
        | SetOrgCopilotCodingAgentRepositoriesSuccess
        | SetOrgCopilotCodingAgentRepositoriesFailure
        | EnableOrgCopilotCodingAgentRepositorySuccess
        | EnableOrgCopilotCodingAgentRepositoryFailure
        | DisableOrgCopilotCodingAgentRepositorySuccess
        | DisableOrgCopilotCodingAgentRepositoryFailure
        | GetOrgCopilotContentExclusionSuccess
        | GetOrgCopilotContentExclusionFailure
        | SetOrgCopilotContentExclusionSuccess
        | SetOrgCopilotContentExclusionFailure
        | ListEnterpriseCopilotCustomAgentsSuccess
        | ListEnterpriseCopilotCustomAgentsFailure
        | GetEnterpriseCopilotCustomAgentsSourceSuccess
        | GetEnterpriseCopilotCustomAgentsSourceFailure
        | SetEnterpriseCopilotCustomAgentsSourceSuccess
        | SetEnterpriseCopilotCustomAgentsSourceFailure
        | DeleteEnterpriseCopilotCustomAgentsSourceSuccess
        | DeleteEnterpriseCopilotCustomAgentsSourceFailure
        | GetEnterpriseCopilotMetrics1DaySuccess
        | GetEnterpriseCopilotMetrics1DayFailure
        | GetEnterpriseCopilotMetrics28DaySuccess
        | GetEnterpriseCopilotMetrics28DayFailure
        | GetEnterpriseCopilotReposMetrics1DaySuccess
        | GetEnterpriseCopilotReposMetrics1DayFailure
        | GetEnterpriseCopilotUserTeamsMetrics1DaySuccess
        | GetEnterpriseCopilotUserTeamsMetrics1DayFailure
        | GetEnterpriseCopilotUsersMetrics1DaySuccess
        | GetEnterpriseCopilotUsersMetrics1DayFailure
        | GetEnterpriseCopilotUsersMetrics28DaySuccess
        | GetEnterpriseCopilotUsersMetrics28DayFailure
        | GetOrgCopilotMetrics1DaySuccess
        | GetOrgCopilotMetrics1DayFailure
        | GetOrgCopilotMetrics28DaySuccess
        | GetOrgCopilotMetrics28DayFailure
        | GetOrgCopilotReposMetrics1DaySuccess
        | GetOrgCopilotReposMetrics1DayFailure
        | GetOrgCopilotUserTeamsMetrics1DaySuccess
        | GetOrgCopilotUserTeamsMetrics1DayFailure
        | GetOrgCopilotUsersMetrics1DaySuccess
        | GetOrgCopilotUsersMetrics1DayFailure
        | GetOrgCopilotUsersMetrics28DaySuccess
        | GetOrgCopilotUsersMetrics28DayFailure
        | GetOrgCopilotBillingSuccess
        | GetOrgCopilotBillingFailure
        | ListOrgCopilotSeatsSuccess
        | ListOrgCopilotSeatsFailure
        | AddOrgCopilotSeatsForTeamsSuccess
        | AddOrgCopilotSeatsForTeamsFailure
        | RemoveOrgCopilotSeatsForTeamsSuccess
        | RemoveOrgCopilotSeatsForTeamsFailure
        | AddOrgCopilotSeatsForUsersSuccess
        | AddOrgCopilotSeatsForUsersFailure
        | RemoveOrgCopilotSeatsForUsersSuccess
        | RemoveOrgCopilotSeatsForUsersFailure
        | GetOrgCopilotSeatDetailsForUserSuccess
        | GetOrgCopilotSeatDetailsForUserFailure
        | RevokeCredentialsSuccess
        | RevokeCredentialsFailure
        | ListOrgDependabotDismissalRequestsSuccess
        | ListOrgDependabotDismissalRequestsFailure
        | ListRepoDependabotDismissalRequestsSuccess
        | ListRepoDependabotDismissalRequestsFailure
        | GetRepoDependabotDismissalRequestSuccess
        | GetRepoDependabotDismissalRequestFailure
        | CreateRepoDependabotDismissalRequestSuccess
        | CreateRepoDependabotDismissalRequestFailure
        | ReviewRepoDependabotDismissalRequestSuccess
        | ReviewRepoDependabotDismissalRequestFailure
        | CancelRepoDependabotDismissalRequestSuccess
        | CancelRepoDependabotDismissalRequestFailure
        | ListEnterpriseDependabotAlertsSuccess
        | ListEnterpriseDependabotAlertsFailure
        | ListOrgDependabotAlertsSuccess
        | ListOrgDependabotAlertsFailure
        | ListRepoDependabotAlertsSuccess
        | ListRepoDependabotAlertsFailure
        | GetRepoDependabotAlertSuccess
        | GetRepoDependabotAlertFailure
        | UpdateRepoDependabotAlertSuccess
        | UpdateRepoDependabotAlertFailure
        | ListOrgDependabotSecretsSuccess
        | ListOrgDependabotSecretsFailure
        | GetOrgDependabotPublicKeySuccess
        | GetOrgDependabotPublicKeyFailure
        | GetOrgDependabotSecretSuccess
        | GetOrgDependabotSecretFailure
        | CreateOrUpdateOrgDependabotSecretSuccess
        | CreateOrUpdateOrgDependabotSecretFailure
        | DeleteOrgDependabotSecretSuccess
        | DeleteOrgDependabotSecretFailure
        | ListSelectedReposForOrgDependabotSecretSuccess
        | ListSelectedReposForOrgDependabotSecretFailure
        | SetSelectedReposForOrgDependabotSecretSuccess
        | SetSelectedReposForOrgDependabotSecretFailure
        | AddSelectedRepoToOrgDependabotSecretSuccess
        | AddSelectedRepoToOrgDependabotSecretFailure
        | RemoveSelectedRepoFromOrgDependabotSecretSuccess
        | RemoveSelectedRepoFromOrgDependabotSecretFailure
        | ListRepoDependabotSecretsSuccess
        | ListRepoDependabotSecretsFailure
        | GetRepoDependabotPublicKeySuccess
        | GetRepoDependabotPublicKeyFailure
        | GetRepoDependabotSecretSuccess
        | GetRepoDependabotSecretFailure
        | CreateOrUpdateRepoDependabotSecretSuccess
        | CreateOrUpdateRepoDependabotSecretFailure
        | DeleteRepoDependabotSecretSuccess
        | DeleteRepoDependabotSecretFailure
        | ListEnterpriseDependabotRepositoryAccessSuccess
        | ListEnterpriseDependabotRepositoryAccessFailure
        | UpdateEnterpriseDependabotRepositoryAccessSuccess
        | UpdateEnterpriseDependabotRepositoryAccessFailure
        | SetEnterpriseDependabotRepositoryAccessDefaultLevelSuccess
        | SetEnterpriseDependabotRepositoryAccessDefaultLevelFailure
        | ListOrgDependabotRepositoryAccessSuccess
        | ListOrgDependabotRepositoryAccessFailure
        | UpdateOrgDependabotRepositoryAccessSuccess
        | UpdateOrgDependabotRepositoryAccessFailure
        | SetOrgDependabotRepositoryAccessDefaultLevelSuccess
        | SetOrgDependabotRepositoryAccessDefaultLevelFailure
        | CompareRepoDependencyGraphSuccess
        | CompareRepoDependencyGraphFailure
        | CreateRepoDependencySnapshotSuccess
        | CreateRepoDependencySnapshotFailure
        | ExportRepoSbomSuccess
        | ExportRepoSbomFailure
        | FetchRepoSbomReportSuccess
        | FetchRepoSbomReportFailure
        | GenerateRepoSbomReportSuccess
        | GenerateRepoSbomReportFailure
        | ListRepoDeployKeysSuccess
        | ListRepoDeployKeysFailure
        | CreateRepoDeployKeySuccess
        | CreateRepoDeployKeyFailure
        | GetRepoDeployKeySuccess
        | GetRepoDeployKeyFailure
        | DeleteRepoDeployKeySuccess
        | DeleteRepoDeployKeyFailure
        | ListRepoEnvironmentDeploymentBranchPoliciesSuccess
        | ListRepoEnvironmentDeploymentBranchPoliciesFailure
        | CreateRepoEnvironmentDeploymentBranchPolicySuccess
        | CreateRepoEnvironmentDeploymentBranchPolicyFailure
        | GetRepoEnvironmentDeploymentBranchPolicySuccess
        | GetRepoEnvironmentDeploymentBranchPolicyFailure
        | UpdateRepoEnvironmentDeploymentBranchPolicySuccess
        | UpdateRepoEnvironmentDeploymentBranchPolicyFailure
        | DeleteRepoEnvironmentDeploymentBranchPolicySuccess
        | DeleteRepoEnvironmentDeploymentBranchPolicyFailure
        | ListRepoDeploymentsSuccess
        | ListRepoDeploymentsFailure
        | CreateRepoDeploymentSuccess
        | CreateRepoDeploymentFailure
        | GetRepoDeploymentSuccess
        | GetRepoDeploymentFailure
        | DeleteRepoDeploymentSuccess
        | DeleteRepoDeploymentFailure
        | ListRepoEnvironmentsSuccess
        | ListRepoEnvironmentsFailure
        | GetRepoEnvironmentSuccess
        | GetRepoEnvironmentFailure
        | CreateOrUpdateRepoEnvironmentSuccess
        | CreateOrUpdateRepoEnvironmentFailure
        | DeleteRepoEnvironmentSuccess
        | DeleteRepoEnvironmentFailure
        | ListRepoEnvironmentDeploymentProtectionRulesSuccess
        | ListRepoEnvironmentDeploymentProtectionRulesFailure
        | CreateRepoEnvironmentDeploymentProtectionRuleSuccess
        | CreateRepoEnvironmentDeploymentProtectionRuleFailure
        | ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsSuccess
        | ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsFailure
        | GetRepoEnvironmentDeploymentProtectionRuleSuccess
        | GetRepoEnvironmentDeploymentProtectionRuleFailure
        | DeleteRepoEnvironmentDeploymentProtectionRuleSuccess
        | DeleteRepoEnvironmentDeploymentProtectionRuleFailure
        | ListRepoDeploymentStatusesSuccess
        | ListRepoDeploymentStatusesFailure
        | CreateRepoDeploymentStatusSuccess
        | CreateRepoDeploymentStatusFailure
        | GetRepoDeploymentStatusSuccess
        | GetRepoDeploymentStatusFailure
        | GetEmojisSuccess
        | GetEmojisFailure
        | ListEnterpriseTeamMembersSuccess
        | ListEnterpriseTeamMembersFailure
        | BulkAddEnterpriseTeamMembersSuccess
        | BulkAddEnterpriseTeamMembersFailure
        | BulkRemoveEnterpriseTeamMembersSuccess
        | BulkRemoveEnterpriseTeamMembersFailure
        | GetEnterpriseTeamMembershipSuccess
        | GetEnterpriseTeamMembershipFailure
        | AddEnterpriseTeamMemberSuccess
        | AddEnterpriseTeamMemberFailure
        | RemoveEnterpriseTeamMembershipSuccess
        | RemoveEnterpriseTeamMembershipFailure
        | ListEnterpriseTeamOrganizationAssignmentsSuccess
        | ListEnterpriseTeamOrganizationAssignmentsFailure
        | BulkAddEnterpriseTeamOrganizationAssignmentsSuccess
        | BulkAddEnterpriseTeamOrganizationAssignmentsFailure
        | BulkRemoveEnterpriseTeamOrganizationAssignmentsSuccess
        | BulkRemoveEnterpriseTeamOrganizationAssignmentsFailure
        | GetEnterpriseTeamOrganizationAssignmentSuccess
        | GetEnterpriseTeamOrganizationAssignmentFailure
        | AddEnterpriseTeamOrganizationAssignmentSuccess
        | AddEnterpriseTeamOrganizationAssignmentFailure
        | DeleteEnterpriseTeamOrganizationAssignmentSuccess
        | DeleteEnterpriseTeamOrganizationAssignmentFailure
        | ListEnterpriseTeamsSuccess
        | ListEnterpriseTeamsFailure
        | CreateEnterpriseTeamSuccess
        | CreateEnterpriseTeamFailure
        | GetEnterpriseTeamSuccess
        | GetEnterpriseTeamFailure
        | UpdateEnterpriseTeamSuccess
        | UpdateEnterpriseTeamFailure
        | DeleteEnterpriseTeamSuccess
        | DeleteEnterpriseTeamFailure
        | CreateRepoGitBlobSuccess
        | CreateRepoGitBlobFailure
        | GetRepoGitBlobSuccess
        | GetRepoGitBlobFailure
        | CreateRepoGitCommitSuccess
        | CreateRepoGitCommitFailure
        | GetRepoGitCommitSuccess
        | GetRepoGitCommitFailure
        | ListRepoGitMatchingRefsSuccess
        | ListRepoGitMatchingRefsFailure
        | GetRepoGitRefSuccess
        | GetRepoGitRefFailure
        | CreateRepoGitRefSuccess
        | CreateRepoGitRefFailure
        | UpdateRepoGitRefSuccess
        | UpdateRepoGitRefFailure
        | DeleteRepoGitRefSuccess
        | DeleteRepoGitRefFailure
        | CreateRepoGitTagSuccess
        | CreateRepoGitTagFailure
        | GetRepoGitTagSuccess
        | GetRepoGitTagFailure
        | CreateRepoGitTreeSuccess
        | CreateRepoGitTreeFailure
        | GetRepoGitTreeSuccess
        | GetRepoGitTreeFailure
        | ListGitignoreTemplatesSuccess
        | ListGitignoreTemplatesFailure
        | GetGitignoreTemplateSuccess
        | GetGitignoreTemplateFailure
        | GetOrgInteractionLimitsSuccess
        | GetOrgInteractionLimitsFailure
        | SetOrgInteractionLimitsSuccess
        | SetOrgInteractionLimitsFailure
        | RemoveOrgInteractionLimitsSuccess
        | RemoveOrgInteractionLimitsFailure
        | GetRepoInteractionLimitsSuccess
        | GetRepoInteractionLimitsFailure
        | SetRepoInteractionLimitsSuccess
        | SetRepoInteractionLimitsFailure
        | RemoveRepoInteractionLimitsSuccess
        | RemoveRepoInteractionLimitsFailure
        | ListRepoPullRequestCreationCapBypassListSuccess
        | ListRepoPullRequestCreationCapBypassListFailure
        | AddRepoPullRequestCreationCapBypassUsersSuccess
        | AddRepoPullRequestCreationCapBypassUsersFailure
        | RemoveRepoPullRequestCreationCapBypassUsersSuccess
        | RemoveRepoPullRequestCreationCapBypassUsersFailure
        | GetRepoPullRequestCreationCapSuccess
        | GetRepoPullRequestCreationCapFailure
        | UpdateRepoPullRequestCreationCapSuccess
        | UpdateRepoPullRequestCreationCapFailure
        | GetAuthenticatedUserInteractionLimitsSuccess
        | GetAuthenticatedUserInteractionLimitsFailure
        | SetAuthenticatedUserInteractionLimitsSuccess
        | SetAuthenticatedUserInteractionLimitsFailure
        | RemoveAuthenticatedUserInteractionLimitsSuccess
        | RemoveAuthenticatedUserInteractionLimitsFailure
        | ListRepoAssigneesSuccess
        | ListRepoAssigneesFailure
        | CheckUserCanBeAssignedSuccess
        | CheckUserCanBeAssignedFailure
        | AddIssueAssigneesSuccess
        | AddIssueAssigneesFailure
        | RemoveIssueAssigneesSuccess
        | RemoveIssueAssigneesFailure
        | CheckUserCanBeAssignedToIssueSuccess
        | CheckUserCanBeAssignedToIssueFailure
        | ListRepoIssueCommentsSuccess
        | ListRepoIssueCommentsFailure
        | GetIssueCommentSuccess
        | GetIssueCommentFailure
        | UpdateIssueCommentSuccess
        | UpdateIssueCommentFailure
        | DeleteIssueCommentSuccess
        | DeleteIssueCommentFailure
        | PinIssueCommentSuccess
        | PinIssueCommentFailure
        | UnpinIssueCommentSuccess
        | UnpinIssueCommentFailure
        | ListIssueCommentsSuccess
        | ListIssueCommentsFailure
        | CreateIssueCommentSuccess
        | CreateIssueCommentFailure
        | ListRepoIssueEventsSuccess
        | ListRepoIssueEventsFailure
        | GetIssueEventSuccess
        | GetIssueEventFailure
        | ListIssueEventsSuccess
        | ListIssueEventsFailure
        | ListIssueDependenciesBlockedBySuccess
        | ListIssueDependenciesBlockedByFailure
        | AddIssueDependencyBlockedBySuccess
        | AddIssueDependencyBlockedByFailure
        | RemoveIssueDependencyBlockedBySuccess
        | RemoveIssueDependencyBlockedByFailure
        | ListIssueDependenciesBlockingSuccess
        | ListIssueDependenciesBlockingFailure
        | ListIssueFieldValuesSuccess
        | ListIssueFieldValuesFailure
        | AddIssueFieldValuesSuccess
        | AddIssueFieldValuesFailure
        | SetIssueFieldValuesSuccess
        | SetIssueFieldValuesFailure
        | DeleteIssueFieldValueSuccess
        | DeleteIssueFieldValueFailure
        | ListIssuesSuccess
        | ListIssuesFailure
        | ListUserAccountIssuesSuccess
        | ListUserAccountIssuesFailure
        | ListOrgIssuesSuccess
        | ListOrgIssuesFailure
        | ListRepoIssuesSuccess
        | ListRepoIssuesFailure
        | CreateRepoIssueSuccess
        | CreateRepoIssueFailure
        | GetRepoIssueSuccess
        | GetRepoIssueFailure
        | UpdateRepoIssueSuccess
        | UpdateRepoIssueFailure
        | LockRepoIssueSuccess
        | LockRepoIssueFailure
        | UnlockRepoIssueSuccess
        | UnlockRepoIssueFailure
        | ListIssueLabelsSuccess
        | ListIssueLabelsFailure
        | AddIssueLabelsSuccess
        | AddIssueLabelsFailure
        | SetIssueLabelsSuccess
        | SetIssueLabelsFailure
        | RemoveAllIssueLabelsSuccess
        | RemoveAllIssueLabelsFailure
        | RemoveIssueLabelSuccess
        | RemoveIssueLabelFailure
        | ListRepoLabelsSuccess
        | ListRepoLabelsFailure
        | CreateRepoLabelSuccess
        | CreateRepoLabelFailure
        | GetRepoLabelSuccess
        | GetRepoLabelFailure
        | UpdateRepoLabelSuccess
        | UpdateRepoLabelFailure
        | DeleteRepoLabelSuccess
        | DeleteRepoLabelFailure
        | ListMilestoneLabelsSuccess
        | ListMilestoneLabelsFailure
        | ListRepoMilestonesSuccess
        | ListRepoMilestonesFailure
        | CreateRepoMilestoneSuccess
        | CreateRepoMilestoneFailure
        | GetRepoMilestoneSuccess
        | GetRepoMilestoneFailure
        | UpdateRepoMilestoneSuccess
        | UpdateRepoMilestoneFailure
        | DeleteRepoMilestoneSuccess
        | DeleteRepoMilestoneFailure
        | GetIssueParentSuccess
        | GetIssueParentFailure
        | ListIssueSubIssuesSuccess
        | ListIssueSubIssuesFailure
        | AddIssueSubIssueSuccess
        | AddIssueSubIssueFailure
        | RemoveIssueSubIssueSuccess
        | RemoveIssueSubIssueFailure
        | ReprioritizeIssueSubIssueSuccess
        | ReprioritizeIssueSubIssueFailure
        | ListIssueTimelineEventsSuccess
        | ListIssueTimelineEventsFailure
        | ListCommonlyUsedLicensesSuccess
        | ListCommonlyUsedLicensesFailure
        | GetLicenseSuccess
        | GetLicenseFailure
        | GetRepoLicenseSuccess
        | GetRepoLicenseFailure
        | RenderMarkdownSuccess
        | RenderMarkdownFailure
        | RenderMarkdownRawSuccess
        | RenderMarkdownRawFailure
        | GetApiRootSuccess
        | GetApiRootFailure
        | GetMetaSuccess
        | GetMetaFailure
        | GetOctocatSuccess
        | GetOctocatFailure
        | ListApiVersionsSuccess
        | ListApiVersionsFailure
        | GetZenSuccess
        | GetZenFailure
        | GetRepoCommunityProfileMetricsSuccess
        | GetRepoCommunityProfileMetricsFailure
        | GetRepoCodeFrequencyStatsSuccess
        | GetRepoCodeFrequencyStatsFailure
        | GetRepoCommitActivityStatsSuccess
        | GetRepoCommitActivityStatsFailure
        | GetRepoContributorsStatsSuccess
        | GetRepoContributorsStatsFailure
        | GetRepoParticipationStatsSuccess
        | GetRepoParticipationStatsFailure
        | GetRepoPunchCardStatsSuccess
        | GetRepoPunchCardStatsFailure
        | GetRepoClonesSuccess
        | GetRepoClonesFailure
        | GetRepoTopPathsSuccess
        | GetRepoTopPathsFailure
        | GetRepoTopReferrersSuccess
        | GetRepoTopReferrersFailure
        | GetRepoViewsSuccess
        | GetRepoViewsFailure
        | ListModelsSuccess
        | ListModelsFailure
        | CreateModelEmbeddingsSuccess
        | CreateModelEmbeddingsFailure
        | CreateOrgModelEmbeddingsSuccess
        | CreateOrgModelEmbeddingsFailure
        | CreateModelChatCompletionSuccess
        | CreateModelChatCompletionFailure
        | CreateOrgModelChatCompletionSuccess
        | CreateOrgModelChatCompletionFailure
        | ListOrgDockerMigrationConflictsSuccess
        | ListOrgDockerMigrationConflictsFailure
        | ListOrgPackagesSuccess
        | ListOrgPackagesFailure
        | GetOrgPackageSuccess
        | GetOrgPackageFailure
        | DeleteOrgPackageSuccess
        | DeleteOrgPackageFailure
        | RestoreOrgPackageSuccess
        | RestoreOrgPackageFailure
        | ListOrgPackageVersionsSuccess
        | ListOrgPackageVersionsFailure
        | GetOrgPackageVersionSuccess
        | GetOrgPackageVersionFailure
        | DeleteOrgPackageVersionSuccess
        | DeleteOrgPackageVersionFailure
        | RestoreOrgPackageVersionSuccess
        | RestoreOrgPackageVersionFailure
        | ListAuthenticatedUserDockerMigrationConflictsSuccess
        | ListAuthenticatedUserDockerMigrationConflictsFailure
        | ListAuthenticatedUserPackagesSuccess
        | ListAuthenticatedUserPackagesFailure
        | GetAuthenticatedUserPackageSuccess
        | GetAuthenticatedUserPackageFailure
        | DeleteAuthenticatedUserPackageSuccess
        | DeleteAuthenticatedUserPackageFailure
        | RestoreAuthenticatedUserPackageSuccess
        | RestoreAuthenticatedUserPackageFailure
        | ListAuthenticatedUserPackageVersionsSuccess
        | ListAuthenticatedUserPackageVersionsFailure
        | GetAuthenticatedUserPackageVersionSuccess
        | GetAuthenticatedUserPackageVersionFailure
        | DeleteAuthenticatedUserPackageVersionSuccess
        | DeleteAuthenticatedUserPackageVersionFailure
        | RestoreAuthenticatedUserPackageVersionSuccess
        | RestoreAuthenticatedUserPackageVersionFailure
        | ListUserDockerMigrationConflictsSuccess
        | ListUserDockerMigrationConflictsFailure
        | ListUserPackagesSuccess
        | ListUserPackagesFailure
        | GetUserPackageSuccess
        | GetUserPackageFailure
        | DeleteUserPackageSuccess
        | DeleteUserPackageFailure
        | RestoreUserPackageSuccess
        | RestoreUserPackageFailure
        | ListUserPackageVersionsSuccess
        | ListUserPackageVersionsFailure
        | GetUserPackageVersionSuccess
        | GetUserPackageVersionFailure
        | DeleteUserPackageVersionSuccess
        | DeleteUserPackageVersionFailure
        | RestoreUserPackageVersionSuccess
        | RestoreUserPackageVersionFailure
        | GetRepoPagesSuccess
        | GetRepoPagesFailure
        | CreateRepoPagesSiteSuccess
        | CreateRepoPagesSiteFailure
        | UpdateRepoPagesSiteSuccess
        | UpdateRepoPagesSiteFailure
        | DeleteRepoPagesSiteSuccess
        | DeleteRepoPagesSiteFailure
        | ListRepoPagesBuildsSuccess
        | ListRepoPagesBuildsFailure
        | RequestRepoPagesBuildSuccess
        | RequestRepoPagesBuildFailure
        | GetLatestRepoPagesBuildSuccess
        | GetLatestRepoPagesBuildFailure
        | GetRepoPagesBuildSuccess
        | GetRepoPagesBuildFailure
        | CreateRepoPagesDeploymentSuccess
        | CreateRepoPagesDeploymentFailure
        | GetRepoPagesDeploymentSuccess
        | GetRepoPagesDeploymentFailure
        | CancelRepoPagesDeploymentSuccess
        | CancelRepoPagesDeploymentFailure
        | GetRepoPagesHealthCheckSuccess
        | GetRepoPagesHealthCheckFailure
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
