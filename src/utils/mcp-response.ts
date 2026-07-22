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
    ListArtifactsForRepoFailure,
    ListArtifactsForRepoSuccess,
    GetArtifactFailure,
    GetArtifactSuccess,
    DeleteArtifactFailure,
    DeleteArtifactSuccess,
    DownloadArtifactFailure,
    DownloadArtifactSuccess,
    ListWorkflowRunArtifactsFailure,
    ListWorkflowRunArtifactsSuccess,
    GetActionsCacheUsageForRepoFailure,
    GetActionsCacheUsageForRepoSuccess,
    GetActionsCacheUsageForOrgFailure,
    GetActionsCacheUsageForOrgSuccess,
    GetActionsCacheUsageByRepoForOrgFailure,
    GetActionsCacheUsageByRepoForOrgSuccess,
    ListActionsCachesFailure,
    ListActionsCachesSuccess,
    DeleteActionsCacheByKeyFailure,
    DeleteActionsCacheByKeySuccess,
    DeleteActionsCacheByIdFailure,
    DeleteActionsCacheByIdSuccess,
    ListConcurrencyGroupsForRepoFailure,
    ListConcurrencyGroupsForRepoSuccess,
    GetConcurrencyGroupFailure,
    GetConcurrencyGroupSuccess,
    ListConcurrencyGroupsForWorkflowRunFailure,
    ListConcurrencyGroupsForWorkflowRunSuccess,
    ListHostedRunnersForOrgFailure,
    ListHostedRunnersForOrgSuccess,
    CreateHostedRunnerForOrgFailure,
    CreateHostedRunnerForOrgSuccess,
    ListCustomImagesForOrgFailure,
    ListCustomImagesForOrgSuccess,
    GetCustomImageForOrgFailure,
    GetCustomImageForOrgSuccess,
    DeleteCustomImageFromOrgFailure,
    DeleteCustomImageFromOrgSuccess,
    ListCustomImageVersionsForOrgFailure,
    ListCustomImageVersionsForOrgSuccess,
    GetCustomImageVersionForOrgFailure,
    GetCustomImageVersionForOrgSuccess,
    DeleteCustomImageVersionFromOrgFailure,
    DeleteCustomImageVersionFromOrgSuccess,
    GetHostedRunnersGithubOwnedImagesForOrgFailure,
    GetHostedRunnersGithubOwnedImagesForOrgSuccess,
    GetHostedRunnersPartnerImagesForOrgFailure,
    GetHostedRunnersPartnerImagesForOrgSuccess,
    GetHostedRunnersLimitsForOrgFailure,
    GetHostedRunnersLimitsForOrgSuccess,
    GetHostedRunnersMachineSpecsForOrgFailure,
    GetHostedRunnersMachineSpecsForOrgSuccess,
    GetHostedRunnersPlatformsForOrgFailure,
    GetHostedRunnersPlatformsForOrgSuccess,
    GetHostedRunnerForOrgFailure,
    GetHostedRunnerForOrgSuccess,
    UpdateHostedRunnerForOrgFailure,
    UpdateHostedRunnerForOrgSuccess,
    DeleteHostedRunnerForOrgFailure,
    DeleteHostedRunnerForOrgSuccess,
    GetOidcCustomSubTemplateForOrgFailure,
    GetOidcCustomSubTemplateForOrgSuccess,
    UpdateOidcCustomSubTemplateForOrgFailure,
    UpdateOidcCustomSubTemplateForOrgSuccess,
    GetCustomOidcSubClaimForRepoFailure,
    GetCustomOidcSubClaimForRepoSuccess,
    SetCustomOidcSubClaimForRepoFailure,
    SetCustomOidcSubClaimForRepoSuccess,
    GetGithubActionsPermissionsOrganizationFailure,
    GetGithubActionsPermissionsOrganizationSuccess,
    SetGithubActionsPermissionsOrganizationFailure,
    SetGithubActionsPermissionsOrganizationSuccess,
    ListSelectedRepositoriesEnabledGithubActionsOrganizationFailure,
    ListSelectedRepositoriesEnabledGithubActionsOrganizationSuccess,
    SetSelectedRepositoriesEnabledGithubActionsOrganizationFailure,
    SetSelectedRepositoriesEnabledGithubActionsOrganizationSuccess,
    EnableSelectedRepositoryGithubActionsOrganizationFailure,
    EnableSelectedRepositoryGithubActionsOrganizationSuccess,
    DisableSelectedRepositoryGithubActionsOrganizationFailure,
    DisableSelectedRepositoryGithubActionsOrganizationSuccess,
    GetAllowedActionsOrganizationFailure,
    GetAllowedActionsOrganizationSuccess,
    SetAllowedActionsOrganizationFailure,
    SetAllowedActionsOrganizationSuccess,
    GetGithubActionsDefaultWorkflowPermissionsOrganizationFailure,
    GetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess,
    SetGithubActionsDefaultWorkflowPermissionsOrganizationFailure,
    SetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess,
    GetGithubActionsPermissionsRepositoryFailure,
    GetGithubActionsPermissionsRepositorySuccess,
    SetGithubActionsPermissionsRepositoryFailure,
    SetGithubActionsPermissionsRepositorySuccess,
    GetWorkflowAccessToRepositoryFailure,
    GetWorkflowAccessToRepositorySuccess,
    SetWorkflowAccessToRepositoryFailure,
    SetWorkflowAccessToRepositorySuccess,
    GetAllowedActionsRepositoryFailure,
    GetAllowedActionsRepositorySuccess,
    SetAllowedActionsRepositoryFailure,
    SetAllowedActionsRepositorySuccess,
    GetGithubActionsDefaultWorkflowPermissionsRepositoryFailure,
    GetGithubActionsDefaultWorkflowPermissionsRepositorySuccess,
    SetGithubActionsDefaultWorkflowPermissionsRepositoryFailure,
    SetGithubActionsDefaultWorkflowPermissionsRepositorySuccess,
    ListOrgActionsSecretsFailure,
    ListOrgActionsSecretsSuccess,
    GetOrgActionsPublicKeyFailure,
    GetOrgActionsPublicKeySuccess,
    GetOrgActionsSecretFailure,
    GetOrgActionsSecretSuccess,
    CreateOrUpdateOrgActionsSecretFailure,
    CreateOrUpdateOrgActionsSecretSuccess,
    DeleteOrgActionsSecretFailure,
    DeleteOrgActionsSecretSuccess,
    ListSelectedReposForOrgActionsSecretFailure,
    ListSelectedReposForOrgActionsSecretSuccess,
    SetSelectedReposForOrgActionsSecretFailure,
    SetSelectedReposForOrgActionsSecretSuccess,
    AddSelectedRepoToOrgActionsSecretFailure,
    AddSelectedRepoToOrgActionsSecretSuccess,
    RemoveSelectedRepoFromOrgActionsSecretFailure,
    RemoveSelectedRepoFromOrgActionsSecretSuccess,
    ListRepoOrganizationActionsSecretsFailure,
    ListRepoOrganizationActionsSecretsSuccess,
    ListRepoActionsSecretsFailure,
    ListRepoActionsSecretsSuccess,
    GetRepoActionsPublicKeyFailure,
    GetRepoActionsPublicKeySuccess,
    GetRepoActionsSecretFailure,
    GetRepoActionsSecretSuccess,
    CreateOrUpdateRepoActionsSecretFailure,
    CreateOrUpdateRepoActionsSecretSuccess,
    DeleteRepoActionsSecretFailure,
    DeleteRepoActionsSecretSuccess,
    ListEnvironmentActionsSecretsFailure,
    ListEnvironmentActionsSecretsSuccess,
    GetEnvironmentActionsPublicKeyFailure,
    GetEnvironmentActionsPublicKeySuccess,
    GetEnvironmentActionsSecretFailure,
    GetEnvironmentActionsSecretSuccess,
    CreateOrUpdateEnvironmentActionsSecretFailure,
    CreateOrUpdateEnvironmentActionsSecretSuccess,
    DeleteEnvironmentActionsSecretFailure,
    DeleteEnvironmentActionsSecretSuccess,
    ListSelfHostedRunnerGroupsForOrgFailure,
    ListSelfHostedRunnerGroupsForOrgSuccess,
    CreateSelfHostedRunnerGroupForOrgFailure,
    CreateSelfHostedRunnerGroupForOrgSuccess,
    GetSelfHostedRunnerGroupForOrgFailure,
    GetSelfHostedRunnerGroupForOrgSuccess,
    UpdateSelfHostedRunnerGroupForOrgFailure,
    UpdateSelfHostedRunnerGroupForOrgSuccess,
    DeleteSelfHostedRunnerGroupFromOrgFailure,
    DeleteSelfHostedRunnerGroupFromOrgSuccess,
    ListGithubHostedRunnersInGroupForOrgFailure,
    ListGithubHostedRunnersInGroupForOrgSuccess,
    ListRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    ListRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    SetRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    SetRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    AddRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    AddRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    RemoveRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    RemoveRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    ListSelfHostedRunnersInGroupForOrgFailure,
    ListSelfHostedRunnersInGroupForOrgSuccess,
    SetSelfHostedRunnersInGroupForOrgFailure,
    SetSelfHostedRunnersInGroupForOrgSuccess,
    AddSelfHostedRunnerToGroupForOrgFailure,
    AddSelfHostedRunnerToGroupForOrgSuccess,
    RemoveSelfHostedRunnerFromGroupForOrgFailure,
    RemoveSelfHostedRunnerFromGroupForOrgSuccess,
    ListSelfHostedRunnersForOrgFailure,
    ListSelfHostedRunnersForOrgSuccess,
    ListRunnerApplicationsForOrgFailure,
    ListRunnerApplicationsForOrgSuccess,
    GenerateRunnerJitconfigForOrgFailure,
    GenerateRunnerJitconfigForOrgSuccess,
    CreateRegistrationTokenForOrgFailure,
    CreateRegistrationTokenForOrgSuccess,
    CreateRemoveTokenForOrgFailure,
    CreateRemoveTokenForOrgSuccess,
    GetSelfHostedRunnerForOrgFailure,
    GetSelfHostedRunnerForOrgSuccess,
    DeleteSelfHostedRunnerFromOrgFailure,
    DeleteSelfHostedRunnerFromOrgSuccess,
    ListLabelsForSelfHostedRunnerForOrgFailure,
    ListLabelsForSelfHostedRunnerForOrgSuccess,
    AddCustomLabelsToSelfHostedRunnerForOrgFailure,
    AddCustomLabelsToSelfHostedRunnerForOrgSuccess,
    SetCustomLabelsForSelfHostedRunnerForOrgFailure,
    SetCustomLabelsForSelfHostedRunnerForOrgSuccess,
    RemoveAllCustomLabelsFromSelfHostedRunnerForOrgFailure,
    RemoveAllCustomLabelsFromSelfHostedRunnerForOrgSuccess,
    RemoveCustomLabelFromSelfHostedRunnerForOrgFailure,
    RemoveCustomLabelFromSelfHostedRunnerForOrgSuccess,
    ListSelfHostedRunnersForRepoFailure,
    ListSelfHostedRunnersForRepoSuccess,
    ListRunnerApplicationsForRepoFailure,
    ListRunnerApplicationsForRepoSuccess,
    GenerateRunnerJitconfigForRepoFailure,
    GenerateRunnerJitconfigForRepoSuccess,
    CreateRegistrationTokenForRepoFailure,
    CreateRegistrationTokenForRepoSuccess,
    CreateRemoveTokenForRepoFailure,
    CreateRemoveTokenForRepoSuccess,
    GetSelfHostedRunnerForRepoFailure,
    GetSelfHostedRunnerForRepoSuccess,
    DeleteSelfHostedRunnerFromRepoFailure,
    DeleteSelfHostedRunnerFromRepoSuccess,
    ListLabelsForSelfHostedRunnerForRepoFailure,
    ListLabelsForSelfHostedRunnerForRepoSuccess,
    AddCustomLabelsToSelfHostedRunnerForRepoFailure,
    AddCustomLabelsToSelfHostedRunnerForRepoSuccess,
    SetCustomLabelsForSelfHostedRunnerForRepoFailure,
    SetCustomLabelsForSelfHostedRunnerForRepoSuccess,
    RemoveAllCustomLabelsFromSelfHostedRunnerForRepoFailure,
    RemoveAllCustomLabelsFromSelfHostedRunnerForRepoSuccess,
    RemoveCustomLabelFromSelfHostedRunnerForRepoFailure,
    RemoveCustomLabelFromSelfHostedRunnerForRepoSuccess,
    ListOrgActionsVariablesFailure,
    ListOrgActionsVariablesSuccess,
    CreateOrgActionsVariableFailure,
    CreateOrgActionsVariableSuccess,
    GetOrgActionsVariableFailure,
    GetOrgActionsVariableSuccess,
    UpdateOrgActionsVariableFailure,
    UpdateOrgActionsVariableSuccess,
    DeleteOrgActionsVariableFailure,
    DeleteOrgActionsVariableSuccess,
    ListSelectedReposForOrgActionsVariableFailure,
    ListSelectedReposForOrgActionsVariableSuccess,
    SetSelectedReposForOrgActionsVariableFailure,
    SetSelectedReposForOrgActionsVariableSuccess,
    AddSelectedRepoToOrgActionsVariableFailure,
    AddSelectedRepoToOrgActionsVariableSuccess,
    RemoveSelectedRepoFromOrgActionsVariableFailure,
    RemoveSelectedRepoFromOrgActionsVariableSuccess,
    ListRepoOrganizationActionsVariablesFailure,
    ListRepoOrganizationActionsVariablesSuccess,
    ListRepoActionsVariablesFailure,
    ListRepoActionsVariablesSuccess,
    CreateRepoActionsVariableFailure,
    CreateRepoActionsVariableSuccess,
    GetRepoActionsVariableFailure,
    GetRepoActionsVariableSuccess,
    UpdateRepoActionsVariableFailure,
    UpdateRepoActionsVariableSuccess,
    DeleteRepoActionsVariableFailure,
    DeleteRepoActionsVariableSuccess,
    ListEnvironmentActionsVariablesFailure,
    ListEnvironmentActionsVariablesSuccess,
    CreateEnvironmentActionsVariableFailure,
    CreateEnvironmentActionsVariableSuccess,
    GetEnvironmentActionsVariableFailure,
    GetEnvironmentActionsVariableSuccess,
    UpdateEnvironmentActionsVariableFailure,
    UpdateEnvironmentActionsVariableSuccess,
    DeleteEnvironmentActionsVariableFailure,
    DeleteEnvironmentActionsVariableSuccess,
    GetJobForWorkflowRunFailure,
    GetJobForWorkflowRunSuccess,
    DownloadJobLogsForWorkflowRunFailure,
    DownloadJobLogsForWorkflowRunSuccess,
    ListJobsForWorkflowRunAttemptFailure,
    ListJobsForWorkflowRunAttemptSuccess,
    ListJobsForWorkflowRunFailure,
    ListJobsForWorkflowRunSuccess,
    ReRunJobForWorkflowRunFailure,
    ReRunJobForWorkflowRunSuccess,
    ListWorkflowRunsForRepoFailure,
    ListWorkflowRunsForRepoSuccess,
    GetWorkflowRunFailure,
    GetWorkflowRunSuccess,
    DeleteWorkflowRunFailure,
    DeleteWorkflowRunSuccess,
    GetReviewsForWorkflowRunFailure,
    GetReviewsForWorkflowRunSuccess,
    ApproveWorkflowRunFailure,
    ApproveWorkflowRunSuccess,
    GetWorkflowRunAttemptFailure,
    GetWorkflowRunAttemptSuccess,
    DownloadWorkflowRunAttemptLogsFailure,
    DownloadWorkflowRunAttemptLogsSuccess,
    CancelWorkflowRunFailure,
    CancelWorkflowRunSuccess,
    ReviewCustomGatesForWorkflowRunFailure,
    ReviewCustomGatesForWorkflowRunSuccess,
    ForceCancelWorkflowRunFailure,
    ForceCancelWorkflowRunSuccess,
    DownloadWorkflowRunLogsFailure,
    DownloadWorkflowRunLogsSuccess,
    DeleteWorkflowRunLogsFailure,
    DeleteWorkflowRunLogsSuccess,
    GetPendingDeploymentsForWorkflowRunFailure,
    GetPendingDeploymentsForWorkflowRunSuccess,
    ReviewPendingDeploymentsForWorkflowRunFailure,
    ReviewPendingDeploymentsForWorkflowRunSuccess,
    ReRunWorkflowFailure,
    ReRunWorkflowSuccess,
    ReRunWorkflowFailedJobsFailure,
    ReRunWorkflowFailedJobsSuccess,
    GetWorkflowRunUsageFailure,
    GetWorkflowRunUsageSuccess,
    ListWorkflowRunsFailure,
    ListWorkflowRunsSuccess,
    ListRepoWorkflowsFailure,
    ListRepoWorkflowsSuccess,
    GetWorkflowFailure,
    GetWorkflowSuccess,
    DisableWorkflowFailure,
    DisableWorkflowSuccess,
    CreateWorkflowDispatchFailure,
    CreateWorkflowDispatchSuccess,
    EnableWorkflowFailure,
    EnableWorkflowSuccess,
    GetWorkflowUsageFailure,
    GetWorkflowUsageSuccess,
    ListPublicEventsFailure,
    ListPublicEventsSuccess,
    ListPublicEventsForRepoNetworkFailure,
    ListPublicEventsForRepoNetworkSuccess,
    ListPublicOrgEventsFailure,
    ListPublicOrgEventsSuccess,
    ListRepoEventsFailure,
    ListRepoEventsSuccess,
    ListEventsForAuthenticatedUserFailure,
    ListEventsForAuthenticatedUserSuccess,
    ListOrgEventsForAuthenticatedUserFailure,
    ListOrgEventsForAuthenticatedUserSuccess,
    ListPublicEventsForUserFailure,
    ListPublicEventsForUserSuccess,
    ListReceivedEventsForUserFailure,
    ListReceivedEventsForUserSuccess,
    ListReceivedPublicEventsForUserFailure,
    ListReceivedPublicEventsForUserSuccess,
    GetFeedsFailure,
    GetFeedsSuccess,
    ListNotificationsForAuthenticatedUserFailure,
    ListNotificationsForAuthenticatedUserSuccess,
    MarkNotificationsAsReadFailure,
    MarkNotificationsAsReadSuccess,
    GetThreadFailure,
    GetThreadSuccess,
    MarkThreadAsReadFailure,
    MarkThreadAsReadSuccess,
    MarkThreadAsDoneFailure,
    MarkThreadAsDoneSuccess,
    GetThreadSubscriptionForAuthenticatedUserFailure,
    GetThreadSubscriptionForAuthenticatedUserSuccess,
    SetThreadSubscriptionFailure,
    SetThreadSubscriptionSuccess,
    DeleteThreadSubscriptionFailure,
    DeleteThreadSubscriptionSuccess,
    ListRepoNotificationsForAuthenticatedUserFailure,
    ListRepoNotificationsForAuthenticatedUserSuccess,
    MarkRepoNotificationsAsReadFailure,
    MarkRepoNotificationsAsReadSuccess,
    ListStargazersFailure,
    ListStargazersSuccess,
    ListReposStarredByAuthenticatedUserFailure,
    ListReposStarredByAuthenticatedUserSuccess,
    CheckRepoIsStarredByAuthenticatedUserFailure,
    CheckRepoIsStarredByAuthenticatedUserSuccess,
    StarRepoForAuthenticatedUserFailure,
    StarRepoForAuthenticatedUserSuccess,
    UnstarRepoForAuthenticatedUserFailure,
    UnstarRepoForAuthenticatedUserSuccess,
    ListReposStarredByUserFailure,
    ListReposStarredByUserSuccess,
    ListWatchersFailure,
    ListWatchersSuccess,
    GetRepoSubscriptionFailure,
    GetRepoSubscriptionSuccess,
    SetRepoSubscriptionFailure,
    SetRepoSubscriptionSuccess,
    DeleteRepoSubscriptionFailure,
    DeleteRepoSubscriptionSuccess,
    ListWatchedReposForAuthenticatedUserFailure,
    ListWatchedReposForAuthenticatedUserSuccess,
    ListReposWatchedByUserFailure,
    ListReposWatchedByUserSuccess,
    ListAgentTasksForRepoFailure,
    ListAgentTasksForRepoSuccess,
    StartAgentTaskFailure,
    StartAgentTaskSuccess,
    GetAgentTaskForRepoFailure,
    GetAgentTaskForRepoSuccess,
    ListAgentTasksFailure,
    ListAgentTasksSuccess,
    GetAgentTaskFailure,
    GetAgentTaskSuccess,
    ListOrgAgentSecretsFailure,
    ListOrgAgentSecretsSuccess,
    GetOrgAgentPublicKeyFailure,
    GetOrgAgentPublicKeySuccess,
    GetOrgAgentSecretFailure,
    GetOrgAgentSecretSuccess,
    CreateOrUpdateOrgAgentSecretFailure,
    CreateOrUpdateOrgAgentSecretSuccess,
    DeleteOrgAgentSecretFailure,
    DeleteOrgAgentSecretSuccess,
    ListSelectedReposForOrgAgentSecretFailure,
    ListSelectedReposForOrgAgentSecretSuccess,
    SetSelectedReposForOrgAgentSecretFailure,
    SetSelectedReposForOrgAgentSecretSuccess,
    AddSelectedRepoToOrgAgentSecretFailure,
    AddSelectedRepoToOrgAgentSecretSuccess,
    RemoveSelectedRepoFromOrgAgentSecretFailure,
    RemoveSelectedRepoFromOrgAgentSecretSuccess,
    ListRepoOrganizationAgentSecretsFailure,
    ListRepoOrganizationAgentSecretsSuccess,
    ListRepoAgentSecretsFailure,
    ListRepoAgentSecretsSuccess,
    GetRepoAgentPublicKeyFailure,
    GetRepoAgentPublicKeySuccess,
    GetRepoAgentSecretFailure,
    GetRepoAgentSecretSuccess,
    CreateOrUpdateRepoAgentSecretFailure,
    CreateOrUpdateRepoAgentSecretSuccess,
    DeleteRepoAgentSecretFailure,
    DeleteRepoAgentSecretSuccess,
    ListOrgAgentVariablesFailure,
    ListOrgAgentVariablesSuccess,
    CreateOrgAgentVariableFailure,
    CreateOrgAgentVariableSuccess,
    GetOrgAgentVariableFailure,
    GetOrgAgentVariableSuccess,
    UpdateOrgAgentVariableFailure,
    UpdateOrgAgentVariableSuccess,
    DeleteOrgAgentVariableFailure,
    DeleteOrgAgentVariableSuccess,
    ListSelectedReposForOrgAgentVariableFailure,
    ListSelectedReposForOrgAgentVariableSuccess,
    SetSelectedReposForOrgAgentVariableFailure,
    SetSelectedReposForOrgAgentVariableSuccess,
    AddSelectedRepoToOrgAgentVariableFailure,
    AddSelectedRepoToOrgAgentVariableSuccess,
    RemoveSelectedRepoFromOrgAgentVariableFailure,
    RemoveSelectedRepoFromOrgAgentVariableSuccess,
    ListRepoOrganizationAgentVariablesFailure,
    ListRepoOrganizationAgentVariablesSuccess,
    ListRepoAgentVariablesFailure,
    ListRepoAgentVariablesSuccess,
    CreateRepoAgentVariableFailure,
    CreateRepoAgentVariableSuccess,
    GetRepoAgentVariableFailure,
    GetRepoAgentVariableSuccess,
    UpdateRepoAgentVariableFailure,
    UpdateRepoAgentVariableSuccess,
    DeleteRepoAgentVariableFailure,
    DeleteRepoAgentVariableSuccess,
    GetAuthenticatedAppFailure,
    GetAuthenticatedAppSuccess,
    CreateGithubAppFromManifestFailure,
    CreateGithubAppFromManifestSuccess,
    ListInstallationRequestsForAuthenticatedAppFailure,
    ListInstallationRequestsForAuthenticatedAppSuccess,
    ListInstallationsForAuthenticatedAppFailure,
    ListInstallationsForAuthenticatedAppSuccess,
    GetInstallationForAuthenticatedAppFailure,
    GetInstallationForAuthenticatedAppSuccess,
    DeleteInstallationForAuthenticatedAppFailure,
    DeleteInstallationForAuthenticatedAppSuccess,
    CreateInstallationAccessTokenFailure,
    CreateInstallationAccessTokenSuccess,
    SuspendAppInstallationFailure,
    SuspendAppInstallationSuccess,
    UnsuspendAppInstallationFailure,
    UnsuspendAppInstallationSuccess,
    CreateScopedAccessTokenFailure,
    CreateScopedAccessTokenSuccess,
    GetAppFailure,
    GetAppSuccess,
    GetOrgInstallationForAuthenticatedAppFailure,
    GetOrgInstallationForAuthenticatedAppSuccess,
    GetRepoInstallationForAuthenticatedAppFailure,
    GetRepoInstallationForAuthenticatedAppSuccess,
    GetUserInstallationForAuthenticatedAppFailure,
    GetUserInstallationForAuthenticatedAppSuccess,
    ListReposAccessibleToInstallationFailure,
    ListReposAccessibleToInstallationSuccess,
    RevokeInstallationAccessTokenFailure,
    RevokeInstallationAccessTokenSuccess,
    ListAppInstallationsAccessibleToUserFailure,
    ListAppInstallationsAccessibleToUserSuccess,
    ListInstallationReposForAuthenticatedUserFailure,
    ListInstallationReposForAuthenticatedUserSuccess,
    AddRepoToAppInstallationFailure,
    AddRepoToAppInstallationSuccess,
    RemoveRepoFromAppInstallationFailure,
    RemoveRepoFromAppInstallationSuccess,
    GetMarketplaceSubscriptionPlanForAccountFailure,
    GetMarketplaceSubscriptionPlanForAccountSuccess,
    ListMarketplacePlansFailure,
    ListMarketplacePlansSuccess,
    ListMarketplaceAccountsForPlanFailure,
    ListMarketplaceAccountsForPlanSuccess,
    GetMarketplaceSubscriptionPlanForAccountStubbedFailure,
    GetMarketplaceSubscriptionPlanForAccountStubbedSuccess,
    ListMarketplacePlansStubbedFailure,
    ListMarketplacePlansStubbedSuccess,
    ListMarketplaceAccountsForPlanStubbedFailure,
    ListMarketplaceAccountsForPlanStubbedSuccess,
    ListMarketplacePurchasesForAuthenticatedUserFailure,
    ListMarketplacePurchasesForAuthenticatedUserSuccess,
    ListMarketplacePurchasesForAuthenticatedUserStubbedFailure,
    ListMarketplacePurchasesForAuthenticatedUserStubbedSuccess,
    DeleteAppAuthorizationFailure,
    DeleteAppAuthorizationSuccess,
    CheckAppTokenFailure,
    CheckAppTokenSuccess,
    ResetAppTokenFailure,
    ResetAppTokenSuccess,
    DeleteAppTokenFailure,
    DeleteAppTokenSuccess,
    GetAppWebhookConfigFailure,
    GetAppWebhookConfigSuccess,
    UpdateAppWebhookConfigFailure,
    UpdateAppWebhookConfigSuccess,
    ListAppWebhookDeliveriesFailure,
    ListAppWebhookDeliveriesSuccess,
    GetAppWebhookDeliveryFailure,
    GetAppWebhookDeliverySuccess,
    RedeliverAppWebhookDeliveryFailure,
    RedeliverAppWebhookDeliverySuccess,
    GetOrgAdvancedSecurityActiveCommittersFailure,
    GetOrgAdvancedSecurityActiveCommittersSuccess,
    ListOrgBudgetsFailure,
    ListOrgBudgetsSuccess,
    CreateOrgBudgetFailure,
    CreateOrgBudgetSuccess,
    GetOrgBudgetFailure,
    GetOrgBudgetSuccess,
    UpdateOrgBudgetFailure,
    UpdateOrgBudgetSuccess,
    DeleteOrgBudgetFailure,
    DeleteOrgBudgetSuccess,
    ListEnterpriseCostCentersFailure,
    ListEnterpriseCostCentersSuccess,
    CreateEnterpriseCostCenterFailure,
    CreateEnterpriseCostCenterSuccess,
    GetEnterpriseCostCenterFailure,
    GetEnterpriseCostCenterSuccess,
    UpdateEnterpriseCostCenterFailure,
    UpdateEnterpriseCostCenterSuccess,
    DeleteEnterpriseCostCenterFailure,
    DeleteEnterpriseCostCenterSuccess,
    AddResourcesToEnterpriseCostCenterFailure,
    AddResourcesToEnterpriseCostCenterSuccess,
    RemoveResourcesFromEnterpriseCostCenterFailure,
    RemoveResourcesFromEnterpriseCostCenterSuccess,
    GetOrgAiCreditBillingUsageFailure,
    GetOrgAiCreditBillingUsageSuccess,
    GetOrgPremiumRequestBillingUsageFailure,
    GetOrgPremiumRequestBillingUsageSuccess,
    GetOrgBillingUsageFailure,
    GetOrgBillingUsageSuccess,
    GetOrgBillingUsageSummaryFailure,
    GetOrgBillingUsageSummarySuccess,
    GetUserAiCreditBillingUsageFailure,
    GetUserAiCreditBillingUsageSuccess,
    GetUserPremiumRequestBillingUsageFailure,
    GetUserPremiumRequestBillingUsageSuccess,
    GetUserBillingUsageFailure,
    GetUserBillingUsageSuccess,
    GetUserBillingUsageSummaryFailure,
    GetUserBillingUsageSummarySuccess,
    ListEnterpriseUsageReportExportsFailure,
    ListEnterpriseUsageReportExportsSuccess,
    CreateEnterpriseUsageReportExportFailure,
    CreateEnterpriseUsageReportExportSuccess,
    GetEnterpriseUsageReportExportFailure,
    GetEnterpriseUsageReportExportSuccess,
    ListRepoBranchesFailure,
    ListRepoBranchesSuccess,
    GetRepoBranchFailure,
    GetRepoBranchSuccess,
    RenameRepoBranchFailure,
    RenameRepoBranchSuccess,
    SyncForkBranchWithUpstreamFailure,
    SyncForkBranchWithUpstreamSuccess,
    MergeRepoBranchFailure,
    MergeRepoBranchSuccess,
    GetRepoBranchProtectionSuccess,
    GetRepoBranchProtectionFailure,
    UpdateRepoBranchProtectionSuccess,
    UpdateRepoBranchProtectionFailure,
    DeleteRepoBranchProtectionSuccess,
    DeleteRepoBranchProtectionFailure,
    GetAdminBranchProtectionSuccess,
    GetAdminBranchProtectionFailure,
    SetAdminBranchProtectionSuccess,
    SetAdminBranchProtectionFailure,
    DeleteAdminBranchProtectionSuccess,
    DeleteAdminBranchProtectionFailure,
    GetPullRequestReviewProtectionSuccess,
    GetPullRequestReviewProtectionFailure,
    UpdatePullRequestReviewProtectionSuccess,
    UpdatePullRequestReviewProtectionFailure,
    DeletePullRequestReviewProtectionSuccess,
    DeletePullRequestReviewProtectionFailure,
    GetCommitSignatureProtectionSuccess,
    GetCommitSignatureProtectionFailure,
    CreateCommitSignatureProtectionSuccess,
    CreateCommitSignatureProtectionFailure,
    DeleteCommitSignatureProtectionSuccess,
    DeleteCommitSignatureProtectionFailure,
    GetStatusChecksProtectionSuccess,
    GetStatusChecksProtectionFailure,
    UpdateStatusCheckProtectionSuccess,
    UpdateStatusCheckProtectionFailure,
    RemoveStatusCheckProtectionSuccess,
    RemoveStatusCheckProtectionFailure,
    GetAllStatusCheckContextsSuccess,
    GetAllStatusCheckContextsFailure,
    AddStatusCheckContextsSuccess,
    AddStatusCheckContextsFailure,
    SetStatusCheckContextsSuccess,
    SetStatusCheckContextsFailure,
    RemoveStatusCheckContextsSuccess,
    RemoveStatusCheckContextsFailure,
    GetAccessRestrictionsSuccess,
    GetAccessRestrictionsFailure,
    DeleteAccessRestrictionsSuccess,
    DeleteAccessRestrictionsFailure,
    GetAppsWithAccessToProtectedBranchSuccess,
    GetAppsWithAccessToProtectedBranchFailure,
    AddAppAccessRestrictionsSuccess,
    AddAppAccessRestrictionsFailure,
    SetAppAccessRestrictionsSuccess,
    SetAppAccessRestrictionsFailure,
    RemoveAppAccessRestrictionsSuccess,
    RemoveAppAccessRestrictionsFailure,
    GetTeamsWithAccessToProtectedBranchSuccess,
    GetTeamsWithAccessToProtectedBranchFailure,
    AddTeamAccessRestrictionsSuccess,
    AddTeamAccessRestrictionsFailure,
    SetTeamAccessRestrictionsSuccess,
    SetTeamAccessRestrictionsFailure,
    RemoveTeamAccessRestrictionsSuccess,
    RemoveTeamAccessRestrictionsFailure,
    GetUsersWithAccessToProtectedBranchSuccess,
    GetUsersWithAccessToProtectedBranchFailure,
    AddUserAccessRestrictionsSuccess,
    AddUserAccessRestrictionsFailure,
    SetUserAccessRestrictionsSuccess,
    SetUserAccessRestrictionsFailure,
    RemoveUserAccessRestrictionsSuccess,
    RemoveUserAccessRestrictionsFailure,
    ListOrgCampaignsFailure,
    ListOrgCampaignsSuccess,
    CreateOrgCampaignFailure,
    CreateOrgCampaignSuccess,
    GetOrgCampaignFailure,
    GetOrgCampaignSuccess,
    UpdateOrgCampaignFailure,
    UpdateOrgCampaignSuccess,
    DeleteOrgCampaignFailure,
    DeleteOrgCampaignSuccess,
    CreateCheckRunFailure,
    CreateCheckRunSuccess,
    GetCheckRunFailure,
    GetCheckRunSuccess,
    UpdateCheckRunFailure,
    UpdateCheckRunSuccess,
    ListCheckRunAnnotationsFailure,
    ListCheckRunAnnotationsSuccess,
    RerequestCheckRunFailure,
    RerequestCheckRunSuccess,
    ListCheckRunsForSuiteFailure,
    ListCheckRunsForSuiteSuccess,
    ListCheckRunsForRefFailure,
    ListCheckRunsForRefSuccess,
    CreateCheckSuiteFailure,
    CreateCheckSuiteSuccess,
    SetCheckSuitesPreferencesFailure,
    SetCheckSuitesPreferencesSuccess,
    GetCheckSuiteFailure,
    GetCheckSuiteSuccess,
    RerequestCheckSuiteFailure,
    RerequestCheckSuiteSuccess,
    ListCheckSuitesForRefFailure,
    ListCheckSuitesForRefSuccess,
    GetClassroomAssignmentFailure,
    GetClassroomAssignmentSuccess,
    ListAcceptedClassroomAssignmentsFailure,
    ListAcceptedClassroomAssignmentsSuccess,
    GetClassroomAssignmentGradesFailure,
    GetClassroomAssignmentGradesSuccess,
    ListClassroomsFailure,
    ListClassroomsSuccess,
    GetClassroomFailure,
    GetClassroomSuccess,
    ListClassroomAssignmentsFailure,
    ListClassroomAssignmentsSuccess,
    ListRepoCodeQualityFindingsFailure,
    ListRepoCodeQualityFindingsSuccess,
    GetRepoCodeQualityFindingFailure,
    GetRepoCodeQualityFindingSuccess,
    GetRepoCodeQualitySetupFailure,
    GetRepoCodeQualitySetupSuccess,
    UpdateRepoCodeQualitySetupFailure,
    UpdateRepoCodeQualitySetupSuccess,
    ListOrgCodeScanningDismissalRequestsFailure,
    ListOrgCodeScanningDismissalRequestsSuccess,
    ListRepoCodeScanningDismissalRequestsFailure,
    ListRepoCodeScanningDismissalRequestsSuccess,
    GetRepoCodeScanningDismissalRequestFailure,
    GetRepoCodeScanningDismissalRequestSuccess,
    ReviewRepoCodeScanningDismissalRequestFailure,
    ReviewRepoCodeScanningDismissalRequestSuccess,
    ListOrgCodeScanningAlertsSuccess,
    ListOrgCodeScanningAlertsFailure,
    ListRepoCodeScanningAlertsSuccess,
    ListRepoCodeScanningAlertsFailure,
    ListCodeScanningAlertInstancesSuccess,
    ListCodeScanningAlertInstancesFailure,
    ListRepoCodeScanningAnalysesSuccess,
    ListRepoCodeScanningAnalysesFailure,
    GetCodeScanningAlertSuccess,
    GetCodeScanningAlertFailure,
    UpdateCodeScanningAlertSuccess,
    UpdateCodeScanningAlertFailure,
    GetCodeScanningAutofixSuccess,
    GetCodeScanningAutofixFailure,
    CreateCodeScanningAutofixSuccess,
    CreateCodeScanningAutofixFailure,
    CommitCodeScanningAutofixSuccess,
    CommitCodeScanningAutofixFailure,
    GetCodeScanningAnalysisSuccess,
    GetCodeScanningAnalysisFailure,
    DeleteCodeScanningAnalysisSuccess,
    DeleteCodeScanningAnalysisFailure,
    ListCodeqlDatabasesSuccess,
    ListCodeqlDatabasesFailure,
    GetCodeqlDatabaseSuccess,
    GetCodeqlDatabaseFailure,
    DeleteCodeqlDatabaseSuccess,
    DeleteCodeqlDatabaseFailure,
    CreateCodeqlVariantAnalysisSuccess,
    CreateCodeqlVariantAnalysisFailure,
    GetCodeqlVariantAnalysisSuccess,
    GetCodeqlVariantAnalysisFailure,
    GetCodeqlVariantAnalysisRepoTaskSuccess,
    GetCodeqlVariantAnalysisRepoTaskFailure,
    GetCodeScanningDefaultSetupSuccess,
    GetCodeScanningDefaultSetupFailure,
    UpdateCodeScanningDefaultSetupSuccess,
    UpdateCodeScanningDefaultSetupFailure,
    UploadCodeScanningSarifSuccess,
    UploadCodeScanningSarifFailure,
    GetCodeScanningSarifSuccess,
    GetCodeScanningSarifFailure,
    ListEnterpriseCodeSecurityConfigurationsSuccess,
    ListEnterpriseCodeSecurityConfigurationsFailure,
    CreateEnterpriseCodeSecurityConfigurationSuccess,
    CreateEnterpriseCodeSecurityConfigurationFailure,
    ListEnterpriseCodeSecurityDefaultConfigurationsSuccess,
    ListEnterpriseCodeSecurityDefaultConfigurationsFailure,
    GetEnterpriseCodeSecurityConfigurationSuccess,
    GetEnterpriseCodeSecurityConfigurationFailure,
    UpdateEnterpriseCodeSecurityConfigurationSuccess,
    UpdateEnterpriseCodeSecurityConfigurationFailure,
    DeleteEnterpriseCodeSecurityConfigurationSuccess,
    DeleteEnterpriseCodeSecurityConfigurationFailure,
    AttachEnterpriseCodeSecurityConfigurationSuccess,
    AttachEnterpriseCodeSecurityConfigurationFailure,
    SetEnterpriseCodeSecurityConfigurationAsDefaultSuccess,
    SetEnterpriseCodeSecurityConfigurationAsDefaultFailure,
    ListEnterpriseCodeSecurityConfigurationRepositoriesSuccess,
    ListEnterpriseCodeSecurityConfigurationRepositoriesFailure,
    ListOrgCodeSecurityConfigurationsSuccess,
    ListOrgCodeSecurityConfigurationsFailure,
    CreateOrgCodeSecurityConfigurationSuccess,
    CreateOrgCodeSecurityConfigurationFailure,
    ListOrgCodeSecurityDefaultConfigurationsSuccess,
    ListOrgCodeSecurityDefaultConfigurationsFailure,
    DetachOrgCodeSecurityConfigurationsSuccess,
    DetachOrgCodeSecurityConfigurationsFailure,
    GetOrgCodeSecurityConfigurationSuccess,
    GetOrgCodeSecurityConfigurationFailure,
    UpdateOrgCodeSecurityConfigurationSuccess,
    UpdateOrgCodeSecurityConfigurationFailure,
    DeleteOrgCodeSecurityConfigurationSuccess,
    DeleteOrgCodeSecurityConfigurationFailure,
    AttachOrgCodeSecurityConfigurationSuccess,
    AttachOrgCodeSecurityConfigurationFailure,
    SetOrgCodeSecurityConfigurationAsDefaultSuccess,
    SetOrgCodeSecurityConfigurationAsDefaultFailure,
    ListOrgCodeSecurityConfigurationRepositoriesSuccess,
    ListOrgCodeSecurityConfigurationRepositoriesFailure,
    GetRepoCodeSecurityConfigurationSuccess,
    GetRepoCodeSecurityConfigurationFailure,
    ListCodesOfConductSuccess,
    ListCodesOfConductFailure,
    GetCodeOfConductSuccess,
    GetCodeOfConductFailure,
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
    GetOrgRulesetVersionFailure,
    GetOrgRulesetVersionSuccess,
    AddOrgSecurityManagerTeamFailure,
    AddOrgSecurityManagerTeamSuccess,
    RemoveOrgSecurityManagerTeamFailure,
    RemoveOrgSecurityManagerTeamSuccess,
    ListOrgSecurityManagerTeamsFailure,
    ListOrgSecurityManagerTeamsSuccess,
    CreateOrgWebhookFailure,
    CreateOrgWebhookSuccess,
    GetOrgWebhookConfigFailure,
    GetOrgWebhookConfigSuccess,
    GetOrgWebhookFailure,
    GetOrgWebhookSuccess,
    DeleteOrgWebhookFailure,
    DeleteOrgWebhookSuccess,
    UpdateOrgWebhookConfigFailure,
    UpdateOrgWebhookConfigSuccess,
    UpdateOrgWebhookFailure,
    UpdateOrgWebhookSuccess,
    GetOrgWebhookDeliveryFailure,
    GetOrgWebhookDeliverySuccess,
    PingOrgWebhookFailure,
    PingOrgWebhookSuccess,
    RedeliverOrgWebhookDeliveryFailure,
    RedeliverOrgWebhookDeliverySuccess,
    ListOrgWebhookDeliveriesFailure,
    ListOrgWebhookDeliveriesSuccess,
    ListOrgWebhooksFailure,
    ListOrgWebhooksSuccess,
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
