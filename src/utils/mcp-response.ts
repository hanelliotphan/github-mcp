import type {
    AcceptRepositoryInvitationFailure,
    AcceptRepositoryInvitationSuccess,
    AddAppAccessRestrictionsFailure,
    AddAppAccessRestrictionsSuccess,
    AddAuthenticatedUserEmailsFailure,
    AddAuthenticatedUserEmailsSuccess,
    AddAuthenticatedUserSocialAccountsFailure,
    AddAuthenticatedUserSocialAccountsSuccess,
    AddCustomLabelsToSelfHostedRunnerForOrgFailure,
    AddCustomLabelsToSelfHostedRunnerForOrgSuccess,
    AddCustomLabelsToSelfHostedRunnerForRepoFailure,
    AddCustomLabelsToSelfHostedRunnerForRepoSuccess,
    AddEnterpriseCopilotCodingAgentOrganizationsFailure,
    AddEnterpriseCopilotCodingAgentOrganizationsSuccess,
    AddEnterpriseTeamMemberFailure,
    AddEnterpriseTeamMemberSuccess,
    AddEnterpriseTeamOrganizationAssignmentFailure,
    AddEnterpriseTeamOrganizationAssignmentSuccess,
    AddIssueAssigneesFailure,
    AddIssueAssigneesSuccess,
    AddIssueDependencyBlockedByFailure,
    AddIssueDependencyBlockedBySuccess,
    AddIssueFieldValuesFailure,
    AddIssueFieldValuesSuccess,
    AddIssueLabelsFailure,
    AddIssueLabelsSuccess,
    AddIssueSubIssueFailure,
    AddIssueSubIssueSuccess,
    AddOrgCodespacesAccessUsersFailure,
    AddOrgCodespacesAccessUsersSuccess,
    AddOrgCopilotSeatsForTeamsFailure,
    AddOrgCopilotSeatsForTeamsSuccess,
    AddOrgCopilotSeatsForUsersFailure,
    AddOrgCopilotSeatsForUsersSuccess,
    AddOrgCopilotSpaceCollaboratorFailure,
    AddOrgCopilotSpaceCollaboratorSuccess,
    AddOrgProjectItemFailure,
    AddOrgProjectItemSuccess,
    AddOrgSecurityManagerTeamFailure,
    AddOrgSecurityManagerTeamSuccess,
    AddOrUpdateOrgTeamMembershipForUserFailure,
    AddOrUpdateOrgTeamMembershipForUserSuccess,
    AddOrUpdateOrgTeamRepoPermissionsFailure,
    AddOrUpdateOrgTeamRepoPermissionsSuccess,
    AddRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    AddRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    AddRepoCollaboratorFailure,
    AddRepoCollaboratorSuccess,
    AddRepoPullRequestCreationCapBypassUsersFailure,
    AddRepoPullRequestCreationCapBypassUsersSuccess,
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
    AddSelectedRepoToOrgDependabotSecretFailure,
    AddSelectedRepoToOrgDependabotSecretSuccess,
    AddSelfHostedRunnerToGroupForOrgFailure,
    AddSelfHostedRunnerToGroupForOrgSuccess,
    AddStatusCheckContextsFailure,
    AddStatusCheckContextsSuccess,
    AddTeamAccessRestrictionsFailure,
    AddTeamAccessRestrictionsSuccess,
    AddUserAccessRestrictionsFailure,
    AddUserAccessRestrictionsSuccess,
    AddUserCopilotSpaceCollaboratorFailure,
    AddUserCopilotSpaceCollaboratorSuccess,
    AddUserProjectItemFailure,
    AddUserProjectItemSuccess,
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
    BlockUserFailure,
    BlockUserSuccess,
    BulkAddEnterpriseTeamMembersFailure,
    BulkAddEnterpriseTeamMembersSuccess,
    BulkAddEnterpriseTeamOrganizationAssignmentsFailure,
    BulkAddEnterpriseTeamOrganizationAssignmentsSuccess,
    BulkListOrgAttestationsFailure,
    BulkListOrgAttestationsSuccess,
    BulkRemoveEnterpriseTeamMembersFailure,
    BulkRemoveEnterpriseTeamMembersSuccess,
    BulkRemoveEnterpriseTeamOrganizationAssignmentsFailure,
    BulkRemoveEnterpriseTeamOrganizationAssignmentsSuccess,
    CancelOrgInvitationFailure,
    CancelOrgInvitationSuccess,
    CancelRepoDependabotDismissalRequestFailure,
    CancelRepoDependabotDismissalRequestSuccess,
    CancelRepoPagesDeploymentFailure,
    CancelRepoPagesDeploymentSuccess,
    CancelWorkflowRunFailure,
    CancelWorkflowRunSuccess,
    CheckAppTokenFailure,
    CheckAppTokenSuccess,
    CheckAuthenticatedUserFollowsUserFailure,
    CheckAuthenticatedUserFollowsUserSuccess,
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
    CheckOrgTeamRepoPermissionsFailure,
    CheckOrgTeamRepoPermissionsSuccess,
    CheckPrivateVulnerabilityReportingFailure,
    CheckPrivateVulnerabilityReportingSuccess,
    CheckRepoCodespacePermissionsFailure,
    CheckRepoCodespacePermissionsSuccess,
    CheckRepoCollaboratorFailure,
    CheckRepoCollaboratorSuccess,
    CheckRepoIsStarredByAuthenticatedUserFailure,
    CheckRepoIsStarredByAuthenticatedUserSuccess,
    CheckUserBlockedFailure,
    CheckUserBlockedSuccess,
    CheckUserCanBeAssignedFailure,
    CheckUserCanBeAssignedSuccess,
    CheckUserCanBeAssignedToIssueFailure,
    CheckUserCanBeAssignedToIssueSuccess,
    CheckUserFollowsUserFailure,
    CheckUserFollowsUserSuccess,
    CheckVulnerabilityAlertsFailure,
    CheckVulnerabilityAlertsSuccess,
    CommitCodeScanningAutofixFailure,
    CommitCodeScanningAutofixSuccess,
    CompareRepoCommitsFailure,
    CompareRepoCommitsSuccess,
    CompareRepoDependencyGraphFailure,
    CompareRepoDependencyGraphSuccess,
    ConvertOrgMemberToOutsideCollaboratorFailure,
    ConvertOrgMemberToOutsideCollaboratorSuccess,
    CreateAuthenticatedUserGpgKeyFailure,
    CreateAuthenticatedUserGpgKeySuccess,
    CreateAuthenticatedUserPublicSshKeyFailure,
    CreateAuthenticatedUserPublicSshKeySuccess,
    CreateAuthenticatedUserSshSigningKeyFailure,
    CreateAuthenticatedUserSshSigningKeySuccess,
    CreateCheckRunFailure,
    CreateCheckRunSuccess,
    CreateCheckSuiteFailure,
    CreateCheckSuiteSuccess,
    CreateCodeqlVariantAnalysisFailure,
    CreateCodeqlVariantAnalysisSuccess,
    CreateCodeScanningAutofixFailure,
    CreateCodeScanningAutofixSuccess,
    CreateCommitCommentFailure,
    CreateCommitCommentReactionFailure,
    CreateCommitCommentReactionSuccess,
    CreateCommitCommentSuccess,
    CreateCommitSignatureProtectionFailure,
    CreateCommitSignatureProtectionSuccess,
    CreateCommitStatusFailure,
    CreateCommitStatusSuccess,
    CreateEnterpriseCodeSecurityConfigurationFailure,
    CreateEnterpriseCodeSecurityConfigurationSuccess,
    CreateEnterpriseCostCenterFailure,
    CreateEnterpriseCostCenterSuccess,
    CreateEnterpriseTeamFailure,
    CreateEnterpriseTeamSuccess,
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
    CreateIssueCommentFailure,
    CreateIssueCommentReactionFailure,
    CreateIssueCommentReactionSuccess,
    CreateIssueCommentSuccess,
    CreateIssueReactionFailure,
    CreateIssueReactionSuccess,
    CreateModelChatCompletionFailure,
    CreateModelChatCompletionSuccess,
    CreateModelEmbeddingsFailure,
    CreateModelEmbeddingsSuccess,
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
    CreateOrgCopilotSpaceFailure,
    CreateOrgCopilotSpaceResourceFailure,
    CreateOrgCopilotSpaceResourceSuccess,
    CreateOrgCopilotSpaceSuccess,
    CreateOrgInvitationFailure,
    CreateOrgInvitationSuccess,
    CreateOrgIssueFieldFailure,
    CreateOrgIssueFieldSuccess,
    CreateOrgIssueTypeFailure,
    CreateOrgIssueTypeSuccess,
    CreateOrgMetadataStorageRecordFailure,
    CreateOrgMetadataStorageRecordSuccess,
    CreateOrgModelChatCompletionFailure,
    CreateOrgModelChatCompletionSuccess,
    CreateOrgModelEmbeddingsFailure,
    CreateOrgModelEmbeddingsSuccess,
    CreateOrgNetworkConfigurationFailure,
    CreateOrgNetworkConfigurationSuccess,
    CreateOrgPrivateRegistryFailure,
    CreateOrgPrivateRegistrySuccess,
    CreateOrgProjectDraftItemFailure,
    CreateOrgProjectDraftItemSuccess,
    CreateOrgProjectFieldFailure,
    CreateOrgProjectFieldSuccess,
    CreateOrgProjectViewFailure,
    CreateOrgProjectViewSuccess,
    CreateOrgRulesetFailure,
    CreateOrgRulesetSuccess,
    CreateOrgSecretScanningCustomPatternsFailure,
    CreateOrgSecretScanningCustomPatternsSuccess,
    CreateOrgTeamFailure,
    CreateOrgTeamSuccess,
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
    CreateOrUpdateOrgDependabotSecretFailure,
    CreateOrUpdateOrgDependabotSecretSuccess,
    CreateOrUpdateRepoActionsSecretFailure,
    CreateOrUpdateRepoActionsSecretSuccess,
    CreateOrUpdateRepoAgentSecretFailure,
    CreateOrUpdateRepoAgentSecretSuccess,
    CreateOrUpdateRepoCodespacesSecretFailure,
    CreateOrUpdateRepoCodespacesSecretSuccess,
    CreateOrUpdateRepoDependabotSecretFailure,
    CreateOrUpdateRepoDependabotSecretSuccess,
    CreateOrUpdateRepoEnvironmentFailure,
    CreateOrUpdateRepoEnvironmentSuccess,
    CreateOrUpdateUserCodespacesSecretFailure,
    CreateOrUpdateUserCodespacesSecretSuccess,
    CreatePrivateVulnerabilityReportFailure,
    CreatePrivateVulnerabilityReportSuccess,
    CreatePullRequestCodespaceFailure,
    CreatePullRequestCodespaceSuccess,
    CreatePullRequestReviewCommentReactionFailure,
    CreatePullRequestReviewCommentReactionSuccess,
    CreateRegistrationTokenForOrgFailure,
    CreateRegistrationTokenForOrgSuccess,
    CreateRegistrationTokenForRepoFailure,
    CreateRegistrationTokenForRepoSuccess,
    CreateReleaseReactionFailure,
    CreateReleaseReactionSuccess,
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
    CreateRepoDependabotDismissalRequestFailure,
    CreateRepoDependabotDismissalRequestSuccess,
    CreateRepoDependencySnapshotFailure,
    CreateRepoDependencySnapshotSuccess,
    CreateRepoDeployKeyFailure,
    CreateRepoDeployKeySuccess,
    CreateRepoDeploymentFailure,
    CreateRepoDeploymentStatusFailure,
    CreateRepoDeploymentStatusSuccess,
    CreateRepoDeploymentSuccess,
    CreateRepoDispatchFailure,
    CreateRepoDispatchSuccess,
    CreateRepoEnvironmentDeploymentBranchPolicyFailure,
    CreateRepoEnvironmentDeploymentBranchPolicySuccess,
    CreateRepoEnvironmentDeploymentProtectionRuleFailure,
    CreateRepoEnvironmentDeploymentProtectionRuleSuccess,
    CreateRepoFailure,
    CreateRepoForkFailure,
    CreateRepoForkSuccess,
    CreateRepoGitBlobFailure,
    CreateRepoGitBlobSuccess,
    CreateRepoGitCommitFailure,
    CreateRepoGitCommitSuccess,
    CreateRepoGitRefFailure,
    CreateRepoGitRefSuccess,
    CreateRepoGitTagFailure,
    CreateRepoGitTagSuccess,
    CreateRepoGitTreeFailure,
    CreateRepoGitTreeSuccess,
    CreateRepoIssueFailure,
    CreateRepoIssueSuccess,
    CreateRepoLabelFailure,
    CreateRepoLabelSuccess,
    CreateRepoMilestoneFailure,
    CreateRepoMilestoneSuccess,
    CreateRepoPagesDeploymentFailure,
    CreateRepoPagesDeploymentSuccess,
    CreateRepoPagesSiteFailure,
    CreateRepoPagesSiteSuccess,
    CreateRepoReleaseFailure,
    CreateRepoReleaseSuccess,
    CreateRepoRulesetFailure,
    CreateRepoRulesetSuccess,
    CreateRepoSecretScanningCustomPatternsFailure,
    CreateRepoSecretScanningCustomPatternsSuccess,
    CreateRepoSecurityAdvisoryFailure,
    CreateRepoSecurityAdvisorySuccess,
    CreateRepoSecurityAdvisoryTemporaryForkFailure,
    CreateRepoSecurityAdvisoryTemporaryForkSuccess,
    CreateRepoSuccess,
    CreateRepoWebhookFailure,
    CreateRepoWebhookSuccess,
    CreateScopedAccessTokenFailure,
    CreateScopedAccessTokenSuccess,
    CreateSecretScanningPushProtectionBypassFailure,
    CreateSecretScanningPushProtectionBypassSuccess,
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
    CreateUserCopilotSpaceFailure,
    CreateUserCopilotSpaceResourceFailure,
    CreateUserCopilotSpaceResourceSuccess,
    CreateUserCopilotSpaceSuccess,
    CreateUserProjectDraftItemFailure,
    CreateUserProjectDraftItemSuccess,
    CreateUserProjectFieldFailure,
    CreateUserProjectFieldSuccess,
    CreateUserProjectViewFailure,
    CreateUserProjectViewSuccess,
    CreateWorkflowDispatchFailure,
    CreateWorkflowDispatchSuccess,
    DeclineRepositoryInvitationFailure,
    DeclineRepositoryInvitationSuccess,
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
    DeleteAuthenticatedUserEmailsFailure,
    DeleteAuthenticatedUserEmailsSuccess,
    DeleteAuthenticatedUserGpgKeyFailure,
    DeleteAuthenticatedUserGpgKeySuccess,
    DeleteAuthenticatedUserPackageFailure,
    DeleteAuthenticatedUserPackageSuccess,
    DeleteAuthenticatedUserPackageVersionFailure,
    DeleteAuthenticatedUserPackageVersionSuccess,
    DeleteAuthenticatedUserPublicSshKeyFailure,
    DeleteAuthenticatedUserPublicSshKeySuccess,
    DeleteAuthenticatedUserSocialAccountsFailure,
    DeleteAuthenticatedUserSocialAccountsSuccess,
    DeleteAuthenticatedUserSshSigningKeyFailure,
    DeleteAuthenticatedUserSshSigningKeySuccess,
    DeleteCodeqlDatabaseFailure,
    DeleteCodeqlDatabaseSuccess,
    DeleteCodeScanningAnalysisFailure,
    DeleteCodeScanningAnalysisSuccess,
    DeleteCommitCommentFailure,
    DeleteCommitCommentReactionFailure,
    DeleteCommitCommentReactionSuccess,
    DeleteCommitCommentSuccess,
    DeleteCommitSignatureProtectionFailure,
    DeleteCommitSignatureProtectionSuccess,
    DeleteCustomImageFromOrgFailure,
    DeleteCustomImageFromOrgSuccess,
    DeleteCustomImageVersionFromOrgFailure,
    DeleteCustomImageVersionFromOrgSuccess,
    DeleteEnterpriseCodeSecurityConfigurationFailure,
    DeleteEnterpriseCodeSecurityConfigurationSuccess,
    DeleteEnterpriseCopilotCustomAgentsSourceFailure,
    DeleteEnterpriseCopilotCustomAgentsSourceSuccess,
    DeleteEnterpriseCostCenterFailure,
    DeleteEnterpriseCostCenterSuccess,
    DeleteEnterpriseTeamFailure,
    DeleteEnterpriseTeamOrganizationAssignmentFailure,
    DeleteEnterpriseTeamOrganizationAssignmentSuccess,
    DeleteEnterpriseTeamSuccess,
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
    DeleteIssueCommentFailure,
    DeleteIssueCommentReactionFailure,
    DeleteIssueCommentReactionSuccess,
    DeleteIssueCommentSuccess,
    DeleteIssueFieldValueFailure,
    DeleteIssueFieldValueSuccess,
    DeleteIssueReactionFailure,
    DeleteIssueReactionSuccess,
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
    DeleteOrgCopilotSpaceFailure,
    DeleteOrgCopilotSpaceResourceFailure,
    DeleteOrgCopilotSpaceResourceSuccess,
    DeleteOrgCopilotSpaceSuccess,
    DeleteOrgCustomPropertyFailure,
    DeleteOrgCustomPropertySuccess,
    DeleteOrgDependabotSecretFailure,
    DeleteOrgDependabotSecretSuccess,
    DeleteOrgFailure,
    DeleteOrgIssueFieldFailure,
    DeleteOrgIssueFieldSuccess,
    DeleteOrgIssueTypeFailure,
    DeleteOrgIssueTypeSuccess,
    DeleteOrgNetworkConfigurationFailure,
    DeleteOrgNetworkConfigurationSuccess,
    DeleteOrgPackageFailure,
    DeleteOrgPackageSuccess,
    DeleteOrgPackageVersionFailure,
    DeleteOrgPackageVersionSuccess,
    DeleteOrgPrivateRegistryFailure,
    DeleteOrgPrivateRegistrySuccess,
    DeleteOrgProjectItemFailure,
    DeleteOrgProjectItemSuccess,
    DeleteOrgRulesetFailure,
    DeleteOrgRulesetSuccess,
    DeleteOrgSecretScanningCustomPatternsFailure,
    DeleteOrgSecretScanningCustomPatternsSuccess,
    DeleteOrgSuccess,
    DeleteOrgTeamExternalGroupsFailure,
    DeleteOrgTeamExternalGroupsSuccess,
    DeleteOrgTeamFailure,
    DeleteOrgTeamSuccess,
    DeleteOrgUserCodespaceFailure,
    DeleteOrgUserCodespaceSuccess,
    DeleteOrgWebhookFailure,
    DeleteOrgWebhookSuccess,
    DeletePullRequestReviewCommentReactionFailure,
    DeletePullRequestReviewCommentReactionSuccess,
    DeletePullRequestReviewProtectionFailure,
    DeletePullRequestReviewProtectionSuccess,
    DeleteReleaseReactionFailure,
    DeleteReleaseReactionSuccess,
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
    DeleteRepoDependabotSecretFailure,
    DeleteRepoDependabotSecretSuccess,
    DeleteRepoDeployKeyFailure,
    DeleteRepoDeployKeySuccess,
    DeleteRepoDeploymentFailure,
    DeleteRepoDeploymentSuccess,
    DeleteRepoEnvironmentDeploymentBranchPolicyFailure,
    DeleteRepoEnvironmentDeploymentBranchPolicySuccess,
    DeleteRepoEnvironmentDeploymentProtectionRuleFailure,
    DeleteRepoEnvironmentDeploymentProtectionRuleSuccess,
    DeleteRepoEnvironmentFailure,
    DeleteRepoEnvironmentSuccess,
    DeleteRepoFailure,
    DeleteRepoGitRefFailure,
    DeleteRepoGitRefSuccess,
    DeleteRepoInvitationFailure,
    DeleteRepoInvitationSuccess,
    DeleteRepoLabelFailure,
    DeleteRepoLabelSuccess,
    DeleteRepoMilestoneFailure,
    DeleteRepoMilestoneSuccess,
    DeleteRepoPagesSiteFailure,
    DeleteRepoPagesSiteSuccess,
    DeleteRepoReleaseAssetFailure,
    DeleteRepoReleaseAssetSuccess,
    DeleteRepoReleaseFailure,
    DeleteRepoReleaseSuccess,
    DeleteRepoRulesetFailure,
    DeleteRepoRulesetSuccess,
    DeleteRepoSecretScanningCustomPatternsFailure,
    DeleteRepoSecretScanningCustomPatternsSuccess,
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
    DeleteUserCopilotSpaceFailure,
    DeleteUserCopilotSpaceResourceFailure,
    DeleteUserCopilotSpaceResourceSuccess,
    DeleteUserCopilotSpaceSuccess,
    DeleteUserPackageFailure,
    DeleteUserPackageSuccess,
    DeleteUserPackageVersionFailure,
    DeleteUserPackageVersionSuccess,
    DeleteUserProjectItemFailure,
    DeleteUserProjectItemSuccess,
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
    DisableOrgCopilotCodingAgentRepositoryFailure,
    DisableOrgCopilotCodingAgentRepositorySuccess,
    DisablePrivateVulnerabilityReportingFailure,
    DisablePrivateVulnerabilityReportingSuccess,
    DisableSelectedRepositoryGithubActionsOrganizationFailure,
    DisableSelectedRepositoryGithubActionsOrganizationSuccess,
    DisableVulnerabilityAlertsFailure,
    DisableVulnerabilityAlertsSuccess,
    DisableWorkflowFailure,
    DisableWorkflowSuccess,
    DismissSecretScanningBypassResponseFailure,
    DismissSecretScanningBypassResponseSuccess,
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
    EnableOrgCopilotCodingAgentRepositoryFailure,
    EnableOrgCopilotCodingAgentRepositorySuccess,
    EnablePrivateVulnerabilityReportingFailure,
    EnablePrivateVulnerabilityReportingSuccess,
    EnableSelectedRepositoryGithubActionsOrganizationFailure,
    EnableSelectedRepositoryGithubActionsOrganizationSuccess,
    EnableVulnerabilityAlertsFailure,
    EnableVulnerabilityAlertsSuccess,
    EnableWorkflowFailure,
    EnableWorkflowSuccess,
    ExportRepoSbomFailure,
    ExportRepoSbomSuccess,
    ExportUserCodespaceFailure,
    ExportUserCodespaceSuccess,
    FetchRepoSbomReportFailure,
    FetchRepoSbomReportSuccess,
    FollowUserFailure,
    FollowUserSuccess,
    ForceCancelWorkflowRunFailure,
    ForceCancelWorkflowRunSuccess,
    GenerateRepoReleaseNotesFailure,
    GenerateRepoReleaseNotesSuccess,
    GenerateRepoSbomReportFailure,
    GenerateRepoSbomReportSuccess,
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
    GetApiRootFailure,
    GetApiRootSuccess,
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
    GetAuthenticatedUserFailure,
    GetAuthenticatedUserGpgKeyFailure,
    GetAuthenticatedUserGpgKeySuccess,
    GetAuthenticatedUserInteractionLimitsFailure,
    GetAuthenticatedUserInteractionLimitsSuccess,
    GetAuthenticatedUserPackageFailure,
    GetAuthenticatedUserPackageSuccess,
    GetAuthenticatedUserPackageVersionFailure,
    GetAuthenticatedUserPackageVersionSuccess,
    GetAuthenticatedUserPublicSshKeyFailure,
    GetAuthenticatedUserPublicSshKeySuccess,
    GetAuthenticatedUserSshSigningKeyFailure,
    GetAuthenticatedUserSshSigningKeySuccess,
    GetAuthenticatedUserSuccess,
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
    GetCombinedCommitStatusFailure,
    GetCombinedCommitStatusSuccess,
    GetCommitCommentFailure,
    GetCommitCommentSuccess,
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
    GetEmojisFailure,
    GetEmojisSuccess,
    GetEnterpriseCodeSecurityConfigurationFailure,
    GetEnterpriseCodeSecurityConfigurationSuccess,
    GetEnterpriseCopilotCustomAgentsSourceFailure,
    GetEnterpriseCopilotCustomAgentsSourceSuccess,
    GetEnterpriseCopilotMetrics1DayFailure,
    GetEnterpriseCopilotMetrics1DaySuccess,
    GetEnterpriseCopilotMetrics28DayFailure,
    GetEnterpriseCopilotMetrics28DaySuccess,
    GetEnterpriseCopilotReposMetrics1DayFailure,
    GetEnterpriseCopilotReposMetrics1DaySuccess,
    GetEnterpriseCopilotUsersMetrics1DayFailure,
    GetEnterpriseCopilotUsersMetrics1DaySuccess,
    GetEnterpriseCopilotUsersMetrics28DayFailure,
    GetEnterpriseCopilotUsersMetrics28DaySuccess,
    GetEnterpriseCopilotUserTeamsMetrics1DayFailure,
    GetEnterpriseCopilotUserTeamsMetrics1DaySuccess,
    GetEnterpriseCostCenterFailure,
    GetEnterpriseCostCenterSuccess,
    GetEnterpriseTeamFailure,
    GetEnterpriseTeamMembershipFailure,
    GetEnterpriseTeamMembershipSuccess,
    GetEnterpriseTeamOrganizationAssignmentFailure,
    GetEnterpriseTeamOrganizationAssignmentSuccess,
    GetEnterpriseTeamSuccess,
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
    GetGitignoreTemplateFailure,
    GetGitignoreTemplateSuccess,
    GetGlobalSecurityAdvisoryFailure,
    GetGlobalSecurityAdvisorySuccess,
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
    GetIssueCommentFailure,
    GetIssueCommentSuccess,
    GetIssueEventFailure,
    GetIssueEventSuccess,
    GetIssueParentFailure,
    GetIssueParentSuccess,
    GetJobForWorkflowRunFailure,
    GetJobForWorkflowRunSuccess,
    GetLatestRepoPagesBuildFailure,
    GetLatestRepoPagesBuildSuccess,
    GetLatestRepoReleaseFailure,
    GetLatestRepoReleaseSuccess,
    GetLicenseFailure,
    GetLicenseSuccess,
    GetMarketplaceSubscriptionPlanForAccountFailure,
    GetMarketplaceSubscriptionPlanForAccountStubbedFailure,
    GetMarketplaceSubscriptionPlanForAccountStubbedSuccess,
    GetMarketplaceSubscriptionPlanForAccountSuccess,
    GetMetaFailure,
    GetMetaSuccess,
    GetOctocatFailure,
    GetOctocatSuccess,
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
    GetOrgCopilotBillingFailure,
    GetOrgCopilotBillingSuccess,
    GetOrgCopilotCodingAgentPermissionsFailure,
    GetOrgCopilotCodingAgentPermissionsSuccess,
    GetOrgCopilotContentExclusionFailure,
    GetOrgCopilotContentExclusionSuccess,
    GetOrgCopilotMetrics1DayFailure,
    GetOrgCopilotMetrics1DaySuccess,
    GetOrgCopilotMetrics28DayFailure,
    GetOrgCopilotMetrics28DaySuccess,
    GetOrgCopilotReposMetrics1DayFailure,
    GetOrgCopilotReposMetrics1DaySuccess,
    GetOrgCopilotSeatDetailsForUserFailure,
    GetOrgCopilotSeatDetailsForUserSuccess,
    GetOrgCopilotSpaceFailure,
    GetOrgCopilotSpaceResourceFailure,
    GetOrgCopilotSpaceResourceSuccess,
    GetOrgCopilotSpaceSuccess,
    GetOrgCopilotUsersMetrics1DayFailure,
    GetOrgCopilotUsersMetrics1DaySuccess,
    GetOrgCopilotUsersMetrics28DayFailure,
    GetOrgCopilotUsersMetrics28DaySuccess,
    GetOrgCopilotUserTeamsMetrics1DayFailure,
    GetOrgCopilotUserTeamsMetrics1DaySuccess,
    GetOrgCustomPropertiesFailure,
    GetOrgCustomPropertiesSuccess,
    GetOrgCustomPropertyFailure,
    GetOrgCustomPropertySuccess,
    GetOrgCustomPropertyValuesFailure,
    GetOrgCustomPropertyValuesSuccess,
    GetOrgDependabotPublicKeyFailure,
    GetOrgDependabotPublicKeySuccess,
    GetOrgDependabotSecretFailure,
    GetOrgDependabotSecretSuccess,
    GetOrgExternalGroupFailure,
    GetOrgExternalGroupSuccess,
    GetOrgFailure,
    GetOrgImmutableReleasesSettingsFailure,
    GetOrgImmutableReleasesSettingsSuccess,
    GetOrgInstallationForAuthenticatedAppFailure,
    GetOrgInstallationForAuthenticatedAppSuccess,
    GetOrgInteractionLimitsFailure,
    GetOrgInteractionLimitsSuccess,
    GetOrgMembershipForAuthUserFailure,
    GetOrgMembershipForAuthUserSuccess,
    GetOrgMembershipForUserFailure,
    GetOrgMembershipForUserSuccess,
    GetOrgNetworkConfigurationFailure,
    GetOrgNetworkConfigurationSuccess,
    GetOrgNetworkSettingsFailure,
    GetOrgNetworkSettingsSuccess,
    GetOrgPackageFailure,
    GetOrgPackageSuccess,
    GetOrgPackageVersionFailure,
    GetOrgPackageVersionSuccess,
    GetOrgPremiumRequestBillingUsageFailure,
    GetOrgPremiumRequestBillingUsageSuccess,
    GetOrgPrivateRegistriesPublicKeyFailure,
    GetOrgPrivateRegistriesPublicKeySuccess,
    GetOrgPrivateRegistryFailure,
    GetOrgPrivateRegistrySuccess,
    GetOrgProjectFailure,
    GetOrgProjectFieldFailure,
    GetOrgProjectFieldSuccess,
    GetOrgProjectItemFailure,
    GetOrgProjectItemSuccess,
    GetOrgProjectSuccess,
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
    GetOrgTeamFailure,
    GetOrgTeamMembershipForUserFailure,
    GetOrgTeamMembershipForUserSuccess,
    GetOrgTeamSuccess,
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
    GetRateLimitFailure,
    GetRateLimitSuccess,
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
    GetRepoClonesFailure,
    GetRepoClonesSuccess,
    GetRepoCodeFrequencyStatsFailure,
    GetRepoCodeFrequencyStatsSuccess,
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
    GetRepoCollaboratorPermissionFailure,
    GetRepoCollaboratorPermissionSuccess,
    GetRepoCommitActivityStatsFailure,
    GetRepoCommitActivityStatsSuccess,
    GetRepoCommitFailure,
    GetRepoCommitSuccess,
    GetRepoCommunityProfileMetricsFailure,
    GetRepoCommunityProfileMetricsSuccess,
    GetRepoContentFailure,
    GetRepoContentSuccess,
    GetRepoContributorsStatsFailure,
    GetRepoContributorsStatsSuccess,
    GetRepoCopilotCloudAgentConfigurationFailure,
    GetRepoCopilotCloudAgentConfigurationSuccess,
    GetRepoCustomPropertyValuesFailure,
    GetRepoCustomPropertyValuesSuccess,
    GetRepoDependabotAlertFailure,
    GetRepoDependabotAlertSuccess,
    GetRepoDependabotDismissalRequestFailure,
    GetRepoDependabotDismissalRequestSuccess,
    GetRepoDependabotPublicKeyFailure,
    GetRepoDependabotPublicKeySuccess,
    GetRepoDependabotSecretFailure,
    GetRepoDependabotSecretSuccess,
    GetRepoDeployKeyFailure,
    GetRepoDeployKeySuccess,
    GetRepoDeploymentFailure,
    GetRepoDeploymentStatusFailure,
    GetRepoDeploymentStatusSuccess,
    GetRepoDeploymentSuccess,
    GetRepoEnvironmentDeploymentBranchPolicyFailure,
    GetRepoEnvironmentDeploymentBranchPolicySuccess,
    GetRepoEnvironmentDeploymentProtectionRuleFailure,
    GetRepoEnvironmentDeploymentProtectionRuleSuccess,
    GetRepoEnvironmentFailure,
    GetRepoEnvironmentSuccess,
    GetRepoFailure,
    GetRepoGitBlobFailure,
    GetRepoGitBlobSuccess,
    GetRepoGitCommitFailure,
    GetRepoGitCommitSuccess,
    GetRepoGitRefFailure,
    GetRepoGitRefSuccess,
    GetRepoGitTagFailure,
    GetRepoGitTagSuccess,
    GetRepoGitTreeFailure,
    GetRepoGitTreeSuccess,
    GetRepoInstallationForAuthenticatedAppFailure,
    GetRepoInstallationForAuthenticatedAppSuccess,
    GetRepoInteractionLimitsFailure,
    GetRepoInteractionLimitsSuccess,
    GetRepoIssueFailure,
    GetRepoIssueSuccess,
    GetRepoLabelFailure,
    GetRepoLabelSuccess,
    GetRepoLicenseFailure,
    GetRepoLicenseSuccess,
    GetRepoMilestoneFailure,
    GetRepoMilestoneSuccess,
    GetRepoPagesBuildFailure,
    GetRepoPagesBuildSuccess,
    GetRepoPagesDeploymentFailure,
    GetRepoPagesDeploymentSuccess,
    GetRepoPagesFailure,
    GetRepoPagesHealthCheckFailure,
    GetRepoPagesHealthCheckSuccess,
    GetRepoPagesSuccess,
    GetRepoParticipationStatsFailure,
    GetRepoParticipationStatsSuccess,
    GetRepoPullRequestCreationCapFailure,
    GetRepoPullRequestCreationCapSuccess,
    GetRepoPunchCardStatsFailure,
    GetRepoPunchCardStatsSuccess,
    GetRepoReadmeFailure,
    GetRepoReadmeSuccess,
    GetRepoReleaseAssetFailure,
    GetRepoReleaseAssetSuccess,
    GetRepoReleaseByTagFailure,
    GetRepoReleaseByTagSuccess,
    GetRepoReleaseFailure,
    GetRepoReleaseSuccess,
    GetRepoRulesetFailure,
    GetRepoRulesetHistoryFailure,
    GetRepoRulesetHistorySuccess,
    GetRepoRulesetSuccess,
    GetRepoRulesetVersionFailure,
    GetRepoRulesetVersionSuccess,
    GetRepoRuleSuiteFailure,
    GetRepoRuleSuiteSuccess,
    GetRepoSecretScanningScanHistoryFailure,
    GetRepoSecretScanningScanHistorySuccess,
    GetRepoSecurityAdvisoryFailure,
    GetRepoSecurityAdvisorySuccess,
    GetRepoSubscriptionFailure,
    GetRepoSubscriptionSuccess,
    GetRepoSuccess,
    GetRepoTopPathsFailure,
    GetRepoTopPathsSuccess,
    GetRepoTopReferrersFailure,
    GetRepoTopReferrersSuccess,
    GetRepoViewsFailure,
    GetRepoViewsSuccess,
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
    GetSecretScanningAlertDismissalRequestFailure,
    GetSecretScanningAlertDismissalRequestSuccess,
    GetSecretScanningAlertFailure,
    GetSecretScanningAlertSuccess,
    GetSecretScanningBypassRequestFailure,
    GetSecretScanningBypassRequestSuccess,
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
    GetUserByIdFailure,
    GetUserByIdSuccess,
    GetUserCodespaceExportFailure,
    GetUserCodespaceExportSuccess,
    GetUserCodespaceFailure,
    GetUserCodespacesPublicKeyFailure,
    GetUserCodespacesPublicKeySuccess,
    GetUserCodespacesSecretFailure,
    GetUserCodespacesSecretSuccess,
    GetUserCodespaceSuccess,
    GetUserCopilotSpaceFailure,
    GetUserCopilotSpaceResourceFailure,
    GetUserCopilotSpaceResourceSuccess,
    GetUserCopilotSpaceSuccess,
    GetUserFailure,
    GetUserHovercardFailure,
    GetUserHovercardSuccess,
    GetUserInstallationForAuthenticatedAppFailure,
    GetUserInstallationForAuthenticatedAppSuccess,
    GetUserPackageFailure,
    GetUserPackageSuccess,
    GetUserPackageVersionFailure,
    GetUserPackageVersionSuccess,
    GetUserPremiumRequestBillingUsageFailure,
    GetUserPremiumRequestBillingUsageSuccess,
    GetUserProjectFailure,
    GetUserProjectFieldFailure,
    GetUserProjectFieldSuccess,
    GetUserProjectItemFailure,
    GetUserProjectItemSuccess,
    GetUserProjectSuccess,
    GetUserStatsFailure,
    GetUserStatsSuccess,
    GetUserSuccess,
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
    GetZenFailure,
    GetZenSuccess,
    ListAcceptedClassroomAssignmentsFailure,
    ListAcceptedClassroomAssignmentsSuccess,
    ListActionsCachesFailure,
    ListActionsCachesSuccess,
    ListAgentTasksFailure,
    ListAgentTasksForRepoFailure,
    ListAgentTasksForRepoSuccess,
    ListAgentTasksSuccess,
    ListApiVersionsFailure,
    ListApiVersionsSuccess,
    ListAppInstallationsAccessibleToUserFailure,
    ListAppInstallationsAccessibleToUserSuccess,
    ListAppWebhookDeliveriesFailure,
    ListAppWebhookDeliveriesSuccess,
    ListArtifactsForRepoFailure,
    ListArtifactsForRepoSuccess,
    ListAuthenticatedUserDockerMigrationConflictsFailure,
    ListAuthenticatedUserDockerMigrationConflictsSuccess,
    ListAuthenticatedUserEmailsFailure,
    ListAuthenticatedUserEmailsSuccess,
    ListAuthenticatedUserFollowersFailure,
    ListAuthenticatedUserFollowersSuccess,
    ListAuthenticatedUserFollowingFailure,
    ListAuthenticatedUserFollowingSuccess,
    ListAuthenticatedUserGpgKeysFailure,
    ListAuthenticatedUserGpgKeysSuccess,
    ListAuthenticatedUserPackagesFailure,
    ListAuthenticatedUserPackagesSuccess,
    ListAuthenticatedUserPackageVersionsFailure,
    ListAuthenticatedUserPackageVersionsSuccess,
    ListAuthenticatedUserPublicEmailsFailure,
    ListAuthenticatedUserPublicEmailsSuccess,
    ListAuthenticatedUserPublicSshKeysFailure,
    ListAuthenticatedUserPublicSshKeysSuccess,
    ListAuthenticatedUserReposFailure,
    ListAuthenticatedUserReposSuccess,
    ListAuthenticatedUserSocialAccountsFailure,
    ListAuthenticatedUserSocialAccountsSuccess,
    ListAuthenticatedUserSshSigningKeysFailure,
    ListAuthenticatedUserSshSigningKeysSuccess,
    ListAuthenticatedUserTeamsFailure,
    ListAuthenticatedUserTeamsSuccess,
    ListBlockedUsersFailure,
    ListBlockedUsersSuccess,
    ListBranchesForHeadCommitFailure,
    ListBranchesForHeadCommitSuccess,
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
    ListCommitCommentReactionsFailure,
    ListCommitCommentReactionsSuccess,
    ListCommitCommentsFailure,
    ListCommitCommentsSuccess,
    ListCommitStatusesFailure,
    ListCommitStatusesSuccess,
    ListCommonlyUsedLicensesFailure,
    ListCommonlyUsedLicensesSuccess,
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
    ListEnterpriseCopilotCustomAgentsFailure,
    ListEnterpriseCopilotCustomAgentsSuccess,
    ListEnterpriseCostCentersFailure,
    ListEnterpriseCostCentersSuccess,
    ListEnterpriseDependabotAlertsFailure,
    ListEnterpriseDependabotAlertsSuccess,
    ListEnterpriseDependabotRepositoryAccessFailure,
    ListEnterpriseDependabotRepositoryAccessSuccess,
    ListEnterpriseSecretScanningAlertDismissalRequestsFailure,
    ListEnterpriseSecretScanningAlertDismissalRequestsSuccess,
    ListEnterpriseSecretScanningBypassRequestsFailure,
    ListEnterpriseSecretScanningBypassRequestsSuccess,
    ListEnterpriseTeamMembersFailure,
    ListEnterpriseTeamMembersSuccess,
    ListEnterpriseTeamOrganizationAssignmentsFailure,
    ListEnterpriseTeamOrganizationAssignmentsSuccess,
    ListEnterpriseTeamsFailure,
    ListEnterpriseTeamsSuccess,
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
    ListGitignoreTemplatesFailure,
    ListGitignoreTemplatesSuccess,
    ListGlobalSecurityAdvisoriesFailure,
    ListGlobalSecurityAdvisoriesSuccess,
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
    ListIssueCommentReactionsFailure,
    ListIssueCommentReactionsSuccess,
    ListIssueCommentsFailure,
    ListIssueCommentsSuccess,
    ListIssueDependenciesBlockedByFailure,
    ListIssueDependenciesBlockedBySuccess,
    ListIssueDependenciesBlockingFailure,
    ListIssueDependenciesBlockingSuccess,
    ListIssueEventsFailure,
    ListIssueEventsSuccess,
    ListIssueFieldValuesFailure,
    ListIssueFieldValuesSuccess,
    ListIssueLabelsFailure,
    ListIssueLabelsSuccess,
    ListIssueReactionsFailure,
    ListIssueReactionsSuccess,
    ListIssuesFailure,
    ListIssuesSuccess,
    ListIssueSubIssuesFailure,
    ListIssueSubIssuesSuccess,
    ListIssueTimelineEventsFailure,
    ListIssueTimelineEventsSuccess,
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
    ListMilestoneLabelsFailure,
    ListMilestoneLabelsSuccess,
    ListModelsFailure,
    ListModelsSuccess,
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
    ListOrgCopilotCodingAgentRepositoriesFailure,
    ListOrgCopilotCodingAgentRepositoriesSuccess,
    ListOrgCopilotSeatsFailure,
    ListOrgCopilotSeatsSuccess,
    ListOrgCopilotSpaceCollaboratorsFailure,
    ListOrgCopilotSpaceCollaboratorsSuccess,
    ListOrgCopilotSpaceResourcesFailure,
    ListOrgCopilotSpaceResourcesSuccess,
    ListOrgCopilotSpacesFailure,
    ListOrgCopilotSpacesSuccess,
    ListOrgDependabotAlertsFailure,
    ListOrgDependabotAlertsSuccess,
    ListOrgDependabotDismissalRequestsFailure,
    ListOrgDependabotDismissalRequestsSuccess,
    ListOrgDependabotRepositoryAccessFailure,
    ListOrgDependabotRepositoryAccessSuccess,
    ListOrgDependabotSecretsFailure,
    ListOrgDependabotSecretsSuccess,
    ListOrgDockerMigrationConflictsFailure,
    ListOrgDockerMigrationConflictsSuccess,
    ListOrgEventsForAuthenticatedUserFailure,
    ListOrgEventsForAuthenticatedUserSuccess,
    ListOrgExternalGroupsFailure,
    ListOrgExternalGroupsSuccess,
    ListOrgFailedInvitationsFailure,
    ListOrgFailedInvitationsSuccess,
    ListOrgInvitationTeamsFailure,
    ListOrgInvitationTeamsSuccess,
    ListOrgIssueFieldsFailure,
    ListOrgIssueFieldsSuccess,
    ListOrgIssuesFailure,
    ListOrgIssuesSuccess,
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
    ListOrgPackagesFailure,
    ListOrgPackagesSuccess,
    ListOrgPackageVersionsFailure,
    ListOrgPackageVersionsSuccess,
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
    ListOrgPrivateRegistriesFailure,
    ListOrgPrivateRegistriesSuccess,
    ListOrgProjectFieldsFailure,
    ListOrgProjectFieldsSuccess,
    ListOrgProjectItemsFailure,
    ListOrgProjectItemsSuccess,
    ListOrgProjectsFailure,
    ListOrgProjectsSuccess,
    ListOrgProjectViewItemsFailure,
    ListOrgProjectViewItemsSuccess,
    ListOrgReposFailure,
    ListOrgRepositorySecurityAdvisoriesFailure,
    ListOrgRepositorySecurityAdvisoriesSuccess,
    ListOrgReposSuccess,
    ListOrgRolesFailure,
    ListOrgRolesSuccess,
    ListOrgRulesetsFailure,
    ListOrgRulesetsSuccess,
    ListOrgRuleSuitesFailure,
    ListOrgRuleSuitesSuccess,
    ListOrgSecretScanningAlertDismissalRequestsFailure,
    ListOrgSecretScanningAlertDismissalRequestsSuccess,
    ListOrgSecretScanningAlertsFailure,
    ListOrgSecretScanningAlertsSuccess,
    ListOrgSecretScanningBypassRequestsFailure,
    ListOrgSecretScanningBypassRequestsSuccess,
    ListOrgSecretScanningCustomPatternsFailure,
    ListOrgSecretScanningCustomPatternsSuccess,
    ListOrgSecretScanningPatternConfigurationsFailure,
    ListOrgSecretScanningPatternConfigurationsSuccess,
    ListOrgSecurityManagerTeamsFailure,
    ListOrgSecurityManagerTeamsSuccess,
    ListOrgsForAuthenticatedUserFailure,
    ListOrgsForAuthenticatedUserSuccess,
    ListOrgsForUserFailure,
    ListOrgsForUserSuccess,
    ListOrgTeamChildTeamsFailure,
    ListOrgTeamChildTeamsSuccess,
    ListOrgTeamExternalGroupsFailure,
    ListOrgTeamExternalGroupsSuccess,
    ListOrgTeamMembersFailure,
    ListOrgTeamMembersSuccess,
    ListOrgTeamPendingInvitationsFailure,
    ListOrgTeamPendingInvitationsSuccess,
    ListOrgTeamReposFailure,
    ListOrgTeamReposSuccess,
    ListOrgTeamsFailure,
    ListOrgTeamsSuccess,
    ListOrgTeamSyncGroupMappingsFailure,
    ListOrgTeamSyncGroupMappingsSuccess,
    ListOrgTeamSyncIdpGroupsFailure,
    ListOrgTeamSyncIdpGroupsSuccess,
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
    ListPullRequestReviewCommentReactionsFailure,
    ListPullRequestReviewCommentReactionsSuccess,
    ListPullRequestsAssociatedWithCommitFailure,
    ListPullRequestsAssociatedWithCommitSuccess,
    ListReceivedEventsForUserFailure,
    ListReceivedEventsForUserSuccess,
    ListReceivedPublicEventsForUserFailure,
    ListReceivedPublicEventsForUserSuccess,
    ListReleaseReactionsFailure,
    ListReleaseReactionsSuccess,
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
    ListRepoAssigneesFailure,
    ListRepoAssigneesSuccess,
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
    ListRepoCollaboratorsFailure,
    ListRepoCollaboratorsSuccess,
    ListRepoCommitCommentsFailure,
    ListRepoCommitCommentsSuccess,
    ListRepoCommitsFailure,
    ListRepoCommitsSuccess,
    ListRepoContributorsFailure,
    ListRepoContributorsSuccess,
    ListRepoDependabotAlertsFailure,
    ListRepoDependabotAlertsSuccess,
    ListRepoDependabotDismissalRequestsFailure,
    ListRepoDependabotDismissalRequestsSuccess,
    ListRepoDependabotSecretsFailure,
    ListRepoDependabotSecretsSuccess,
    ListRepoDeployKeysFailure,
    ListRepoDeployKeysSuccess,
    ListRepoDeploymentsFailure,
    ListRepoDeploymentsSuccess,
    ListRepoDeploymentStatusesFailure,
    ListRepoDeploymentStatusesSuccess,
    ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsFailure,
    ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsSuccess,
    ListRepoEnvironmentDeploymentBranchPoliciesFailure,
    ListRepoEnvironmentDeploymentBranchPoliciesSuccess,
    ListRepoEnvironmentDeploymentProtectionRulesFailure,
    ListRepoEnvironmentDeploymentProtectionRulesSuccess,
    ListRepoEnvironmentsFailure,
    ListRepoEnvironmentsSuccess,
    ListRepoEventsFailure,
    ListRepoEventsSuccess,
    ListRepoForksFailure,
    ListRepoForksSuccess,
    ListRepoGitMatchingRefsFailure,
    ListRepoGitMatchingRefsSuccess,
    ListRepoInvitationsFailure,
    ListRepoInvitationsSuccess,
    ListRepoIssueCommentsFailure,
    ListRepoIssueCommentsSuccess,
    ListRepoIssueEventsFailure,
    ListRepoIssueEventsSuccess,
    ListRepoIssuesFailure,
    ListRepoIssuesSuccess,
    ListRepoLabelsFailure,
    ListRepoLabelsSuccess,
    ListRepoLanguagesFailure,
    ListRepoLanguagesSuccess,
    ListRepoMilestonesFailure,
    ListRepoMilestonesSuccess,
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
    ListRepoPagesBuildsFailure,
    ListRepoPagesBuildsSuccess,
    ListRepoPullRequestCreationCapBypassListFailure,
    ListRepoPullRequestCreationCapBypassListSuccess,
    ListRepoReleaseAssetsFailure,
    ListRepoReleaseAssetsSuccess,
    ListRepoReleasesFailure,
    ListRepoReleasesSuccess,
    ListRepoRulesetsFailure,
    ListRepoRulesetsSuccess,
    ListRepoRuleSuitesFailure,
    ListRepoRuleSuitesSuccess,
    ListReposAccessibleToInstallationFailure,
    ListReposAccessibleToInstallationSuccess,
    ListRepoSecretScanningAlertDismissalRequestsFailure,
    ListRepoSecretScanningAlertDismissalRequestsSuccess,
    ListRepoSecretScanningAlertsFailure,
    ListRepoSecretScanningAlertsSuccess,
    ListRepoSecretScanningBypassRequestsFailure,
    ListRepoSecretScanningBypassRequestsSuccess,
    ListRepoSecretScanningCustomPatternsFailure,
    ListRepoSecretScanningCustomPatternsSuccess,
    ListRepoSecurityAdvisoriesFailure,
    ListRepoSecurityAdvisoriesSuccess,
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
    ListSecretScanningAlertLocationsFailure,
    ListSecretScanningAlertLocationsSuccess,
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
    ListSelectedReposForOrgDependabotSecretFailure,
    ListSelectedReposForOrgDependabotSecretSuccess,
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
    ListUserAccountIssuesFailure,
    ListUserAccountIssuesSuccess,
    ListUserCodespaceMachinesFailure,
    ListUserCodespaceMachinesSuccess,
    ListUserCodespacesFailure,
    ListUserCodespacesSecretsFailure,
    ListUserCodespacesSecretsSuccess,
    ListUserCodespacesSuccess,
    ListUserCopilotSpaceCollaboratorsFailure,
    ListUserCopilotSpaceCollaboratorsSuccess,
    ListUserCopilotSpaceResourcesFailure,
    ListUserCopilotSpaceResourcesSuccess,
    ListUserCopilotSpacesFailure,
    ListUserCopilotSpacesSuccess,
    ListUserDockerMigrationConflictsFailure,
    ListUserDockerMigrationConflictsSuccess,
    ListUserFollowersFailure,
    ListUserFollowersSuccess,
    ListUserFollowingFailure,
    ListUserFollowingSuccess,
    ListUserGpgKeysFailure,
    ListUserGpgKeysSuccess,
    ListUserPackagesFailure,
    ListUserPackagesSuccess,
    ListUserPackageVersionsFailure,
    ListUserPackageVersionsSuccess,
    ListUserProjectFieldsFailure,
    ListUserProjectFieldsSuccess,
    ListUserProjectItemsFailure,
    ListUserProjectItemsSuccess,
    ListUserProjectsFailure,
    ListUserProjectsSuccess,
    ListUserProjectViewItemsFailure,
    ListUserProjectViewItemsSuccess,
    ListUserPublicKeysFailure,
    ListUserPublicKeysSuccess,
    ListUserReposFailure,
    ListUserRepositoryInvitationsFailure,
    ListUserRepositoryInvitationsSuccess,
    ListUserReposSuccess,
    ListUsersAssignedToOrgRoleFailure,
    ListUsersAssignedToOrgRoleSuccess,
    ListUsersFailure,
    ListUserSocialAccountsFailure,
    ListUserSocialAccountsSuccess,
    ListUserSshSigningKeysFailure,
    ListUserSshSigningKeysSuccess,
    ListUsersSuccess,
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
    LockRepoIssueFailure,
    LockRepoIssueSuccess,
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
    PinIssueCommentFailure,
    PinIssueCommentSuccess,
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
    RemoveAllIssueLabelsFailure,
    RemoveAllIssueLabelsSuccess,
    RemoveAllOrgRolesForTeamFailure,
    RemoveAllOrgRolesForTeamSuccess,
    RemoveAllOrgRolesForUserFailure,
    RemoveAllOrgRolesForUserSuccess,
    RemoveAppAccessRestrictionsFailure,
    RemoveAppAccessRestrictionsSuccess,
    RemoveAuthenticatedUserInteractionLimitsFailure,
    RemoveAuthenticatedUserInteractionLimitsSuccess,
    RemoveCustomLabelFromSelfHostedRunnerForOrgFailure,
    RemoveCustomLabelFromSelfHostedRunnerForOrgSuccess,
    RemoveCustomLabelFromSelfHostedRunnerForRepoFailure,
    RemoveCustomLabelFromSelfHostedRunnerForRepoSuccess,
    RemoveEnterpriseCopilotCodingAgentOrganizationsFailure,
    RemoveEnterpriseCopilotCodingAgentOrganizationsSuccess,
    RemoveEnterpriseTeamMembershipFailure,
    RemoveEnterpriseTeamMembershipSuccess,
    RemoveIssueAssigneesFailure,
    RemoveIssueAssigneesSuccess,
    RemoveIssueDependencyBlockedByFailure,
    RemoveIssueDependencyBlockedBySuccess,
    RemoveIssueLabelFailure,
    RemoveIssueLabelSuccess,
    RemoveIssueSubIssueFailure,
    RemoveIssueSubIssueSuccess,
    RemoveOrgCodespacesAccessUsersFailure,
    RemoveOrgCodespacesAccessUsersSuccess,
    RemoveOrgCopilotSeatsForTeamsFailure,
    RemoveOrgCopilotSeatsForTeamsSuccess,
    RemoveOrgCopilotSeatsForUsersFailure,
    RemoveOrgCopilotSeatsForUsersSuccess,
    RemoveOrgCopilotSpaceCollaboratorFailure,
    RemoveOrgCopilotSpaceCollaboratorSuccess,
    RemoveOrgInteractionLimitsFailure,
    RemoveOrgInteractionLimitsSuccess,
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
    RemoveOrgTeamMembershipForUserFailure,
    RemoveOrgTeamMembershipForUserSuccess,
    RemoveOrgTeamRepoFailure,
    RemoveOrgTeamRepoSuccess,
    RemovePublicOrgMembershipForAuthUserFailure,
    RemovePublicOrgMembershipForAuthUserSuccess,
    RemoveRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    RemoveRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    RemoveRepoCollaboratorFailure,
    RemoveRepoCollaboratorSuccess,
    RemoveRepoFromAppInstallationFailure,
    RemoveRepoFromAppInstallationSuccess,
    RemoveRepoFromUserCodespacesSecretFailure,
    RemoveRepoFromUserCodespacesSecretSuccess,
    RemoveRepoInteractionLimitsFailure,
    RemoveRepoInteractionLimitsSuccess,
    RemoveRepoPullRequestCreationCapBypassUsersFailure,
    RemoveRepoPullRequestCreationCapBypassUsersSuccess,
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
    RemoveSelectedRepoFromOrgDependabotSecretFailure,
    RemoveSelectedRepoFromOrgDependabotSecretSuccess,
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
    RemoveUserCopilotSpaceCollaboratorFailure,
    RemoveUserCopilotSpaceCollaboratorSuccess,
    RenameRepoBranchFailure,
    RenameRepoBranchSuccess,
    RenderMarkdownFailure,
    RenderMarkdownRawFailure,
    RenderMarkdownRawSuccess,
    RenderMarkdownSuccess,
    ReplaceRepoTopicsFailure,
    ReplaceRepoTopicsSuccess,
    ReprioritizeIssueSubIssueFailure,
    ReprioritizeIssueSubIssueSuccess,
    RequestRepoPagesBuildFailure,
    RequestRepoPagesBuildSuccess,
    RequestRepoSecurityAdvisoryCveFailure,
    RequestRepoSecurityAdvisoryCveSuccess,
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
    RestoreAuthenticatedUserPackageFailure,
    RestoreAuthenticatedUserPackageSuccess,
    RestoreAuthenticatedUserPackageVersionFailure,
    RestoreAuthenticatedUserPackageVersionSuccess,
    RestoreOrgPackageFailure,
    RestoreOrgPackageSuccess,
    RestoreOrgPackageVersionFailure,
    RestoreOrgPackageVersionSuccess,
    RestoreUserPackageFailure,
    RestoreUserPackageSuccess,
    RestoreUserPackageVersionFailure,
    RestoreUserPackageVersionSuccess,
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
    ReviewRepoDependabotDismissalRequestFailure,
    ReviewRepoDependabotDismissalRequestSuccess,
    ReviewSecretScanningAlertDismissalRequestFailure,
    ReviewSecretScanningAlertDismissalRequestSuccess,
    ReviewSecretScanningBypassRequestFailure,
    ReviewSecretScanningBypassRequestSuccess,
    RevokeCredentialsFailure,
    RevokeCredentialsSuccess,
    RevokeInstallationAccessTokenFailure,
    RevokeInstallationAccessTokenSuccess,
    SearchCodeFailure,
    SearchCodeSuccess,
    SearchCommitsFailure,
    SearchCommitsSuccess,
    SearchIssuesFailure,
    SearchIssuesSuccess,
    SearchLabelsFailure,
    SearchLabelsSuccess,
    SearchRepositoriesFailure,
    SearchRepositoriesSuccess,
    SearchTopicsFailure,
    SearchTopicsSuccess,
    SearchUsersFailure,
    SearchUsersSuccess,
    SetAdminBranchProtectionFailure,
    SetAdminBranchProtectionSuccess,
    SetAllowedActionsOrganizationFailure,
    SetAllowedActionsOrganizationSuccess,
    SetAllowedActionsRepositoryFailure,
    SetAllowedActionsRepositorySuccess,
    SetAppAccessRestrictionsFailure,
    SetAppAccessRestrictionsSuccess,
    SetAuthenticatedUserEmailVisibilityFailure,
    SetAuthenticatedUserEmailVisibilitySuccess,
    SetAuthenticatedUserInteractionLimitsFailure,
    SetAuthenticatedUserInteractionLimitsSuccess,
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
    SetEnterpriseCopilotCodingAgentPolicyFailure,
    SetEnterpriseCopilotCodingAgentPolicySuccess,
    SetEnterpriseCopilotCustomAgentsSourceFailure,
    SetEnterpriseCopilotCustomAgentsSourceSuccess,
    SetEnterpriseDependabotRepositoryAccessDefaultLevelFailure,
    SetEnterpriseDependabotRepositoryAccessDefaultLevelSuccess,
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
    SetIssueFieldValuesFailure,
    SetIssueFieldValuesSuccess,
    SetIssueLabelsFailure,
    SetIssueLabelsSuccess,
    SetOrgClusterDeploymentRecordsFailure,
    SetOrgClusterDeploymentRecordsSuccess,
    SetOrgCodeSecurityConfigurationAsDefaultFailure,
    SetOrgCodeSecurityConfigurationAsDefaultSuccess,
    SetOrgCodespacesAccessFailure,
    SetOrgCodespacesAccessSuccess,
    SetOrgCopilotCodingAgentPermissionsFailure,
    SetOrgCopilotCodingAgentPermissionsSuccess,
    SetOrgCopilotCodingAgentRepositoriesFailure,
    SetOrgCopilotCodingAgentRepositoriesSuccess,
    SetOrgCopilotContentExclusionFailure,
    SetOrgCopilotContentExclusionSuccess,
    SetOrgCopilotSpaceCollaboratorRoleFailure,
    SetOrgCopilotSpaceCollaboratorRoleSuccess,
    SetOrgCopilotSpaceFailure,
    SetOrgCopilotSpaceResourceFailure,
    SetOrgCopilotSpaceResourceSuccess,
    SetOrgCopilotSpaceSuccess,
    SetOrgDependabotRepositoryAccessDefaultLevelFailure,
    SetOrgDependabotRepositoryAccessDefaultLevelSuccess,
    SetOrgImmutableReleasesSettingsFailure,
    SetOrgImmutableReleasesSettingsSuccess,
    SetOrgInteractionLimitsFailure,
    SetOrgInteractionLimitsSuccess,
    SetOrgMembershipForUserFailure,
    SetOrgMembershipForUserSuccess,
    SetPublicOrgMembershipForAuthUserFailure,
    SetPublicOrgMembershipForAuthUserSuccess,
    SetRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    SetRepoAccessToSelfHostedRunnerGroupInOrgSuccess,
    SetRepoInteractionLimitsFailure,
    SetRepoInteractionLimitsSuccess,
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
    SetSelectedReposForOrgDependabotSecretFailure,
    SetSelectedReposForOrgDependabotSecretSuccess,
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
    SetUserCopilotSpaceCollaboratorRoleFailure,
    SetUserCopilotSpaceCollaboratorRoleSuccess,
    SetUserCopilotSpaceFailure,
    SetUserCopilotSpaceResourceFailure,
    SetUserCopilotSpaceResourceSuccess,
    SetUserCopilotSpaceSuccess,
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
    UnblockUserFailure,
    UnblockUserSuccess,
    UnfollowUserFailure,
    UnfollowUserSuccess,
    UnlockRepoIssueFailure,
    UnlockRepoIssueSuccess,
    UnpinIssueCommentFailure,
    UnpinIssueCommentSuccess,
    UnstarRepoForAuthenticatedUserFailure,
    UnstarRepoForAuthenticatedUserSuccess,
    UnsuspendAppInstallationFailure,
    UnsuspendAppInstallationSuccess,
    UpdateAppWebhookConfigFailure,
    UpdateAppWebhookConfigSuccess,
    UpdateAuthenticatedUserFailure,
    UpdateAuthenticatedUserSuccess,
    UpdateCheckRunFailure,
    UpdateCheckRunSuccess,
    UpdateCodeScanningAlertFailure,
    UpdateCodeScanningAlertSuccess,
    UpdateCodeScanningDefaultSetupFailure,
    UpdateCodeScanningDefaultSetupSuccess,
    UpdateCommitCommentFailure,
    UpdateCommitCommentSuccess,
    UpdateEnterpriseCodeSecurityConfigurationFailure,
    UpdateEnterpriseCodeSecurityConfigurationSuccess,
    UpdateEnterpriseCostCenterFailure,
    UpdateEnterpriseCostCenterSuccess,
    UpdateEnterpriseDependabotRepositoryAccessFailure,
    UpdateEnterpriseDependabotRepositoryAccessSuccess,
    UpdateEnterpriseTeamFailure,
    UpdateEnterpriseTeamSuccess,
    UpdateEnvironmentActionsVariableFailure,
    UpdateEnvironmentActionsVariableSuccess,
    UpdateHostedRunnerForOrgFailure,
    UpdateHostedRunnerForOrgSuccess,
    UpdateIssueCommentFailure,
    UpdateIssueCommentSuccess,
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
    UpdateOrgDependabotRepositoryAccessFailure,
    UpdateOrgDependabotRepositoryAccessSuccess,
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
    UpdateOrgPrivateRegistryFailure,
    UpdateOrgPrivateRegistrySuccess,
    UpdateOrgProjectItemFailure,
    UpdateOrgProjectItemSuccess,
    UpdateOrgRulesetFailure,
    UpdateOrgRulesetSuccess,
    UpdateOrgSecretScanningCustomPatternFailure,
    UpdateOrgSecretScanningCustomPatternSuccess,
    UpdateOrgSecretScanningPatternConfigurationsFailure,
    UpdateOrgSecretScanningPatternConfigurationsSuccess,
    UpdateOrgSuccess,
    UpdateOrgTeamExternalGroupsFailure,
    UpdateOrgTeamExternalGroupsSuccess,
    UpdateOrgTeamFailure,
    UpdateOrgTeamSuccess,
    UpdateOrgTeamSyncGroupMappingsFailure,
    UpdateOrgTeamSyncGroupMappingsSuccess,
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
    UpdateRepoDependabotAlertFailure,
    UpdateRepoDependabotAlertSuccess,
    UpdateRepoEnvironmentDeploymentBranchPolicyFailure,
    UpdateRepoEnvironmentDeploymentBranchPolicySuccess,
    UpdateRepoFailure,
    UpdateRepoGitRefFailure,
    UpdateRepoGitRefSuccess,
    UpdateRepoInvitationFailure,
    UpdateRepoInvitationSuccess,
    UpdateRepoIssueFailure,
    UpdateRepoIssueSuccess,
    UpdateRepoLabelFailure,
    UpdateRepoLabelSuccess,
    UpdateRepoMilestoneFailure,
    UpdateRepoMilestoneSuccess,
    UpdateRepoPagesSiteFailure,
    UpdateRepoPagesSiteSuccess,
    UpdateRepoPullRequestCreationCapFailure,
    UpdateRepoPullRequestCreationCapSuccess,
    UpdateRepoReleaseAssetFailure,
    UpdateRepoReleaseAssetSuccess,
    UpdateRepoReleaseFailure,
    UpdateRepoReleaseSuccess,
    UpdateRepoRulesetFailure,
    UpdateRepoRulesetSuccess,
    UpdateRepoSecretScanningCustomPatternFailure,
    UpdateRepoSecretScanningCustomPatternSuccess,
    UpdateRepoSecurityAdvisoryFailure,
    UpdateRepoSecurityAdvisorySuccess,
    UpdateRepoSuccess,
    UpdateRepoWebhookConfigFailure,
    UpdateRepoWebhookConfigSuccess,
    UpdateRepoWebhookFailure,
    UpdateRepoWebhookSuccess,
    UpdateSecretScanningAlertFailure,
    UpdateSecretScanningAlertSuccess,
    UpdateSelfHostedRunnerGroupForOrgFailure,
    UpdateSelfHostedRunnerGroupForOrgSuccess,
    UpdateStatusCheckProtectionFailure,
    UpdateStatusCheckProtectionSuccess,
    UpdateUserCodespaceFailure,
    UpdateUserCodespaceSuccess,
    UpdateUserProjectItemFailure,
    UpdateUserProjectItemSuccess,
    UploadCodeScanningSarifFailure,
    UploadCodeScanningSarifSuccess,
    UploadRepoReleaseAssetFailure,
    UploadRepoReleaseAssetSuccess,
} from "../types.js";

export function textAndData(
    payload:
        | AddOrUpdateOrgTeamMembershipForUserFailure
        | AddOrUpdateOrgTeamMembershipForUserSuccess
        | AddOrUpdateOrgTeamRepoPermissionsFailure
        | AddOrUpdateOrgTeamRepoPermissionsSuccess
        | BulkListOrgAttestationsSuccess
        | BulkListOrgAttestationsFailure
        | BlockOrgUserSuccess
        | BlockOrgUserFailure
        | CheckDependabotSecurityUpdatesSuccess
        | CheckDependabotSecurityUpdatesFailure
        | CheckOrgTeamRepoPermissionsFailure
        | CheckOrgTeamRepoPermissionsSuccess
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
        | CreateOrgTeamFailure
        | CreateOrgTeamSuccess
        | DeleteOrgTeamExternalGroupsFailure
        | DeleteOrgTeamExternalGroupsSuccess
        | DeleteOrgTeamFailure
        | DeleteOrgTeamSuccess
        | GetOrgExternalGroupFailure
        | GetOrgExternalGroupSuccess
        | GetOrgTeamFailure
        | GetOrgTeamMembershipForUserFailure
        | GetOrgTeamMembershipForUserSuccess
        | GetOrgTeamSuccess
        | ListAuthenticatedUserTeamsFailure
        | ListAuthenticatedUserTeamsSuccess
        | ListOrgExternalGroupsFailure
        | ListOrgExternalGroupsSuccess
        | ListOrgTeamChildTeamsFailure
        | ListOrgTeamChildTeamsSuccess
        | ListOrgTeamExternalGroupsFailure
        | ListOrgTeamExternalGroupsSuccess
        | ListOrgTeamMembersFailure
        | ListOrgTeamMembersSuccess
        | ListOrgTeamPendingInvitationsFailure
        | ListOrgTeamPendingInvitationsSuccess
        | ListOrgTeamReposFailure
        | ListOrgTeamReposSuccess
        | ListOrgTeamsFailure
        | ListOrgTeamsSuccess
        | ListOrgTeamSyncGroupMappingsFailure
        | ListOrgTeamSyncGroupMappingsSuccess
        | ListOrgTeamSyncIdpGroupsFailure
        | ListOrgTeamSyncIdpGroupsSuccess
        | RemoveOrgMemberSuccess
        | RemoveOrgMemberFailure
        | RemoveOrgMembershipForUserSuccess
        | RemoveOrgMembershipForUserFailure
        | RemoveOrgTeamMembershipForUserFailure
        | RemoveOrgTeamMembershipForUserSuccess
        | RemoveOrgTeamRepoFailure
        | RemoveOrgTeamRepoSuccess
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
        | UpdateOrgTeamExternalGroupsFailure
        | UpdateOrgTeamExternalGroupsSuccess
        | UpdateOrgTeamFailure
        | UpdateOrgTeamSuccess
        | UpdateOrgTeamSyncGroupMappingsFailure
        | UpdateOrgTeamSyncGroupMappingsSuccess
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
        | ListOrgPrivateRegistriesSuccess
        | ListOrgPrivateRegistriesFailure
        | CreateOrgPrivateRegistrySuccess
        | CreateOrgPrivateRegistryFailure
        | GetOrgPrivateRegistriesPublicKeySuccess
        | GetOrgPrivateRegistriesPublicKeyFailure
        | GetOrgPrivateRegistrySuccess
        | GetOrgPrivateRegistryFailure
        | UpdateOrgPrivateRegistrySuccess
        | UpdateOrgPrivateRegistryFailure
        | DeleteOrgPrivateRegistrySuccess
        | DeleteOrgPrivateRegistryFailure
        | CreateOrgProjectDraftItemSuccess
        | CreateOrgProjectDraftItemFailure
        | CreateUserProjectDraftItemSuccess
        | CreateUserProjectDraftItemFailure
        | ListOrgProjectFieldsSuccess
        | ListOrgProjectFieldsFailure
        | ListUserProjectFieldsSuccess
        | ListUserProjectFieldsFailure
        | GetOrgProjectFieldSuccess
        | GetOrgProjectFieldFailure
        | GetUserProjectFieldSuccess
        | GetUserProjectFieldFailure
        | CreateOrgProjectFieldSuccess
        | CreateOrgProjectFieldFailure
        | CreateUserProjectFieldSuccess
        | CreateUserProjectFieldFailure
        | ListOrgProjectItemsSuccess
        | ListOrgProjectItemsFailure
        | ListUserProjectItemsSuccess
        | ListUserProjectItemsFailure
        | ListOrgProjectViewItemsSuccess
        | ListOrgProjectViewItemsFailure
        | ListUserProjectViewItemsSuccess
        | ListUserProjectViewItemsFailure
        | GetOrgProjectItemSuccess
        | GetOrgProjectItemFailure
        | GetUserProjectItemSuccess
        | GetUserProjectItemFailure
        | AddOrgProjectItemSuccess
        | AddOrgProjectItemFailure
        | AddUserProjectItemSuccess
        | AddUserProjectItemFailure
        | UpdateOrgProjectItemSuccess
        | UpdateOrgProjectItemFailure
        | UpdateUserProjectItemSuccess
        | UpdateUserProjectItemFailure
        | DeleteOrgProjectItemSuccess
        | DeleteOrgProjectItemFailure
        | DeleteUserProjectItemSuccess
        | DeleteUserProjectItemFailure
        | ListOrgProjectsSuccess
        | ListOrgProjectsFailure
        | ListUserProjectsSuccess
        | ListUserProjectsFailure
        | GetOrgProjectSuccess
        | GetOrgProjectFailure
        | GetUserProjectSuccess
        | GetUserProjectFailure
        | CreateOrgProjectViewSuccess
        | CreateOrgProjectViewFailure
        | CreateUserProjectViewSuccess
        | CreateUserProjectViewFailure
        | GetRateLimitSuccess
        | GetRateLimitFailure
        | ListCommitCommentReactionsSuccess
        | ListCommitCommentReactionsFailure
        | CreateCommitCommentReactionSuccess
        | CreateCommitCommentReactionFailure
        | DeleteCommitCommentReactionSuccess
        | DeleteCommitCommentReactionFailure
        | ListIssueCommentReactionsSuccess
        | ListIssueCommentReactionsFailure
        | CreateIssueCommentReactionSuccess
        | CreateIssueCommentReactionFailure
        | DeleteIssueCommentReactionSuccess
        | DeleteIssueCommentReactionFailure
        | ListIssueReactionsSuccess
        | ListIssueReactionsFailure
        | CreateIssueReactionSuccess
        | CreateIssueReactionFailure
        | DeleteIssueReactionSuccess
        | DeleteIssueReactionFailure
        | ListPullRequestReviewCommentReactionsSuccess
        | ListPullRequestReviewCommentReactionsFailure
        | CreatePullRequestReviewCommentReactionSuccess
        | CreatePullRequestReviewCommentReactionFailure
        | DeletePullRequestReviewCommentReactionSuccess
        | DeletePullRequestReviewCommentReactionFailure
        | ListReleaseReactionsSuccess
        | ListReleaseReactionsFailure
        | CreateReleaseReactionSuccess
        | CreateReleaseReactionFailure
        | DeleteReleaseReactionSuccess
        | DeleteReleaseReactionFailure
        | ListRepoReleasesSuccess
        | ListRepoReleasesFailure
        | CreateRepoReleaseSuccess
        | CreateRepoReleaseFailure
        | GenerateRepoReleaseNotesSuccess
        | GenerateRepoReleaseNotesFailure
        | GetLatestRepoReleaseSuccess
        | GetLatestRepoReleaseFailure
        | GetRepoReleaseByTagSuccess
        | GetRepoReleaseByTagFailure
        | GetRepoReleaseSuccess
        | GetRepoReleaseFailure
        | UpdateRepoReleaseSuccess
        | UpdateRepoReleaseFailure
        | DeleteRepoReleaseSuccess
        | DeleteRepoReleaseFailure
        | ListRepoReleaseAssetsSuccess
        | ListRepoReleaseAssetsFailure
        | GetRepoReleaseAssetSuccess
        | GetRepoReleaseAssetFailure
        | UpdateRepoReleaseAssetSuccess
        | UpdateRepoReleaseAssetFailure
        | DeleteRepoReleaseAssetSuccess
        | DeleteRepoReleaseAssetFailure
        | UploadRepoReleaseAssetSuccess
        | UploadRepoReleaseAssetFailure
        | SearchCodeSuccess
        | SearchCodeFailure
        | SearchCommitsSuccess
        | SearchCommitsFailure
        | SearchIssuesSuccess
        | SearchIssuesFailure
        | SearchLabelsSuccess
        | SearchLabelsFailure
        | SearchRepositoriesSuccess
        | SearchRepositoriesFailure
        | SearchTopicsSuccess
        | SearchTopicsFailure
        | SearchUsersSuccess
        | SearchUsersFailure
        | ListOrgSecretScanningAlertsSuccess
        | ListOrgSecretScanningAlertsFailure
        | ListRepoSecretScanningAlertsSuccess
        | ListRepoSecretScanningAlertsFailure
        | GetSecretScanningAlertSuccess
        | GetSecretScanningAlertFailure
        | UpdateSecretScanningAlertSuccess
        | UpdateSecretScanningAlertFailure
        | ListSecretScanningAlertLocationsSuccess
        | ListSecretScanningAlertLocationsFailure
        | CreateSecretScanningPushProtectionBypassSuccess
        | CreateSecretScanningPushProtectionBypassFailure
        | GetRepoSecretScanningScanHistorySuccess
        | GetRepoSecretScanningScanHistoryFailure
        | ListOrgSecretScanningCustomPatternsSuccess
        | ListOrgSecretScanningCustomPatternsFailure
        | CreateOrgSecretScanningCustomPatternsSuccess
        | CreateOrgSecretScanningCustomPatternsFailure
        | DeleteOrgSecretScanningCustomPatternsSuccess
        | DeleteOrgSecretScanningCustomPatternsFailure
        | UpdateOrgSecretScanningCustomPatternSuccess
        | UpdateOrgSecretScanningCustomPatternFailure
        | ListRepoSecretScanningCustomPatternsSuccess
        | ListRepoSecretScanningCustomPatternsFailure
        | CreateRepoSecretScanningCustomPatternsSuccess
        | CreateRepoSecretScanningCustomPatternsFailure
        | DeleteRepoSecretScanningCustomPatternsSuccess
        | DeleteRepoSecretScanningCustomPatternsFailure
        | UpdateRepoSecretScanningCustomPatternSuccess
        | UpdateRepoSecretScanningCustomPatternFailure
        | ListOrgSecretScanningPatternConfigurationsSuccess
        | ListOrgSecretScanningPatternConfigurationsFailure
        | UpdateOrgSecretScanningPatternConfigurationsSuccess
        | UpdateOrgSecretScanningPatternConfigurationsFailure
        | ListEnterpriseSecretScanningAlertDismissalRequestsSuccess
        | ListEnterpriseSecretScanningAlertDismissalRequestsFailure
        | ListOrgSecretScanningAlertDismissalRequestsSuccess
        | ListOrgSecretScanningAlertDismissalRequestsFailure
        | ListRepoSecretScanningAlertDismissalRequestsSuccess
        | ListRepoSecretScanningAlertDismissalRequestsFailure
        | GetSecretScanningAlertDismissalRequestSuccess
        | GetSecretScanningAlertDismissalRequestFailure
        | ReviewSecretScanningAlertDismissalRequestSuccess
        | ReviewSecretScanningAlertDismissalRequestFailure
        | ListEnterpriseSecretScanningBypassRequestsSuccess
        | ListEnterpriseSecretScanningBypassRequestsFailure
        | ListOrgSecretScanningBypassRequestsSuccess
        | ListOrgSecretScanningBypassRequestsFailure
        | ListRepoSecretScanningBypassRequestsSuccess
        | ListRepoSecretScanningBypassRequestsFailure
        | GetSecretScanningBypassRequestSuccess
        | GetSecretScanningBypassRequestFailure
        | ReviewSecretScanningBypassRequestSuccess
        | ReviewSecretScanningBypassRequestFailure
        | DismissSecretScanningBypassResponseSuccess
        | DismissSecretScanningBypassResponseFailure
        | ListGlobalSecurityAdvisoriesSuccess
        | ListGlobalSecurityAdvisoriesFailure
        | GetGlobalSecurityAdvisorySuccess
        | GetGlobalSecurityAdvisoryFailure
        | ListOrgRepositorySecurityAdvisoriesSuccess
        | ListOrgRepositorySecurityAdvisoriesFailure
        | ListRepoSecurityAdvisoriesSuccess
        | ListRepoSecurityAdvisoriesFailure
        | CreateRepoSecurityAdvisorySuccess
        | CreateRepoSecurityAdvisoryFailure
        | CreatePrivateVulnerabilityReportSuccess
        | CreatePrivateVulnerabilityReportFailure
        | GetRepoSecurityAdvisorySuccess
        | GetRepoSecurityAdvisoryFailure
        | UpdateRepoSecurityAdvisorySuccess
        | UpdateRepoSecurityAdvisoryFailure
        | RequestRepoSecurityAdvisoryCveSuccess
        | RequestRepoSecurityAdvisoryCveFailure
        | CreateRepoSecurityAdvisoryTemporaryForkSuccess
        | CreateRepoSecurityAdvisoryTemporaryForkFailure
        | GetAuthenticatedUserFailure
        | GetAuthenticatedUserSuccess
        | UpdateAuthenticatedUserFailure
        | UpdateAuthenticatedUserSuccess
        | GetUserByIdFailure
        | GetUserByIdSuccess
        | ListUsersFailure
        | ListUsersSuccess
        | GetUserFailure
        | GetUserSuccess
        | GetUserHovercardFailure
        | GetUserHovercardSuccess
        | BlockUserFailure
        | BlockUserSuccess
        | CheckUserBlockedFailure
        | CheckUserBlockedSuccess
        | ListBlockedUsersFailure
        | ListBlockedUsersSuccess
        | UnblockUserFailure
        | UnblockUserSuccess
        | AddAuthenticatedUserEmailsFailure
        | AddAuthenticatedUserEmailsSuccess
        | DeleteAuthenticatedUserEmailsFailure
        | DeleteAuthenticatedUserEmailsSuccess
        | ListAuthenticatedUserEmailsFailure
        | ListAuthenticatedUserEmailsSuccess
        | ListAuthenticatedUserPublicEmailsFailure
        | ListAuthenticatedUserPublicEmailsSuccess
        | SetAuthenticatedUserEmailVisibilityFailure
        | SetAuthenticatedUserEmailVisibilitySuccess
        | CheckAuthenticatedUserFollowsUserFailure
        | CheckAuthenticatedUserFollowsUserSuccess
        | CheckUserFollowsUserFailure
        | CheckUserFollowsUserSuccess
        | FollowUserFailure
        | FollowUserSuccess
        | ListAuthenticatedUserFollowersFailure
        | ListAuthenticatedUserFollowersSuccess
        | ListAuthenticatedUserFollowingFailure
        | ListAuthenticatedUserFollowingSuccess
        | ListUserFollowersFailure
        | ListUserFollowersSuccess
        | ListUserFollowingFailure
        | ListUserFollowingSuccess
        | UnfollowUserFailure
        | UnfollowUserSuccess
        | CreateAuthenticatedUserGpgKeyFailure
        | CreateAuthenticatedUserGpgKeySuccess
        | DeleteAuthenticatedUserGpgKeyFailure
        | DeleteAuthenticatedUserGpgKeySuccess
        | GetAuthenticatedUserGpgKeyFailure
        | GetAuthenticatedUserGpgKeySuccess
        | ListAuthenticatedUserGpgKeysFailure
        | ListAuthenticatedUserGpgKeysSuccess
        | ListUserGpgKeysFailure
        | ListUserGpgKeysSuccess
        | CreateAuthenticatedUserPublicSshKeyFailure
        | CreateAuthenticatedUserPublicSshKeySuccess
        | DeleteAuthenticatedUserPublicSshKeyFailure
        | DeleteAuthenticatedUserPublicSshKeySuccess
        | GetAuthenticatedUserPublicSshKeyFailure
        | GetAuthenticatedUserPublicSshKeySuccess
        | ListAuthenticatedUserPublicSshKeysFailure
        | ListAuthenticatedUserPublicSshKeysSuccess
        | ListUserPublicKeysFailure
        | ListUserPublicKeysSuccess
        | AddAuthenticatedUserSocialAccountsFailure
        | AddAuthenticatedUserSocialAccountsSuccess
        | DeleteAuthenticatedUserSocialAccountsFailure
        | DeleteAuthenticatedUserSocialAccountsSuccess
        | ListAuthenticatedUserSocialAccountsFailure
        | ListAuthenticatedUserSocialAccountsSuccess
        | ListUserSocialAccountsFailure
        | ListUserSocialAccountsSuccess
        | CreateAuthenticatedUserSshSigningKeyFailure
        | CreateAuthenticatedUserSshSigningKeySuccess
        | DeleteAuthenticatedUserSshSigningKeyFailure
        | DeleteAuthenticatedUserSshSigningKeySuccess
        | GetAuthenticatedUserSshSigningKeyFailure
        | GetAuthenticatedUserSshSigningKeySuccess
        | ListAuthenticatedUserSshSigningKeysFailure
        | ListAuthenticatedUserSshSigningKeysSuccess
        | ListUserSshSigningKeysFailure
        | ListUserSshSigningKeysSuccess
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
