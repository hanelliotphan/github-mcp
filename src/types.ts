import type {
    GitHubCursorQueryLinkPagination,
    GitHubLinkPagination,
    GitHubPageLinkPagination,
    GitHubSinceLinkPagination
} from "./utils/parse-github-link-header.js";

export type ErrorType =
    | "auth_error"
    | "permission_error"
    | "validation_error"
    | "not_found"
    | "rate_limit_error"
    | "github_api_error"
    | "unknown_error";

export type ErrorEnvelope = {
    status_code: number;
    error_type: ErrorType;
    message: string;
    hint?: string;
    retryable: boolean;
};

export type CreateRepoSuccess = {
    success: true;
    message: string;
    repo: {
        name: string;
        full_name: string;
        private: boolean;
        html_url: string;
        clone_url: string;
        default_branch: string;
    } | null;
    request_id: string | null;
    dry_run?: boolean;
    planned_request?: Record<string, unknown>;
};

export type CreateRepoFailure = {
    success: false;
    error: ErrorEnvelope;
    request_id: string | null;
};

export type DeleteRepoSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
    dry_run?: boolean;
    planned_request?: Record<string, unknown>;
};

/** Same shape as create-repo failures; reused for all tools. */
export type DeleteRepoFailure = CreateRepoFailure;

/** Normalized subset of GET /repos/{owner}/{repo} for MCP responses. */
export type RepoInfo = {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    visibility: string | null;
    html_url: string;
    clone_url: string;
    ssh_url: string | null;
    default_branch: string | null;
    created_at: string | null;
    updated_at: string | null;
    pushed_at: string | null;
    homepage: string | null;
    fork: boolean;
    archived: boolean;
    disabled: boolean;
    language: string | null;
    forks_count: number;
    stargazers_count: number;
    open_issues_count: number;
    topics: string[];
    owner: {
        login: string;
        type: string | null;
    };
    license: { spdx_id: string | null; name: string | null } | null;
    permissions: { admin: boolean; push: boolean; pull: boolean } | null;
};

export type GetRepoSuccess = {
    success: true;
    message: string;
    repo: RepoInfo;
    request_id: string | null;
};

export type GetRepoFailure = CreateRepoFailure;

/** One row in a directory listing from GET /repos/{owner}/{repo}/contents/{path}. */
export type RepoContentListEntry = {
    type: string;
    size: number;
    name: string;
    path: string;
    sha: string;
    url: string;
    git_url: string | null;
    html_url: string | null;
    download_url: string | null;
    _links: { git: string | null; html: string | null; self: string };
};

/**
 * Single file, symlink, or submodule from GET /repos/{owner}/{repo}/contents/{path}.
 * Files include base64 `content` when size ≤ 1 MB and default JSON media type is used.
 */
export type RepoContentBlob = {
    type: string;
    size: number;
    name: string;
    path: string;
    sha: string;
    url: string;
    git_url: string | null;
    html_url: string | null;
    download_url: string | null;
    encoding?: string;
    content?: string;
    /**
     * When the tool is called with `decode_content: true`: UTF-8 string decoded from base64 `content`.
     * `null` when decoding was requested but the payload is not a base64 file body (e.g. missing `content`, `encoding` not `base64`, or symlink/submodule).
     */
    decoded_content?: string | null;
    target?: string;
    submodule_git_url?: string;
    _links: { git: string | null; html: string | null; self: string };
};

export type GetRepoContentSuccess = {
    success: true;
    message: string;
    /** Echo of whether UTF-8 decoding from base64 was applied (after normalizing the request value). */
    decode_content: boolean;
    /**
     * Directory: array of entries (GitHub caps directory listings at 1,000 items—use Git Trees API beyond that).
     * File/symlink/submodule: a single object.
     */
    data: RepoContentListEntry[] | RepoContentBlob;
    request_id: string | null;
};

export type GetRepoContentFailure = CreateRepoFailure;

/** Response from GET /repos/{owner}/{repo}/readme (preferred README file metadata and base64 body). */
export type GetRepoReadmeSuccess = {
    success: true;
    message: string;
    decode_content: boolean;
    data: RepoContentBlob;
    request_id: string | null;
};

export type GetRepoReadmeFailure = CreateRepoFailure;

/** Response from GET /repos/{owner}/{repo}/tarball/{ref} (302 redirect to tar.gz archive; URL returned, not file bytes). */
export type DownloadRepoArchiveTarSuccess = {
    success: true;
    message: string;
    /** GitHub returns 302 Found with a Location URL to the .tar.gz archive. */
    http_status: number;
    /** Value of the Location header: temporary URL to download the archive (e.g. with curl -L). */
    archive_download_url: string;
    /** Echo of the ref used in the request (branch, tag, or commit SHA). */
    ref: string;
    request_id: string | null;
};

export type DownloadRepoArchiveTarFailure = CreateRepoFailure;

/** Response from GET /repos/{owner}/{repo}/zipball/{ref} (302 redirect to zip; URL returned, not file bytes). */
export type DownloadRepoArchiveZipSuccess = {
    success: true;
    message: string;
    /** GitHub returns 302 Found with a Location URL to the .zip archive. */
    http_status: number;
    /** Value of the Location header: temporary URL to download the archive (e.g. with curl -L). */
    archive_download_url: string;
    /** Echo of the ref used in the request (branch, tag, or commit SHA). */
    ref: string;
    request_id: string | null;
};

export type DownloadRepoArchiveZipFailure = CreateRepoFailure;

/** Payload shape from PUT /repos/{owner}/{repo}/contents/{path} (`file-commit`). */
export type FileCommitApiResult = {
    content: Record<string, unknown> | null;
    commit: Record<string, unknown>;
};

export type CreateUpdateFileContentsSuccess = {
    success: true;
    message: string;
    /** 201 when the file was created, 200 when updated (per GitHub). */
    http_status: number;
    result: FileCommitApiResult;
    request_id: string | null;
};

export type CreateUpdateFileContentsFailure = CreateRepoFailure;

export type DeleteFileSuccess = {
    success: true;
    message: string;
    /** Typically 200 on success (per GitHub). */
    http_status: number;
    result: FileCommitApiResult;
    request_id: string | null;
};

export type DeleteFileFailure = CreateRepoFailure;

export type UpdateRepoSuccess = {
    success: true;
    message: string;
    /** Full metadata after update; null when `dry_run` is true. */
    repo: RepoInfo | null;
    request_id: string | null;
    dry_run?: boolean;
    planned_request?: Record<string, unknown>;
};

export type UpdateRepoFailure = CreateRepoFailure;

export type TransferRepoSuccess = {
    success: true;
    message: string;
    /** Destination login passed in the request. */
    new_owner: string;
    /** Repository payload from the 202 response; null when `dry_run` is true. */
    repo: RepoInfo | null;
    /** HTTP status from GitHub (202 on success); null on dry run. */
    http_status: number | null;
    request_id: string | null;
    dry_run?: boolean;
    planned_request?: Record<string, unknown>;
};

export type TransferRepoFailure = CreateRepoFailure;

/** One entry from GET /repos/{owner}/{repo}/activity. */
export type RepoActivityItem = {
    id: number;
    node_id: string;
    before: string;
    after: string;
    ref: string;
    timestamp: string;
    activity_type: string;
    actor: {
        login: string;
        id?: number;
        type?: string | null;
    } | null;
};

export type ListRepoActivitiesSuccess = {
    success: true;
    message: string;
    activities: RepoActivityItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.after` / `next.before` to continue.
     */
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    /** Effective `per_page` for this call (default **100** when omitted). */
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoActivitiesFailure = CreateRepoFailure;

/** One entry from GET /repos/{owner}/{repo}/attestations/{subject_digest}. */
export type RepoAttestationListItem = {
    repository_id: number | null;
    bundle_url: string | null;
    initiator: string | null;
    /** Sigstore bundle when returned in the list payload. */
    bundle: Record<string, unknown> | null;
};

/** GET /repos/{owner}/{repo}/attestations/{subject_digest} — list attestations for a subject digest. */
export type ListRepoAttestationsSuccess = {
    success: true;
    message: string;
    /** Subject digest used for this request. */
    subject_digest: string;
    attestations: RepoAttestationListItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.after` / `next.before` to continue.
     */
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    /** Effective `per_page` for this call (default **100** when omitted, GitHub max **100**). */
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoAttestationsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/automated-security-fixes (Dependabot security updates). */
export type CheckDependabotSecurityUpdatesSuccess = {
    success: true;
    message: string;
    /** From API body when status is 200; false when GitHub returns 404 (updates not enabled for the repo). */
    enabled: boolean;
    /** From API when enabled; false when not enabled or on 404. */
    paused: boolean;
    request_id: string | null;
};

export type CheckDependabotSecurityUpdatesFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/private-vulnerability-reporting */
export type CheckPrivateVulnerabilityReportingSuccess =
    | {
          success: true;
          outcome: "retrieved";
          message: string;
          enabled: boolean;
          request_id: string | null;
      }
    | {
          success: true;
          outcome: "not_available";
          message: string;
          /** GitHub returned 404; this endpoint did not return a body (e.g. private repo, plan, or policy—not the same as enabled: false). */
          request_id: string | null;
      };

export type CheckPrivateVulnerabilityReportingFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/immutable-releases */
export type CheckImmutableReleasesSuccess = {
    success: true;
    message: string;
    /** From API body when status is 200; false when GitHub returns 404 (not enabled for the repo). */
    enabled: boolean;
    /** From API when enabled is true; false when immutable releases are off or on 404. */
    enforced_by_owner: boolean;
    request_id: string | null;
};

export type CheckImmutableReleasesFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/immutable-releases — enable immutable releases (204 No Content). */
export type EnableImmutableReleasesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type EnableImmutableReleasesFailure = CreateRepoFailure;

/** PUT /orgs/{org}/settings/immutable-releases/repositories/{repository_id} — add repo to selected enforcement (204). */
export type EnableImmutableReleasesForOrgRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    repository_id: number;
    request_id: string | null;
};

export type EnableImmutableReleasesForOrgRepoFailure = CreateRepoFailure;

/** POST /orgs/{org}/{security_product}/{enablement} — org-wide security product enablement (typically 204). */
export type EnableOrDisableOrgSecurityFeatureSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    security_product: string;
    enablement: string;
    query_suite?: string;
    request_id: string | null;
};

export type EnableOrDisableOrgSecurityFeatureFailure = CreateRepoFailure;

/** One row in `deployment_records` from org artifact metadata deployment APIs. */
export type ArtifactDeploymentRecordRow = Record<string, unknown>;

/** POST /orgs/{org}/artifacts/metadata/deployment-record — HTTP 200. */
export type CreateOrgArtifactDeploymentRecordSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    total_count: number;
    deployment_records: ArtifactDeploymentRecordRow[];
    request_id: string | null;
};

export type CreateOrgArtifactDeploymentRecordFailure = CreateRepoFailure;

/** One row in `storage_records` from POST /orgs/{org}/artifacts/metadata/storage-record. */
export type OrgMetadataStorageRecordRow = Record<string, unknown>;

/** POST /orgs/{org}/artifacts/metadata/storage-record — HTTP 200. */
export type CreateOrgMetadataStorageRecordSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    total_count: number;
    storage_records: OrgMetadataStorageRecordRow[];
    request_id: string | null;
};

export type CreateOrgMetadataStorageRecordFailure = CreateRepoFailure;

/** POST /orgs/{org}/artifacts/metadata/deployment-record/cluster/{cluster} — HTTP 200 (same body shape as single deployment record create). */
export type SetOrgClusterDeploymentRecordsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    cluster: string;
    total_count: number;
    deployment_records: ArtifactDeploymentRecordRow[];
    request_id: string | null;
};

export type SetOrgClusterDeploymentRecordsFailure = CreateRepoFailure;

/** GET /orgs/{org}/artifacts/{subject_digest}/metadata/deployment-records — HTTP 200. */
export type ListOrgArtifactDeploymentRecordsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    subject_digest: string;
    total_count: number;
    deployment_records: ArtifactDeploymentRecordRow[];
    request_id: string | null;
};

export type ListOrgArtifactDeploymentRecordsFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/attestations/repositories. */
export type OrgAttestationRepositoryRow = Record<string, unknown>;

/** GET /orgs/{org}/attestations/repositories — HTTP 200. */
export type ListOrgAttestationReposSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    repositories: OrgAttestationRepositoryRow[];
    request_id: string | null;
};

export type ListOrgAttestationReposFailure = CreateRepoFailure;

/** GET /orgs/{org}/attestations/{subject_digest} — list attestations for a subject digest (org-owned repos). */
export type ListOrgAttestationsSuccess = {
    success: true;
    message: string;
    org: string;
    /** Subject digest used for this request. */
    subject_digest: string;
    attestations: RepoAttestationListItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.after` / `next.before` to continue.
     */
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    /** Effective `per_page` for this call (default **100** when omitted, GitHub max **100**). */
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgAttestationsFailure = CreateRepoFailure;

/** GET /orgs/{org}/artifacts/{subject_digest}/metadata/storage-records — HTTP 200. */
export type ListOrgMetadataStorageRecordsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    subject_digest: string;
    total_count: number;
    storage_records: OrgMetadataStorageRecordRow[];
    request_id: string | null;
};

export type ListOrgMetadataStorageRecordsFailure = CreateRepoFailure;

/** POST /orgs/{org}/attestations/bulk-list — HTTP 200. */
export type BulkListOrgAttestationsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    attestations_subject_digests: Record<string, unknown>;
    page_info: Record<string, unknown>;
    request_id: string | null;
};

export type BulkListOrgAttestationsFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/attestations/{attestation_id} — HTTP 200 or 204. */
export type DeleteOrgAttestationByIdSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    attestation_id: number;
    request_id: string | null;
    response_data: Record<string, unknown> | null;
};

export type DeleteOrgAttestationByIdFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/attestations/digest/{subject_digest} — HTTP 200 or 204. */
export type DeleteOrgAttestationBySubjectDigestSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    subject_digest: string;
    request_id: string | null;
    response_data: Record<string, unknown> | null;
};

export type DeleteOrgAttestationBySubjectDigestFailure = CreateRepoFailure;

/** POST /orgs/{org}/attestations/delete-request — HTTP 200 (body often empty). */
export type DeleteOrgAttestationsBulkSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    request_id: string | null;
    response_data: Record<string, unknown> | null;
};

export type DeleteOrgAttestationsBulkFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/blocks (Simple User per GitHub). */
export type OrgBlockedUserRow = Record<string, unknown>;

/** GET /orgs/{org}/blocks — HTTP 200. */
export type ListOrgBlockedUsersSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    blocked_users: OrgBlockedUserRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgBlockedUsersFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/failed_invitations. */
export type OrgFailedInvitationRow = Record<string, unknown>;

/** GET /orgs/{org}/failed_invitations — HTTP 200. */
export type ListOrgFailedInvitationsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    invitations: OrgFailedInvitationRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgFailedInvitationsFailure = CreateRepoFailure;

/** GET /orgs/{org}/invitations — HTTP 200 (same item shape as failed invitations per GitHub). */
export type ListOrgPendingInvitationsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    invitations: OrgFailedInvitationRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgPendingInvitationsFailure = CreateRepoFailure;

/** POST /orgs/{org}/invitations — HTTP 201 (organization invitation object per GitHub). */
export type CreateOrgInvitationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    invitation: OrgFailedInvitationRow;
    request_id: string | null;
};

export type CreateOrgInvitationFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/invitations/{invitation_id} — HTTP 204 No Content. */
export type CancelOrgInvitationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Echoed path parameter. */
    invitation_id: number;
    request_id: string | null;
};

export type CancelOrgInvitationFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/invitations/{invitation_id}/teams (Team object per GitHub). */
export type OrgInvitationTeamRow = Record<string, unknown>;

/** GET /orgs/{org}/invitations/{invitation_id}/teams — HTTP 200. */
export type ListOrgInvitationTeamsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    invitation_id: number;
    teams: OrgInvitationTeamRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgInvitationTeamsFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/members (Simple User per GitHub). */
export type OrgMemberUserRow = Record<string, unknown>;

/** GET /orgs/{org}/members — HTTP 200. */
export type ListOrgMembersSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    members: OrgMemberUserRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgMembersFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/issue-fields. */
export type OrgIssueFieldRow = Record<string, unknown>;

/** GET /orgs/{org}/issue-fields — HTTP 200. */
export type ListOrgIssueFieldsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    issue_fields: OrgIssueFieldRow[];
    request_id: string | null;
};

export type ListOrgIssueFieldsFailure = CreateRepoFailure;

/** POST /orgs/{org}/issue-fields — HTTP 200. */
export type CreateOrgIssueFieldSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    issue_field: OrgIssueFieldRow;
    request_id: string | null;
};

export type CreateOrgIssueFieldFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/issue-fields/{issue_field_id} — HTTP 200. */
export type UpdateOrgIssueFieldSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Echoed path parameter. */
    issue_field_id: number;
    issue_field: OrgIssueFieldRow;
    request_id: string | null;
};

export type UpdateOrgIssueFieldFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/issue-fields/{issue_field_id} — HTTP 204 No Content. */
export type DeleteOrgIssueFieldSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Echoed path parameter. */
    issue_field_id: number;
    request_id: string | null;
};

export type DeleteOrgIssueFieldFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/issue-types. */
export type OrgIssueTypeRow = Record<string, unknown>;

/** GET /orgs/{org}/issue-types — HTTP 200. */
export type ListOrgIssueTypesSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    issue_types: OrgIssueTypeRow[];
    request_id: string | null;
};

export type ListOrgIssueTypesFailure = CreateRepoFailure;

/** POST /orgs/{org}/issue-types — HTTP 200. */
export type CreateOrgIssueTypeSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    issue_type: OrgIssueTypeRow;
    request_id: string | null;
};

export type CreateOrgIssueTypeFailure = CreateRepoFailure;

/** PUT /orgs/{org}/issue-types/{issue_type_id} — HTTP 200. */
export type UpdateOrgIssueTypeSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Echoed path parameter. */
    issue_type_id: number;
    issue_type: OrgIssueTypeRow;
    request_id: string | null;
};

export type UpdateOrgIssueTypeFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/issue-types/{issue_type_id} — HTTP 204 No Content. */
export type DeleteOrgIssueTypeSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Echoed path parameter. */
    issue_type_id: number;
    request_id: string | null;
};

export type DeleteOrgIssueTypeFailure = CreateRepoFailure;

/** GET /orgs/{org}/blocks/{username} — GitHub returns 204 when blocked; 404 when not (or without admin:org). */
export type CheckOrgBlockedUserSuccess = {
    success: true;
    message: string;
    org: string;
    username: string;
    /** True when GitHub returned **204** (user is blocked). */
    blocked: boolean;
    http_status: number;
    request_id: string | null;
};

export type CheckOrgBlockedUserFailure = CreateRepoFailure;

/** GET /orgs/{org}/members/{username} — GitHub returns **204** if the requester is an org member and `username` is a member; **404** if the requester is an org member and `username` is not; **302** if the requester is not an org member (target membership not disclosed). */
export type CheckOrgMembershipForUserSuccess = {
    success: true;
    message: string;
    org: string;
    username: string;
    http_status: number;
    /**
     * **true** when GitHub returned **204** (user is a member).
     * **false** when GitHub returned **404** (requester is an org member; user is not a member — or see GitHub docs for edge cases).
     * **null** when GitHub returned **302** (authenticated user is not an org member; membership is not disclosed).
     */
    is_member: boolean | null;
    /** When `http_status` is **302**, the redirect target URL if GitHub sent **`Location`**. */
    location: string | null;
    request_id: string | null;
};

export type CheckOrgMembershipForUserFailure = CreateRepoFailure;

/** GET /orgs/{org}/public_members/{username} — GitHub returns **204** if the user is a **public** member; **404** if not. */
export type CheckOrgPublicMembershipForUserSuccess = {
    success: true;
    message: string;
    org: string;
    username: string;
    http_status: number;
    /** **true** on HTTP **204**; **false** on HTTP **404**. */
    is_public_member: boolean;
    request_id: string | null;
};

export type CheckOrgPublicMembershipForUserFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/members/{username} — HTTP 204 No Content. Removes direct membership and team access; enterprise-team indirect membership may remain per GitHub. */
export type RemoveOrgMemberSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    request_id: string | null;
};

export type RemoveOrgMemberFailure = CreateRepoFailure;

/** GET /orgs/{org}/memberships/{username} — HTTP 200 (org membership object per GitHub). */
export type OrgMembershipRow = Record<string, unknown>;

export type GetOrgMembershipForUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    membership: OrgMembershipRow;
    request_id: string | null;
};

export type GetOrgMembershipForUserFailure = CreateRepoFailure;

/** GET /user/memberships/orgs/{org} — HTTP 200 (same Org Membership object as GET /orgs/{org}/memberships/{username} per GitHub). MCP tool: `github_get_org_membership_for_auth_user`. */
export type GetOrgMembershipForAuthUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    membership: OrgMembershipRow;
    request_id: string | null;
};

export type GetOrgMembershipForAuthUserFailure = CreateRepoFailure;

/** PATCH /user/memberships/orgs/{org} — HTTP 200 (accept pending invite; body `state` must be **active** per GitHub). MCP tool: `github_update_org_membership_for_auth_user`. */
export type UpdateOrgMembershipForAuthUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    membership: OrgMembershipRow;
    request_id: string | null;
};

export type UpdateOrgMembershipForAuthUserFailure = CreateRepoFailure;

/** PUT /orgs/{org}/memberships/{username} — HTTP 200 (same membership object as GET per GitHub). */
export type SetOrgMembershipForUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    membership: OrgMembershipRow;
    request_id: string | null;
};

export type SetOrgMembershipForUserFailure = CreateRepoFailure;

/** PUT /orgs/{org}/public_members/{username} — HTTP 204 No Content. MCP tool: `github_set_public_org_membership_for_auth_user`. Only the authenticated user may publicize their own membership (`username` must match the token user per GitHub). */
export type SetPublicOrgMembershipForAuthUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    request_id: string | null;
};

export type SetPublicOrgMembershipForAuthUserFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/public_members/{username} — HTTP 204 No Content. MCP tool: `github_remove_public_org_membership_for_auth_user`. Authenticated user only; `username` must match the token per GitHub. */
export type RemovePublicOrgMembershipForAuthUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    request_id: string | null;
};

export type RemovePublicOrgMembershipForAuthUserFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/memberships/{username} — HTTP 204 No Content. Removes active member or cancels pending invitation; enterprise indirect membership may remain per GitHub. */
export type RemoveOrgMembershipForUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    request_id: string | null;
};

export type RemoveOrgMembershipForUserFailure = CreateRepoFailure;

/** PUT /orgs/{org}/blocks/{username} — HTTP 204 on success. */
export type BlockOrgUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    request_id: string | null;
};

export type BlockOrgUserFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/blocks/{username} — HTTP 204 on success. */
export type UnblockOrgUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    request_id: string | null;
};

export type UnblockOrgUserFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/immutable-releases — disable immutable releases (204 No Content). */
export type DisableImmutableReleasesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type DisableImmutableReleasesFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/settings/immutable-releases/repositories/{repository_id} — remove repo from selected enforcement (204). */
export type DisableImmutableReleasesForOrgRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    repository_id: number;
    request_id: string | null;
};

export type DisableImmutableReleasesForOrgRepoFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/automated-security-fixes — enable Dependabot security updates (204 No Content). */
export type EnableDependabotSecurityUpdatesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type EnableDependabotSecurityUpdatesFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/automated-security-fixes — disable Dependabot security updates (204 No Content). */
export type DisableDependabotSecurityUpdatesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type DisableDependabotSecurityUpdatesFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/vulnerability-alerts — GitHub returns 204 when alerts are enabled; 404 when they are not (per docs). */
export type CheckVulnerabilityAlertsSuccess = {
    success: true;
    message: string;
    /** True when GitHub returns HTTP 204; false when GitHub returns 404 (dependency alerts not enabled for the repository). */
    enabled: boolean;
    request_id: string | null;
};

export type CheckVulnerabilityAlertsFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/vulnerability-alerts — enables dependency alerts and the dependency graph (204 No Content). Often required before automated security fixes. */
export type EnableVulnerabilityAlertsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type EnableVulnerabilityAlertsFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/vulnerability-alerts — disables dependency alerts and the dependency graph (204 No Content). */
export type DisableVulnerabilityAlertsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type DisableVulnerabilityAlertsFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/private-vulnerability-reporting */
export type EnablePrivateVulnerabilityReportingSuccess =
    | {
          success: true;
          outcome: "enabled";
          message: string;
          owner: string;
          repo: string;
          full_name: string;
          request_id: string | null;
      }
    | {
          success: true;
          outcome: "not_available";
          message: string;
          owner: string;
          repo: string;
          full_name: string;
          /** GitHub returned 404; enable is not exposed for this repo (e.g. visibility or policy). */
          request_id: string | null;
      };

export type EnablePrivateVulnerabilityReportingFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/private-vulnerability-reporting */
export type DisablePrivateVulnerabilityReportingSuccess =
    | {
          success: true;
          outcome: "disabled";
          message: string;
          owner: string;
          repo: string;
          full_name: string;
          request_id: string | null;
      }
    | {
          success: true;
          outcome: "not_available";
          message: string;
          owner: string;
          repo: string;
          full_name: string;
          /** GitHub returned 404; disable is not exposed for this repo (e.g. visibility or policy). */
          request_id: string | null;
      };

export type DisablePrivateVulnerabilityReportingFailure = CreateRepoFailure;

/** One entry from GET /repos/{owner}/{repo}/codeowners/errors. */
export type CodeownersErrorItem = {
    line: number;
    column: number;
    source: string | null;
    kind: string;
    suggestion: string | null;
    message: string;
    path: string;
};

export type ListCodeownersErrorsSuccess = {
    success: true;
    message: string;
    errors: CodeownersErrorItem[];
    request_id: string | null;
};

export type ListCodeownersErrorsFailure = CreateRepoFailure;

/** One entry from GET /repos/{owner}/{repo}/contributors. */
export type RepoContributorItem = {
    login: string | null;
    id: number | null;
    contributions: number;
    html_url: string | null;
    avatar_url: string | null;
    type: string | null;
    name: string | null;
    email: string | null;
};

export type ListRepoContributorsSuccess = {
    success: true;
    message: string;
    contributors: RepoContributorItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoContributorsFailure = CreateRepoFailure;

/** One row from GET /repos/{owner}/{repo}/languages (bytes of code per language). */
export type RepoLanguageItem = {
    language: string;
    bytes: number;
};

export type ListRepoLanguagesSuccess = {
    success: true;
    message: string;
    /** Languages sorted by byte count (descending). */
    languages: RepoLanguageItem[];
    total_bytes: number;
    request_id: string | null;
};

export type ListRepoLanguagesFailure = CreateRepoFailure;

/** One entry from GET /repos/{owner}/{repo}/autolinks. */
export type RepoAutolinkItem = {
    id: number;
    key_prefix: string;
    url_template: string;
    is_alphanumeric: boolean;
    updated_at: string | null;
};

export type ListRepoAutolinksSuccess = {
    success: true;
    message: string;
    autolinks: RepoAutolinkItem[];
    request_id: string | null;
};

export type ListRepoAutolinksFailure = CreateRepoFailure;

/** Success from POST /repos/{owner}/{repo}/autolinks — HTTP 201. */
export type CreateRepoAutolinkSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    autolink: RepoAutolinkItem;
    request_id: string | null;
};

export type CreateRepoAutolinkFailure = CreateRepoFailure;

/** Success from GET /repos/{owner}/{repo}/autolinks/{autolink_id} — HTTP 200. */
export type GetRepoAutolinkSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    autolink_id: number;
    autolink: RepoAutolinkItem;
    request_id: string | null;
};

export type GetRepoAutolinkFailure = CreateRepoFailure;

/** Success from DELETE /repos/{owner}/{repo}/autolinks/{autolink_id} — HTTP 204. */
export type DeleteRepoAutolinkSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    full_name: string;
    autolink_id: number;
    request_id: string | null;
};

export type DeleteRepoAutolinkFailure = CreateRepoFailure;

/** One row from GET /repos/{owner}/{repo}/properties/values. */
export type RepoCustomPropertyValue = {
    property_name: string;
    value: string | string[] | null;
};

export type GetRepoCustomPropertyValuesSuccess = {
    success: true;
    message: string;
    property_values: RepoCustomPropertyValue[];
    request_id: string | null;
};

export type GetRepoCustomPropertyValuesFailure = CreateRepoFailure;

/** Response from PATCH /repos/{owner}/{repo}/properties/values (typically HTTP 204). */
export type CreateUpdateRepoCustomPropertyValuesSuccess = {
    success: true;
    message: string;
    http_status: number;
    /** Echo of the property updates sent in the request body. */
    properties: RepoCustomPropertyValue[];
    request_id: string | null;
};

export type CreateUpdateRepoCustomPropertyValuesFailure = CreateRepoFailure;

/** One row from GET /repositories (list public repositories). */
export type PublicRepoListItem = {
    id: number;
    name: string;
    full_name: string;
    owner_login: string;
    private: boolean;
    html_url: string;
    description: string | null;
    fork: boolean;
    default_branch: string | null;
    created_at: string | null;
    updated_at: string | null;
    pushed_at: string | null;
};

export type ListPublicReposSuccess = {
    success: true;
    message: string;
    repositories: PublicRepoListItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.since` to continue.
     */
    pagination: GitHubSinceLinkPagination | null;
    request_id: string | null;
    /** `since` query sent on the last request (`null` if omitted). */
    since: number | null;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListPublicReposFailure = CreateRepoFailure;

/** One row from GET /organizations (organization simple). */
export type OrganizationSimpleListItem = Record<string, unknown>;

export type ListOrganizationsSuccess = {
    success: true;
    message: string;
    organizations: OrganizationSimpleListItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.since` to continue.
     */
    pagination: GitHubSinceLinkPagination | null;
    request_id: string | null;
    /** `since` query sent on the last request (`null` if omitted). */
    since: number | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrganizationsFailure = CreateRepoFailure;

/** GET /user/orgs — organizations the token may operate on (simple org rows; page/per_page pagination). */
export type ListOrgsForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    organizations: OrganizationSimpleListItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgsForAuthenticatedUserFailure = CreateRepoFailure;

/** One row from GET /user/memberships/orgs (Org Membership per GitHub). MCP tool: `github_list_org_memberships_for_auth_user`. */
export type AuthUserOrgMembershipRow = Record<string, unknown>;

/** GET /user/memberships/orgs — HTTP 200. */
export type ListOrgMembershipsForAuthUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    memberships: AuthUserOrgMembershipRow[];
    /** Echoed when **`state`** was sent in the request; omitted when listing both active and pending. */
    state?: "active" | "pending";
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgMembershipsForAuthUserFailure = CreateRepoFailure;

/** GET /users/{username}/orgs — public org memberships for a user (simple org rows; page/per_page pagination). */
export type ListOrgsForUserSuccess = {
    success: true;
    message: string;
    username: string;
    organizations: OrganizationSimpleListItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgsForUserFailure = CreateRepoFailure;

/** One installation from GET /orgs/{org}/installations. */
export type OrgAppInstallationItem = Record<string, unknown>;

export type ListOrgAppInstallationsSuccess = {
    success: true;
    message: string;
    org: string;
    /** Total count reported by GitHub (includes apps installed on org repositories). */
    total_count: number;
    installations: OrgAppInstallationItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgAppInstallationsFailure = CreateRepoFailure;

/** One hosted compute network configuration from GET /orgs/{org}/settings/network-configurations. */
export type OrgNetworkConfigurationItem = Record<string, unknown>;

/** GET /orgs/{org}/settings/network-configurations — HTTP 200. MCP tool: `github_list_org_network_configurations`. */
export type ListOrgNetworkConfigurationsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    total_count: number;
    network_configurations: OrgNetworkConfigurationItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgNetworkConfigurationsFailure = CreateRepoFailure;

/** POST /orgs/{org}/settings/network-configurations — HTTP 201. MCP tool: `github_create_org_network_configuration`. */
export type CreateOrgNetworkConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    network_configuration: OrgNetworkConfigurationItem;
    request_id: string | null;
};

export type CreateOrgNetworkConfigurationFailure = CreateRepoFailure;

/** GET /orgs/{org}/settings/network-configurations/{network_configuration_id} — HTTP 200. MCP tool: `github_get_org_network_configuration`. */
export type GetOrgNetworkConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    network_configuration_id: string;
    network_configuration: OrgNetworkConfigurationItem;
    request_id: string | null;
};

export type GetOrgNetworkConfigurationFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/settings/network-configurations/{network_configuration_id} — HTTP 200. MCP tool: `github_update_org_network_configuration`. */
export type UpdateOrgNetworkConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    network_configuration_id: string;
    network_configuration: OrgNetworkConfigurationItem;
    request_id: string | null;
};

export type UpdateOrgNetworkConfigurationFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/settings/network-configurations/{network_configuration_id} — HTTP 204 No Content. MCP tool: `github_delete_org_network_configuration`. */
export type DeleteOrgNetworkConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    network_configuration_id: string;
    request_id: string | null;
};

export type DeleteOrgNetworkConfigurationFailure = CreateRepoFailure;

/** One hosted compute network settings resource from GET /orgs/{org}/settings/network-settings/{network_settings_id}. */
export type OrgNetworkSettingsItem = Record<string, unknown>;

/** GET /orgs/{org}/settings/network-settings/{network_settings_id} — HTTP 200. MCP tool: `github_get_org_network_settings`. */
export type GetOrgNetworkSettingsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    network_settings_id: string;
    network_settings: OrgNetworkSettingsItem;
    request_id: string | null;
};

export type GetOrgNetworkSettingsFailure = CreateRepoFailure;

/** One organization role from GET /orgs/{org}/organization-roles. */
export type OrganizationRoleItem = Record<string, unknown>;

/** GET /orgs/{org}/organization-roles — HTTP 200. MCP tool: `github_list_org_roles`. */
export type ListOrgRolesSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    total_count: number;
    roles: OrganizationRoleItem[];
    request_id: string | null;
};

export type ListOrgRolesFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/organization-roles/teams/{team_slug} — HTTP 204 No Content. MCP tool: `github_remove_all_org_roles_for_team`. */
export type RemoveAllOrgRolesForTeamSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    team_slug: string;
    request_id: string | null;
};

export type RemoveAllOrgRolesForTeamFailure = CreateRepoFailure;

/** PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id} — HTTP 204 No Content. MCP tool: `github_assign_org_role_to_team`. */
export type AssignOrgRoleToTeamSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    team_slug: string;
    role_id: number;
    request_id: string | null;
};

export type AssignOrgRoleToTeamFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id} — HTTP 204 No Content. MCP tool: `github_remove_org_role_from_team`. */
export type RemoveOrgRoleFromTeamSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    team_slug: string;
    role_id: number;
    request_id: string | null;
};

export type RemoveOrgRoleFromTeamFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/organization-roles/users/{username} — HTTP 204 No Content. MCP tool: `github_remove_all_org_roles_for_user`. */
export type RemoveAllOrgRolesForUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    request_id: string | null;
};

export type RemoveAllOrgRolesForUserFailure = CreateRepoFailure;

/** PUT /orgs/{org}/organization-roles/users/{username}/{role_id} — HTTP 204 No Content. MCP tool: `github_assign_org_role_to_user`. */
export type AssignOrgRoleToUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    role_id: number;
    request_id: string | null;
};

export type AssignOrgRoleToUserFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/organization-roles/users/{username}/{role_id} — HTTP 204 No Content. MCP tool: `github_remove_org_role_from_user`. */
export type RemoveOrgRoleFromUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    role_id: number;
    request_id: string | null;
};

export type RemoveOrgRoleFromUserFailure = CreateRepoFailure;

/** GET /orgs/{org}/organization-roles/{role_id} — HTTP 200 (single Organization Role object). MCP tool: `github_get_org_role`. */
export type GetOrgRoleSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    role_id: number;
    role: OrganizationRoleItem;
    request_id: string | null;
};

export type GetOrgRoleFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/organization-roles/{role_id}/teams (A Role Assignment for a Team). */
export type OrgRoleTeamAssignmentRow = Record<string, unknown>;

/** GET /orgs/{org}/organization-roles/{role_id}/teams — HTTP 200. MCP tool: `github_list_teams_assigned_to_org_role`. */
export type ListTeamsAssignedToOrgRoleSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    role_id: number;
    teams: OrgRoleTeamAssignmentRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListTeamsAssignedToOrgRoleFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/organization-roles/{role_id}/users (A Role Assignment for a User). */
export type OrgRoleUserAssignmentRow = Record<string, unknown>;

/** GET /orgs/{org}/organization-roles/{role_id}/users — HTTP 200. MCP tool: `github_list_users_assigned_to_org_role`. */
export type ListUsersAssignedToOrgRoleSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    role_id: number;
    users: OrgRoleUserAssignmentRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListUsersAssignedToOrgRoleFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/outside_collaborators (Simple User per GitHub). */
export type OrgOutsideCollaboratorRow = Record<string, unknown>;

/** GET /orgs/{org}/outside_collaborators — HTTP 200. MCP tool: `github_list_org_outside_collaborators`. */
export type ListOrgOutsideCollaboratorsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    filter: "2fa_disabled" | "2fa_insecure" | "all";
    outside_collaborators: OrgOutsideCollaboratorRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgOutsideCollaboratorsFailure = CreateRepoFailure;

/** PUT /orgs/{org}/outside_collaborators/{username} — HTTP 204 (converted) or 202 (queued async). MCP tool: `github_convert_org_member_to_outside_collaborator`. */
export type ConvertOrgMemberToOutsideCollaboratorSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    /** Whether the conversion was requested asynchronously (echoes the `async` input). */
    async: boolean;
    /** Present when GitHub returns a 202 body for an async request. */
    data?: Record<string, unknown>;
    request_id: string | null;
};

export type ConvertOrgMemberToOutsideCollaboratorFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/outside_collaborators/{username} — HTTP 204 No Content. MCP tool: `github_remove_org_outside_collaborator`. */
export type RemoveOrgOutsideCollaboratorSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    request_id: string | null;
};

export type RemoveOrgOutsideCollaboratorFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/personal-access-token-requests (Simple Organization Programmatic Access Grant Request). */
export type OrgPatRequestRow = Record<string, unknown>;

/** GET /orgs/{org}/personal-access-token-requests — HTTP 200. MCP tool: `github_list_org_pat_requests`. */
export type ListOrgPatRequestsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    pat_requests: OrgPatRequestRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgPatRequestsFailure = CreateRepoFailure;

/** POST /orgs/{org}/personal-access-token-requests — HTTP 202 Accepted. MCP tool: `github_review_org_pat_requests`. */
export type ReviewOrgPatRequestsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    action: "approve" | "deny";
    pat_request_ids?: number[];
    reason?: string | null;
    /** Present when GitHub returns a 202 body. */
    data?: Record<string, unknown>;
    request_id: string | null;
};

export type ReviewOrgPatRequestsFailure = CreateRepoFailure;

/** POST /orgs/{org}/personal-access-token-requests/{pat_request_id} — HTTP 204 No Content. MCP tool: `github_review_org_pat_request`. */
export type ReviewOrgPatRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    pat_request_id: number;
    action: "approve" | "deny";
    reason?: string | null;
    request_id: string | null;
};

export type ReviewOrgPatRequestFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories (Minimal Repository). */
export type OrgPatRequestRepositoryRow = Record<string, unknown>;

/** GET /orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories — HTTP 200. MCP tool: `github_list_org_pat_request_repositories`. */
export type ListOrgPatRequestRepositoriesSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    pat_request_id: number;
    repositories: OrgPatRequestRepositoryRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgPatRequestRepositoriesFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/personal-access-tokens (Organization Programmatic Access Grant). */
export type OrgPatRow = Record<string, unknown>;

/** GET /orgs/{org}/personal-access-tokens — HTTP 200. MCP tool: `github_list_org_pats`. */
export type ListOrgPatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    personal_access_tokens: OrgPatRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgPatsFailure = CreateRepoFailure;

/** POST /orgs/{org}/personal-access-tokens — HTTP 202 Accepted. MCP tool: `github_update_org_pats`. */
export type UpdateOrgPatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    action: "revoke";
    pat_ids: number[];
    /** Present when GitHub returns a 202 body. */
    data?: Record<string, unknown>;
    request_id: string | null;
};

export type UpdateOrgPatsFailure = CreateRepoFailure;

/** POST /orgs/{org}/personal-access-tokens/{pat_id} — HTTP 204 No Content. MCP tool: `github_update_org_pat`. */
export type UpdateOrgPatSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    pat_id: number;
    action: "revoke";
    request_id: string | null;
};

export type UpdateOrgPatFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories (Minimal Repository). */
export type OrgPatRepositoryRow = Record<string, unknown>;

/** GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories — HTTP 200. MCP tool: `github_list_org_pat_repositories`. */
export type ListOrgPatRepositoriesSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    pat_id: number;
    repositories: OrgPatRepositoryRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgPatRepositoriesFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/rulesets/rule-suites. */
export type OrgRuleSuiteRow = Record<string, unknown>;

/** GET /orgs/{org}/rulesets/rule-suites — HTTP 200. MCP tool: `github_list_org_rule_suites`. */
export type ListOrgRuleSuitesSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    rule_suites: OrgRuleSuiteRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgRuleSuitesFailure = CreateRepoFailure;

/** GET /orgs/{org}/rulesets/rule-suites/{rule_suite_id} — HTTP 200 (rule suite with rule_evaluations). MCP tool: `github_get_org_rule_suite`. */
export type OrgRuleSuiteItem = Record<string, unknown>;

export type GetOrgRuleSuiteSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    rule_suite_id: number;
    rule_suite: OrgRuleSuiteItem;
    request_id: string | null;
};

export type GetOrgRuleSuiteFailure = CreateRepoFailure;

/** One ruleset from GET /orgs/{org}/rulesets (repository ruleset object per GitHub). */
export type OrgRulesetListItem = Record<string, unknown>;

/** GET /orgs/{org}/rulesets — HTTP 200. MCP tool: `github_list_org_rulesets`. */
export type ListOrgRulesetsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    rulesets: OrgRulesetListItem[];
    /** Requested comma-separated `targets` filter, if any. */
    targets?: string;
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgRulesetsFailure = CreateRepoFailure;

/** POST /orgs/{org}/rulesets — HTTP 201 Created. MCP tool: `github_create_org_ruleset`. */
export type CreateOrgRulesetSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    ruleset: OrgRulesetListItem;
    request_id: string | null;
};

export type CreateOrgRulesetFailure = CreateRepoFailure;

/** GET /orgs/{org}/rulesets/{ruleset_id} — HTTP 200. MCP tool: `github_get_org_ruleset`. */
export type GetOrgRulesetSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    ruleset_id: number;
    ruleset: OrgRulesetListItem;
    request_id: string | null;
};

export type GetOrgRulesetFailure = CreateRepoFailure;

/** PUT /orgs/{org}/rulesets/{ruleset_id} — HTTP 200. MCP tool: `github_update_org_ruleset`. */
export type UpdateOrgRulesetSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    ruleset_id: number;
    ruleset: OrgRulesetListItem;
    request_id: string | null;
};

export type UpdateOrgRulesetFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/rulesets/{ruleset_id} — HTTP 204 No Content. MCP tool: `github_delete_org_ruleset`. */
export type DeleteOrgRulesetSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    ruleset_id: number;
    request_id: string | null;
};

export type DeleteOrgRulesetFailure = CreateRepoFailure;

/** One version row from GET /orgs/{org}/rulesets/{ruleset_id}/history (`version_id`, `actor`, `updated_at`, …). */
export type OrgRulesetHistoryVersionItem = Record<string, unknown>;

/** GET /orgs/{org}/rulesets/{ruleset_id}/history — HTTP 200. MCP tool: `github_get_org_ruleset_history`. */
export type GetOrgRulesetHistorySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    ruleset_id: number;
    versions: OrgRulesetHistoryVersionItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type GetOrgRulesetHistoryFailure = CreateRepoFailure;

/** Body from GET /orgs/{org}/rulesets/{ruleset_id}/history/{version_id} — version metadata plus `state` (ruleset snapshot). */
export type OrgRulesetVersionWithState = Record<string, unknown>;

/** GET /orgs/{org}/rulesets/{ruleset_id}/history/{version_id} — HTTP 200. MCP tool: `github_get_org_ruleset_version`. */
export type GetOrgRulesetVersionSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    ruleset_id: number;
    version_id: number;
    /** Full API object: `version_id`, `actor`, `updated_at`, `state`, etc. */
    version: OrgRulesetVersionWithState;
    request_id: string | null;
};

export type GetOrgRulesetVersionFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/security-managers (Team Simple per GitHub). */
export type OrgSecurityManagerTeamRow = Record<string, unknown>;

/** GET /orgs/{org}/security-managers — HTTP 200. MCP tool: `github_list_org_security_manager_teams`. */
export type ListOrgSecurityManagerTeamsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    teams: OrgSecurityManagerTeamRow[];
    request_id: string | null;
};

export type ListOrgSecurityManagerTeamsFailure = CreateRepoFailure;

/** PUT /orgs/{org}/security-managers/teams/{team_slug} — HTTP 204 No Content. MCP tool: `github_add_org_security_manager_team`. */
export type AddOrgSecurityManagerTeamSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    team_slug: string;
    request_id: string | null;
};

export type AddOrgSecurityManagerTeamFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/security-managers/teams/{team_slug} — HTTP 204 No Content. MCP tool: `github_remove_org_security_manager_team`. */
export type RemoveOrgSecurityManagerTeamSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    team_slug: string;
    request_id: string | null;
};

export type RemoveOrgSecurityManagerTeamFailure = CreateRepoFailure;

/** One webhook from GET /orgs/{org}/hooks (Org Hook per GitHub). */
export type OrgWebhookItem = Record<string, unknown>;

/** GET /orgs/{org}/hooks — HTTP 200. MCP tool: `github_list_org_webhooks`. */
export type ListOrgWebhooksSuccess = {
    success: true;
    message: string;
    org: string;
    webhooks: OrgWebhookItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgWebhooksFailure = CreateRepoFailure;

/** POST /orgs/{org}/hooks — HTTP 201 Created. MCP tool: `github_create_org_webhook`. */
export type CreateOrgWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    webhook: OrgWebhookItem;
    request_id: string | null;
};

export type CreateOrgWebhookFailure = CreateRepoFailure;

/** GET /orgs/{org}/hooks/{hook_id} — HTTP 200. MCP tool: `github_get_org_webhook`. */
export type GetOrgWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hook_id: number;
    webhook: OrgWebhookItem;
    request_id: string | null;
};

export type GetOrgWebhookFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/hooks/{hook_id} — HTTP 200. MCP tool: `github_update_org_webhook`. */
export type UpdateOrgWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hook_id: number;
    webhook: OrgWebhookItem;
    request_id: string | null;
};

export type UpdateOrgWebhookFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/hooks/{hook_id} — HTTP 204 No Content. MCP tool: `github_delete_org_webhook`. */
export type DeleteOrgWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hook_id: number;
    request_id: string | null;
};

export type DeleteOrgWebhookFailure = CreateRepoFailure;

/** Config object from GET /orgs/{org}/hooks/{hook_id}/config (`url`, `content_type`, `secret`, `insecure_ssl`, …). */
export type OrgWebhookConfigItem = Record<string, unknown>;

/** GET /orgs/{org}/hooks/{hook_id}/config — HTTP 200. MCP tool: `github_get_org_webhook_config`. */
export type GetOrgWebhookConfigSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hook_id: number;
    config: OrgWebhookConfigItem;
    request_id: string | null;
};

export type GetOrgWebhookConfigFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/hooks/{hook_id}/config — HTTP 200. MCP tool: `github_update_org_webhook_config`. */
export type UpdateOrgWebhookConfigSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hook_id: number;
    config: OrgWebhookConfigItem;
    request_id: string | null;
};

export type UpdateOrgWebhookConfigFailure = CreateRepoFailure;

/** One delivery from GET /orgs/{org}/hooks/{hook_id}/deliveries (simple webhook delivery per GitHub). */
export type OrgWebhookDeliveryItem = Record<string, unknown>;

/** GET /orgs/{org}/hooks/{hook_id}/deliveries — HTTP 200. MCP tool: `github_list_org_webhook_deliveries`. */
export type ListOrgWebhookDeliveriesSuccess = {
    success: true;
    message: string;
    org: string;
    hook_id: number;
    deliveries: OrgWebhookDeliveryItem[];
    pagination: GitHubCursorQueryLinkPagination | null;
    request_id: string | null;
    /** `cursor` query used for the first page in this response (omit on first page). */
    cursor: string | undefined;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgWebhookDeliveriesFailure = CreateRepoFailure;

/** GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id} — HTTP 200 (full delivery). MCP tool: `github_get_org_webhook_delivery`. */
export type GetOrgWebhookDeliverySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hook_id: number;
    delivery_id: number;
    delivery: OrgWebhookDeliveryItem;
    request_id: string | null;
};

export type GetOrgWebhookDeliveryFailure = CreateRepoFailure;

/** POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts — typically HTTP 202 Accepted. MCP tool: `github_redeliver_org_webhook_delivery`. */
export type RedeliverOrgWebhookDeliverySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hook_id: number;
    delivery_id: number;
    request_id: string | null;
};

export type RedeliverOrgWebhookDeliveryFailure = CreateRepoFailure;

/** POST /orgs/{org}/hooks/{hook_id}/pings — HTTP 204 No Content. MCP tool: `github_ping_org_webhook`. */
export type PingOrgWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hook_id: number;
    request_id: string | null;
};

export type PingOrgWebhookFailure = CreateRepoFailure;

/** One repository from GET /orgs/{org}/settings/immutable-releases/repositories. */
export type OrgImmutableReleasesRepositoryItem = Record<string, unknown>;

export type ListImmutableReleasesForOrgReposSuccess = {
    success: true;
    message: string;
    org: string;
    total_count: number;
    repositories: OrgImmutableReleasesRepositoryItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListImmutableReleasesForOrgReposFailure = CreateRepoFailure;

/** Organization object from GET /orgs/{org} (fields depend on token/scopes). */
export type OrganizationDetailItem = Record<string, unknown>;

/** Success from GET /orgs/{org} — HTTP 200. */
export type GetOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    /** Echoed organization login from the request. */
    org: string;
    organization: OrganizationDetailItem;
    request_id: string | null;
};

export type GetOrgFailure = CreateRepoFailure;

/** One organization custom property from GET /orgs/{org}/properties/schema. */
export type OrgCustomPropertyRow = Record<string, unknown>;

/** GET /orgs/{org}/properties/schema — HTTP 200. */
export type GetOrgCustomPropertiesSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    properties: OrgCustomPropertyRow[];
    request_id: string | null;
};

export type GetOrgCustomPropertiesFailure = CreateRepoFailure;

/** GET /orgs/{org}/properties/schema/{custom_property_name} — HTTP 200. */
export type GetOrgCustomPropertySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Echoed path parameter. */
    custom_property_name: string;
    property: OrgCustomPropertyRow;
    request_id: string | null;
};

export type GetOrgCustomPropertyFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/properties/schema/{custom_property_name} — HTTP 204 No Content. */
export type DeleteOrgCustomPropertySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Echoed path parameter. */
    custom_property_name: string;
    request_id: string | null;
};

export type DeleteOrgCustomPropertyFailure = CreateRepoFailure;

/** One repository row from GET /orgs/{org}/properties/values. */
export type OrgRepositoryCustomPropertyValuesRow = {
    repository_id: number;
    repository_name: string;
    repository_full_name: string;
    properties: RepoCustomPropertyValue[];
};

/** GET /orgs/{org}/properties/values — HTTP 200. */
export type GetOrgCustomPropertyValuesSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Echo of `repository_query` when provided; otherwise null. */
    repository_query: string | null;
    repositories: OrgRepositoryCustomPropertyValuesRow[];
    /**
     * Parsed from the last response `Link` header. For a single-page request, use `next` for the following call.
     * When `all_pages` completed fully, this is `null`. When `truncated` is true, `next` points at the page to fetch next.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type GetOrgCustomPropertyValuesFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/properties/values — typically HTTP 204 No Content. */
export type CreateUpdateOrgCustomPropertyValuesSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Echo of repository short names from the request (GitHub allows up to 30 per call). */
    repository_names: string[];
    /** Echo of the property updates sent in the request body. */
    properties: RepoCustomPropertyValue[];
    request_id: string | null;
};

export type CreateUpdateOrgCustomPropertyValuesFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/insights/api/route-stats/{actor_type}/{actor_id}. */
export type RouteStatsByActorRow = Record<string, unknown>;

/** GET /orgs/{org}/insights/api/route-stats/{actor_type}/{actor_id} — HTTP 200. */
export type GetRouteStatsByActorSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    actor_type: string;
    actor_id: number;
    min_timestamp: string;
    max_timestamp: string | null;
    route_stats: RouteStatsByActorRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type GetRouteStatsByActorFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/insights/api/user-stats/{user_id}. */
export type UserStatRow = Record<string, unknown>;

/** GET /orgs/{org}/insights/api/user-stats/{user_id} — HTTP 200. */
export type GetUserStatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    user_id: string;
    min_timestamp: string;
    max_timestamp: string | null;
    user_stats: UserStatRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type GetUserStatsFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/insights/api/subject-stats. */
export type SubjectStatRow = Record<string, unknown>;

/** GET /orgs/{org}/insights/api/subject-stats — HTTP 200. */
export type GetSubjectStatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    min_timestamp: string;
    max_timestamp: string | null;
    subject_stats: SubjectStatRow[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type GetSubjectStatsFailure = CreateRepoFailure;

/** GET /orgs/{org}/insights/api/summary-stats — HTTP 200 (object: total_request_count, rate_limited_request_count, …). */
export type GetSummaryStatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    min_timestamp: string;
    max_timestamp: string | null;
    summary_stats: Record<string, unknown>;
    request_id: string | null;
};

export type GetSummaryStatsFailure = CreateRepoFailure;

/** GET /orgs/{org}/insights/api/summary-stats/users/{user_id} — HTTP 200 (same body shape as org summary stats). */
export type GetSummaryStatsByUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    user_id: string;
    min_timestamp: string;
    max_timestamp: string | null;
    summary_stats: Record<string, unknown>;
    request_id: string | null;
};

export type GetSummaryStatsByUserFailure = CreateRepoFailure;

/** GET /orgs/{org}/insights/api/summary-stats/{actor_type}/{actor_id} — HTTP 200 (same body shape as org summary stats). */
export type GetSummaryStatsByActorSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    actor_type: string;
    actor_id: number;
    min_timestamp: string;
    max_timestamp: string | null;
    summary_stats: Record<string, unknown>;
    request_id: string | null;
};

export type GetSummaryStatsByActorFailure = CreateRepoFailure;

/** One row from GET /orgs/{org}/insights/api/time-stats. */
export type TimeStatRow = Record<string, unknown>;

/** GET /orgs/{org}/insights/api/time-stats — HTTP 200 (array of time buckets). */
export type GetTimeStatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    min_timestamp: string;
    max_timestamp: string | null;
    timestamp_increment: string;
    time_stats: TimeStatRow[];
    request_id: string | null;
};

export type GetTimeStatsFailure = CreateRepoFailure;

/** GET /orgs/{org}/insights/api/time-stats/{actor_type}/{actor_id} — HTTP 200 (same array shape as org time-stats). */
export type GetTimeStatsByActorSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    actor_type: string;
    actor_id: number;
    min_timestamp: string;
    max_timestamp: string | null;
    timestamp_increment: string;
    time_stats: TimeStatRow[];
    request_id: string | null;
};

export type GetTimeStatsByActorFailure = CreateRepoFailure;

/** GET /orgs/{org}/insights/api/time-stats/users/{user_id} — HTTP 200 (same array shape as org time-stats). */
export type GetTimeStatsByUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    user_id: string;
    min_timestamp: string;
    max_timestamp: string | null;
    timestamp_increment: string;
    time_stats: TimeStatRow[];
    request_id: string | null;
};

export type GetTimeStatsByUserFailure = CreateRepoFailure;

/** GET /orgs/{org}/settings/immutable-releases — HTTP 200. */
export type GetOrgImmutableReleasesSettingsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** GitHub: `all`, `none`, or `selected`. */
    enforced_repositories: string;
    selected_repositories_url: string | null;
    request_id: string | null;
};

export type GetOrgImmutableReleasesSettingsFailure = CreateRepoFailure;

/** PUT /orgs/{org}/settings/immutable-releases — typically HTTP 204 No Content. */
export type SetOrgImmutableReleasesSettingsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    enforced_repositories: string;
    request_id: string | null;
};

export type SetOrgImmutableReleasesSettingsFailure = CreateRepoFailure;

/** PUT /orgs/{org}/settings/immutable-releases/repositories — typically HTTP 204 No Content. */
export type SetImmutableReleasesForOrgReposSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Repository ids sent to GitHub (full replacement for the selected set). */
    selected_repository_ids: number[];
    request_id: string | null;
};

export type SetImmutableReleasesForOrgReposFailure = CreateRepoFailure;

/** Success from PATCH /orgs/{org} — HTTP 200. */
export type UpdateOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    organization: OrganizationDetailItem;
    request_id: string | null;
};

export type UpdateOrgFailure = CreateRepoFailure;

/** Success from DELETE /orgs/{org} — typically HTTP 202 Accepted. */
export type DeleteOrgSuccess = {
    success: true;
    message: string;
    org: string;
    request_id: string | null;
    /** Present when GitHub returned a response (omit on dry run). */
    http_status?: number;
    dry_run?: boolean;
    planned_request?: { org: string };
};

export type DeleteOrgFailure = CreateRepoFailure;

/** GET /users/{username}/repos — public repositories for a user (see GitHub `type` filter). */
export type ListUserReposSuccess = {
    success: true;
    message: string;
    username: string;
    repositories: PublicRepoListItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListUserReposFailure = CreateRepoFailure;

/** GET /orgs/{org}/repos — repositories for an organization (visibility depends on token and membership). */
export type ListOrgReposSuccess = {
    success: true;
    message: string;
    org: string;
    repositories: PublicRepoListItem[];
    /**
     * Parsed from the last response `Link` header. For a single-page request, use `next` for the following call.
     * When `all_pages` completed fully, this is `null`. When `truncated` is true, `next` points at the page to fetch next.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    /** `page` query used for the last GitHub request in this call. */
    page: number;
    /** `per_page` used for GitHub requests in this call. */
    per_page: number;
    /** How many list requests were made (`1` unless `all_pages` is true). */
    pages_fetched: number;
    /** True when `all_pages` stopped because `max_pages` was reached while more pages remained. */
    truncated?: boolean;
};

export type ListOrgReposFailure = CreateRepoFailure;

/** One row from GET /user/repos (repositories the authenticated user can access). */
export type AuthenticatedUserRepoListItem = {
    id: number;
    name: string;
    full_name: string;
    owner_login: string;
    private: boolean;
    visibility: string | null;
    html_url: string;
    description: string | null;
    fork: boolean;
    default_branch: string | null;
    created_at: string | null;
    updated_at: string | null;
    pushed_at: string | null;
    permissions: {
        admin: boolean;
        maintain: boolean;
        push: boolean;
        triage: boolean;
        pull: boolean;
    } | null;
};

export type ListAuthenticatedUserReposSuccess = {
    success: true;
    message: string;
    repositories: AuthenticatedUserRepoListItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListAuthenticatedUserReposFailure = CreateRepoFailure;

/** One entry from GET /repos/{owner}/{repo}/tags. */
export type RepoTagItem = {
    name: string;
    commit_sha: string;
    commit_url: string;
    zipball_url: string;
    tarball_url: string;
    node_id: string;
};

export type ListRepoTagsSuccess = {
    success: true;
    message: string;
    tags: RepoTagItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoTagsFailure = CreateRepoFailure;

/** One fork from GET /repos/{owner}/{repo}/forks (minimal repository fields). */
export type RepoForkItem = {
    id: number;
    name: string;
    full_name: string;
    owner_login: string;
    private: boolean;
    html_url: string;
    description: string | null;
    fork: boolean;
    default_branch: string | null;
    stargazers_count: number;
    watchers_count: number;
    forks_count: number;
    open_issues_count: number;
    created_at: string | null;
    updated_at: string | null;
    pushed_at: string | null;
};

/** Success from POST /repos/{owner}/{repo}/forks — GitHub returns HTTP 202 Accepted. */
export type CreateRepoForkSuccess = {
    success: true;
    message: string;
    http_status: number;
    repo: RepoInfo;
    request_id: string | null;
};

export type CreateRepoForkFailure = CreateRepoFailure;

export type ListRepoForksSuccess = {
    success: true;
    message: string;
    forks: RepoForkItem[];
    /** Effective sort order (`newest` when omitted). */
    sort: string;
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoForksFailure = CreateRepoFailure;

/** One ruleset evaluation row from GET /repos/{owner}/{repo}/rulesets/rule-suites (REST name: rule suite). */
export type RepoRuleSuiteItem = {
    id: number;
    actor_id?: number;
    actor_name?: string;
    before_sha?: string;
    after_sha?: string;
    ref?: string;
    repository_id?: number;
    repository_name?: string;
    pushed_at?: string;
    result?: "pass" | "fail" | "bypass";
    evaluation_result?: "pass" | "fail" | "bypass";
};

/** One rule evaluation inside GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}. */
export type RepoRuleEvaluationItem = {
    rule_source?: {
        type?: string;
        id?: number | null;
        name?: string | null;
    };
    enforcement?: "active" | "evaluate" | "deleted ruleset";
    result?: "pass" | "fail";
    rule_type?: string;
    details?: string | null;
};

/** Full rule suite from GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id} (includes per-rule rows). */
export type RepoRuleSuiteDetail = {
    id: number;
    actor_id?: number | null;
    actor_name?: string | null;
    before_sha?: string;
    after_sha?: string;
    ref?: string;
    repository_id?: number;
    repository_name?: string;
    pushed_at?: string;
    result?: "pass" | "fail" | "bypass";
    evaluation_result?: "pass" | "fail" | "bypass" | null;
    rule_evaluations: RepoRuleEvaluationItem[];
};

export type GetRepoRuleSuiteSuccess = {
    success: true;
    message: string;
    rule_suite: RepoRuleSuiteDetail;
    request_id: string | null;
};

export type GetRepoRuleSuiteFailure = CreateRepoFailure;

export type ListRepoRuleSuitesSuccess = {
    success: true;
    message: string;
    rule_suites: RepoRuleSuiteItem[];
    /** Effective `time_period` (`day` when omitted). */
    time_period: "hour" | "day" | "week" | "month";
    /** Effective `rule_suite_result` (`all` when omitted). */
    rule_suite_result: "pass" | "fail" | "bypass" | "all";
    /** Requested ref filter, if any. */
    ref?: string;
    /** Requested actor filter, if any. */
    actor_name?: string;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoRuleSuitesFailure = CreateRepoFailure;

/** One active rule from GET /repos/{owner}/{repo}/rules/branches/{branch}; fields vary by `type`. */
export type RepoBranchRuleDetailed = Record<string, unknown>;

export type GetRepoBranchRulesSuccess = {
    success: true;
    message: string;
    /** Branch name sent to the API (the branch does not need to exist). */
    branch: string;
    rules: RepoBranchRuleDetailed[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type GetRepoBranchRulesFailure = CreateRepoFailure;

/** One ruleset from GET /repos/{owner}/{repo}/rulesets (full ruleset object; `bypass_actors` may be omitted without write access). */
export type RepoRulesetListItem = Record<string, unknown>;

export type ListRepoRulesetsSuccess = {
    success: true;
    message: string;
    rulesets: RepoRulesetListItem[];
    /** Effective `includes_parents` (`true` when omitted; matches GitHub API default). */
    includes_parents: boolean;
    /** Requested comma-separated `targets` filter, if any. */
    targets?: string;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoRulesetsFailure = CreateRepoFailure;

/** One webhook from GET /repos/{owner}/{repo}/hooks. */
export type RepoWebhookItem = Record<string, unknown>;

export type ListRepoWebhooksSuccess = {
    success: true;
    message: string;
    webhooks: RepoWebhookItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoWebhooksFailure = CreateRepoFailure;

/** One delivery from GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries (summary fields). */
export type RepoWebhookDeliveryItem = Record<string, unknown>;

export type ListRepoWebhookDeliveriesSuccess = {
    success: true;
    message: string;
    hook_id: number;
    deliveries: RepoWebhookDeliveryItem[];
    pagination: GitHubCursorQueryLinkPagination | null;
    request_id: string | null;
    /** `cursor` query used for the first page in this response (omit on first page). */
    cursor: string | undefined;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoWebhookDeliveriesFailure = CreateRepoFailure;

/** Success from GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id} — HTTP 200 (full delivery, including bodies when present). */
export type GetRepoWebhookDeliverySuccess = {
    success: true;
    message: string;
    http_status: number;
    hook_id: number;
    delivery_id: number;
    delivery: RepoWebhookDeliveryItem;
    request_id: string | null;
};

export type GetRepoWebhookDeliveryFailure = CreateRepoFailure;

/** Success from POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts — typically HTTP 202 Accepted. */
export type RedeliverRepoWebhookDeliverySuccess = {
    success: true;
    message: string;
    http_status: number;
    hook_id: number;
    delivery_id: number;
    request_id: string | null;
};

export type RedeliverRepoWebhookDeliveryFailure = CreateRepoFailure;

/** Success from POST /repos/{owner}/{repo}/hooks/{hook_id}/pings — HTTP 204 No Content. */
export type PingRepoWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    hook_id: number;
    request_id: string | null;
};

export type PingRepoWebhookFailure = CreateRepoFailure;

/** Success from POST /repos/{owner}/{repo}/hooks/{hook_id}/tests — HTTP 204 No Content (no POST to URL if hook lacks `push`). */
export type TestPushRepoWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    hook_id: number;
    request_id: string | null;
};

export type TestPushRepoWebhookFailure = CreateRepoFailure;

/** Success from POST /repos/{owner}/{repo}/hooks — GitHub returns HTTP 201. */
export type CreateRepoWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    webhook: RepoWebhookItem;
    request_id: string | null;
};

export type CreateRepoWebhookFailure = CreateRepoFailure;

/** Success from GET /repos/{owner}/{repo}/hooks/{hook_id} — HTTP 200. */
export type GetRepoWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    hook_id: number;
    webhook: RepoWebhookItem;
    request_id: string | null;
};

export type GetRepoWebhookFailure = CreateRepoFailure;

/** Config object from GET /repos/{owner}/{repo}/hooks/{hook_id}/config (`url`, `content_type`, `secret`, `insecure_ssl`, …). */
export type RepoWebhookConfigItem = Record<string, unknown>;

/** Success from GET /repos/{owner}/{repo}/hooks/{hook_id}/config — HTTP 200. */
export type GetRepoWebhookConfigSuccess = {
    success: true;
    message: string;
    http_status: number;
    hook_id: number;
    config: RepoWebhookConfigItem;
    request_id: string | null;
};

export type GetRepoWebhookConfigFailure = CreateRepoFailure;

/** Success from PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config — HTTP 200. */
export type UpdateRepoWebhookConfigSuccess = {
    success: true;
    message: string;
    http_status: number;
    hook_id: number;
    config: RepoWebhookConfigItem;
    request_id: string | null;
};

export type UpdateRepoWebhookConfigFailure = CreateRepoFailure;

/** Success from PATCH /repos/{owner}/{repo}/hooks/{hook_id} — HTTP 200. */
export type UpdateRepoWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    hook_id: number;
    webhook: RepoWebhookItem;
    request_id: string | null;
};

export type UpdateRepoWebhookFailure = CreateRepoFailure;

/** Success from DELETE /repos/{owner}/{repo}/hooks/{hook_id} — HTTP 204 No Content. */
export type DeleteRepoWebhookSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    hook_id: number;
    request_id: string | null;
};

export type DeleteRepoWebhookFailure = CreateRepoFailure;

/** Success from POST /repos/{owner}/{repo}/rulesets — GitHub returns HTTP 201. */
export type CreateRepoRulesetSuccess = {
    success: true;
    message: string;
    http_status: number;
    ruleset: RepoRulesetListItem;
    request_id: string | null;
};

export type CreateRepoRulesetFailure = CreateRepoFailure;

/** Success from GET /repos/{owner}/{repo}/rulesets/{ruleset_id} — HTTP 200. */
export type GetRepoRulesetSuccess = {
    success: true;
    message: string;
    http_status: number;
    ruleset: RepoRulesetListItem;
    /** Effective `includes_parents` (`true` when omitted; matches GitHub API default). */
    includes_parents: boolean;
    request_id: string | null;
};

export type GetRepoRulesetFailure = CreateRepoFailure;

/** Success from PUT /repos/{owner}/{repo}/rulesets/{ruleset_id} — HTTP 200. */
export type UpdateRepoRulesetSuccess = {
    success: true;
    message: string;
    http_status: number;
    ruleset: RepoRulesetListItem;
    request_id: string | null;
};

export type UpdateRepoRulesetFailure = CreateRepoFailure;

/** Success from DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id} — HTTP 204 No Content. */
export type DeleteRepoRulesetSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    ruleset_id: number;
    request_id: string | null;
};

export type DeleteRepoRulesetFailure = CreateRepoFailure;

/** One version row from GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history (`version_id`, `actor`, `updated_at`, …). */
export type RepoRulesetHistoryVersionItem = Record<string, unknown>;

export type GetRepoRulesetHistorySuccess = {
    success: true;
    message: string;
    ruleset_id: number;
    versions: RepoRulesetHistoryVersionItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type GetRepoRulesetHistoryFailure = CreateRepoFailure;

/** Body from GET .../rulesets/{ruleset_id}/history/{version_id} — ruleset version fields plus `state` (ruleset snapshot). */
export type RepoRulesetVersionWithState = Record<string, unknown>;

/** Success from GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history/{version_id} — HTTP 200. */
export type GetRepoRulesetVersionSuccess = {
    success: true;
    message: string;
    http_status: number;
    ruleset_id: number;
    version_id: number;
    /** Full API object: `version_id`, `actor`, `updated_at`, `state`, etc. */
    version: RepoRulesetVersionWithState;
    request_id: string | null;
};

export type GetRepoRulesetVersionFailure = CreateRepoFailure;

/** One entry from GET /repos/{owner}/{repo}/teams. */
export type RepoTeamItem = {
    id: number;
    node_id: string;
    name: string;
    slug: string;
    description: string | null;
    privacy: string | null;
    notification_setting: string | null;
    permission: string;
    permissions: {
        pull: boolean;
        triage: boolean;
        push: boolean;
        maintain: boolean;
        admin: boolean;
    };
    url: string;
    html_url: string;
    members_url: string;
    repositories_url: string;
    type: string;
    organization_id: number | null;
    enterprise_id: number | null;
    parent: {
        id: number;
        slug: string;
        name: string;
        html_url: string;
    } | null;
};

export type ListRepoTeamsSuccess = {
    success: true;
    message: string;
    teams: RepoTeamItem[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoTeamsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/topics — topic names for the repository. */
export type ListRepoTopicsSuccess = {
    success: true;
    message: string;
    names: string[];
    /**
     * Parsed from the last response `Link` header. When `all_pages` completed fully, `null`.
     * When `truncated` is true, use `next.page` / `next.per_page` to continue.
     */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoTopicsFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/topics — replace the full set of repository topics (empty array clears). */
export type ReplaceRepoTopicsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    names: string[];
    request_id: string | null;
};

export type ReplaceRepoTopicsFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/dispatches — create a repository_dispatch event (204 No Content). */
export type CreateRepoDispatchSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    event_type: string;
    request_id: string | null;
};

export type CreateRepoDispatchFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/attestations — store a Sigstore artifact attestation. */
export type CreateRepoAttestationSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    /** Attestation id from GitHub when returned (201). */
    attestation_id: number | null;
    request_id: string | null;
};

export type CreateRepoAttestationFailure = CreateRepoFailure;

/** One artifact from the GitHub Actions artifacts API (Artifact per GitHub). */
export type ArtifactItem = Record<string, unknown>;

/** GET /repos/{owner}/{repo}/actions/artifacts — HTTP 200. MCP tool: `github_list_artifacts_for_repo`. */
export type ListArtifactsForRepoSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    artifacts: ArtifactItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListArtifactsForRepoFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id} — HTTP 200. MCP tool: `github_get_artifact`. */
export type GetArtifactSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    artifact_id: number;
    artifact: ArtifactItem;
    request_id: string | null;
};

export type GetArtifactFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id} — HTTP 204 No Content. MCP tool: `github_delete_artifact`. */
export type DeleteArtifactSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    artifact_id: number;
    request_id: string | null;
};

export type DeleteArtifactFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format} — HTTP 302 redirect. MCP tool: `github_download_artifact`. */
export type DownloadArtifactSuccess = {
    success: true;
    message: string;
    /** GitHub returns 302 Found with a Location URL to the archive. */
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    artifact_id: number;
    archive_format: string;
    /** Value of the Location header: temporary URL to download the archive (expires after 1 minute). */
    archive_download_url: string;
    request_id: string | null;
};

export type DownloadArtifactFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts — HTTP 200. MCP tool: `github_list_workflow_run_artifacts`. */
export type ListWorkflowRunArtifactsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    artifacts: ArtifactItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListWorkflowRunArtifactsFailure = CreateRepoFailure;

/** GitHub Actions cache usage summary for a repository. */
export type ActionsCacheUsageForRepo = Record<string, unknown>;

/** One repository cache-usage row from the org cache usage-by-repository API. */
export type ActionsCacheUsageByRepoItem = Record<string, unknown>;

/** One GitHub Actions cache entry. */
export type ActionsCacheItem = Record<string, unknown>;

/** GET /repos/{owner}/{repo}/actions/cache/usage — HTTP 200. MCP tool: `github_get_actions_cache_usage_for_repo`. */
export type GetActionsCacheUsageForRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    usage: ActionsCacheUsageForRepo;
    request_id: string | null;
};

export type GetActionsCacheUsageForRepoFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/cache/usage — HTTP 200. MCP tool: `github_get_actions_cache_usage_for_org`. */
export type GetActionsCacheUsageForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetActionsCacheUsageForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/cache/usage-by-repository — HTTP 200. MCP tool: `github_get_actions_cache_usage_by_repo_for_org`. */
export type GetActionsCacheUsageByRepoForOrgSuccess = {
    success: true;
    message: string;
    org: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    repository_cache_usages: ActionsCacheUsageByRepoItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type GetActionsCacheUsageByRepoForOrgFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/caches — HTTP 200. MCP tool: `github_list_actions_caches`. */
export type ListActionsCachesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    actions_caches: ActionsCacheItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListActionsCachesFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/actions/caches?key= — HTTP 200. MCP tool: `github_delete_actions_cache_by_key`. */
export type DeleteActionsCacheByKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    key: string;
    ref: string | null;
    /** Total count of caches deleted, as reported by GitHub. */
    total_count: number;
    actions_caches: ActionsCacheItem[];
    request_id: string | null;
};

export type DeleteActionsCacheByKeyFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/actions/caches/{cache_id} — HTTP 204 No Content. MCP tool: `github_delete_actions_cache_by_id`. */
export type DeleteActionsCacheByIdSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    cache_id: number;
    request_id: string | null;
};

export type DeleteActionsCacheByIdFailure = CreateRepoFailure;

/** One concurrency group entry (shape varies by endpoint). */
export type ConcurrencyGroupItem = Record<string, unknown>;

/** GET /repos/{owner}/{repo}/actions/concurrency_groups — HTTP 200. MCP tool: `github_list_concurrency_groups_for_repo`. */
export type ListConcurrencyGroupsForRepoSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    /** Total count reported by GitHub. */
    total_count: number;
    concurrency_groups: ConcurrencyGroupItem[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListConcurrencyGroupsForRepoFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/concurrency_groups/{concurrency_group_name} — HTTP 200. MCP tool: `github_get_concurrency_group`. */
export type GetConcurrencyGroupSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    concurrency_group_name: string;
    concurrency_group: ConcurrencyGroupItem;
    request_id: string | null;
};

export type GetConcurrencyGroupFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/concurrency_groups — HTTP 200. MCP tool: `github_list_concurrency_groups_for_workflow_run`. */
export type ListConcurrencyGroupsForWorkflowRunSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    /** Total count reported by GitHub. */
    total_count: number;
    concurrency_groups: ConcurrencyGroupItem[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListConcurrencyGroupsForWorkflowRunFailure = CreateRepoFailure;

/** A GitHub-hosted runner or related image/spec object (shape varies by endpoint). */
export type HostedRunnerItem = Record<string, unknown>;

/** GET /orgs/{org}/actions/hosted-runners — HTTP 200. MCP tool: `github_list_hosted_runners_for_org`. */
export type ListHostedRunnersForOrgSuccess = {
    success: true;
    message: string;
    org: string;
    total_count: number;
    runners: HostedRunnerItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListHostedRunnersForOrgFailure = CreateRepoFailure;

/** POST /orgs/{org}/actions/hosted-runners — HTTP 201. MCP tool: `github_create_hosted_runner_for_org`. */
export type CreateHostedRunnerForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner: HostedRunnerItem;
    request_id: string | null;
};

export type CreateHostedRunnerForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/images/custom — HTTP 200. MCP tool: `github_list_custom_images_for_org`. */
export type ListCustomImagesForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    total_count: number;
    images: HostedRunnerItem[];
    request_id: string | null;
};

export type ListCustomImagesForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id} — HTTP 200. MCP tool: `github_get_custom_image_for_org`. */
export type GetCustomImageForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    image_definition_id: number;
    image: HostedRunnerItem;
    request_id: string | null;
};

export type GetCustomImageForOrgFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id} — HTTP 204. MCP tool: `github_delete_custom_image_from_org`. */
export type DeleteCustomImageFromOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    image_definition_id: number;
    request_id: string | null;
};

export type DeleteCustomImageFromOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions — HTTP 200. MCP tool: `github_list_custom_image_versions_for_org`. */
export type ListCustomImageVersionsForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    image_definition_id: number;
    total_count: number;
    image_versions: HostedRunnerItem[];
    request_id: string | null;
};

export type ListCustomImageVersionsForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version} — HTTP 200. MCP tool: `github_get_custom_image_version_for_org`. */
export type GetCustomImageVersionForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    image_definition_id: number;
    version: string;
    image_version: HostedRunnerItem;
    request_id: string | null;
};

export type GetCustomImageVersionForOrgFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version} — HTTP 204. MCP tool: `github_delete_custom_image_version_from_org`. */
export type DeleteCustomImageVersionFromOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    image_definition_id: number;
    version: string;
    request_id: string | null;
};

export type DeleteCustomImageVersionFromOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/images/github-owned — HTTP 200. MCP tool: `github_get_hosted_runners_github_owned_images_for_org`. */
export type GetHostedRunnersGithubOwnedImagesForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    total_count: number;
    images: HostedRunnerItem[];
    request_id: string | null;
};

export type GetHostedRunnersGithubOwnedImagesForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/images/partner — HTTP 200. MCP tool: `github_get_hosted_runners_partner_images_for_org`. */
export type GetHostedRunnersPartnerImagesForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    total_count: number;
    images: HostedRunnerItem[];
    request_id: string | null;
};

export type GetHostedRunnersPartnerImagesForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/limits — HTTP 200. MCP tool: `github_get_hosted_runners_limits_for_org`. */
export type GetHostedRunnersLimitsForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    limits: HostedRunnerItem;
    request_id: string | null;
};

export type GetHostedRunnersLimitsForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/machine-sizes — HTTP 200. MCP tool: `github_get_hosted_runners_machine_specs_for_org`. */
export type GetHostedRunnersMachineSpecsForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    total_count: number;
    machine_specs: HostedRunnerItem[];
    request_id: string | null;
};

export type GetHostedRunnersMachineSpecsForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/platforms — HTTP 200. MCP tool: `github_get_hosted_runners_platforms_for_org`. */
export type GetHostedRunnersPlatformsForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    total_count: number;
    platforms: string[];
    request_id: string | null;
};

export type GetHostedRunnersPlatformsForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/hosted-runners/{hosted_runner_id} — HTTP 200. MCP tool: `github_get_hosted_runner_for_org`. */
export type GetHostedRunnerForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hosted_runner_id: number;
    runner: HostedRunnerItem;
    request_id: string | null;
};

export type GetHostedRunnerForOrgFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/actions/hosted-runners/{hosted_runner_id} — HTTP 200. MCP tool: `github_update_hosted_runner_for_org`. */
export type UpdateHostedRunnerForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hosted_runner_id: number;
    runner: HostedRunnerItem;
    request_id: string | null;
};

export type UpdateHostedRunnerForOrgFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/hosted-runners/{hosted_runner_id} — HTTP 202 Accepted. MCP tool: `github_delete_hosted_runner_for_org`. */
export type DeleteHostedRunnerForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    hosted_runner_id: number;
    runner: HostedRunnerItem;
    request_id: string | null;
};

export type DeleteHostedRunnerForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/oidc/customization/sub — HTTP 200. MCP tool: `github_get_oidc_custom_sub_template_for_org`. */
export type GetOidcCustomSubTemplateForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    template: Record<string, unknown>;
    request_id: string | null;
};

export type GetOidcCustomSubTemplateForOrgFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/oidc/customization/sub — HTTP 201/204. MCP tool: `github_update_oidc_custom_sub_template_for_org`. */
export type UpdateOidcCustomSubTemplateForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    include_claim_keys: string[];
    request_id: string | null;
};

export type UpdateOidcCustomSubTemplateForOrgFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/oidc/customization/sub — HTTP 200. MCP tool: `github_get_custom_oidc_sub_claim_for_repo`. */
export type GetCustomOidcSubClaimForRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    claim: Record<string, unknown>;
    request_id: string | null;
};

export type GetCustomOidcSubClaimForRepoFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/actions/oidc/customization/sub — HTTP 201. MCP tool: `github_set_custom_oidc_sub_claim_for_repo`. */
export type SetCustomOidcSubClaimForRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    use_default: boolean;
    include_claim_keys: string[] | null;
    request_id: string | null;
};

export type SetCustomOidcSubClaimForRepoFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/permissions — HTTP 200. MCP tool: `github_get_github_actions_permissions_organization`. */
export type GetGithubActionsPermissionsOrganizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    permissions: Record<string, unknown>;
    request_id: string | null;
};

export type GetGithubActionsPermissionsOrganizationFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/permissions — HTTP 204. MCP tool: `github_set_github_actions_permissions_organization`. */
export type SetGithubActionsPermissionsOrganizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    request_id: string | null;
};

export type SetGithubActionsPermissionsOrganizationFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/permissions/repositories — HTTP 200. MCP tool: `github_list_selected_repositories_enabled_github_actions_organization`. */
export type ListSelectedRepositoriesEnabledGithubActionsOrganizationSuccess = {
    success: true;
    message: string;
    org: string;
    total_count: number;
    repositories: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListSelectedRepositoriesEnabledGithubActionsOrganizationFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/permissions/repositories — HTTP 204. MCP tool: `github_set_selected_repositories_enabled_github_actions_organization`. */
export type SetSelectedRepositoriesEnabledGithubActionsOrganizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    selected_repository_ids: number[];
    request_id: string | null;
};

export type SetSelectedRepositoriesEnabledGithubActionsOrganizationFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/permissions/repositories/{repository_id} — HTTP 204. MCP tool: `github_enable_selected_repository_github_actions_organization`. */
export type EnableSelectedRepositoryGithubActionsOrganizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    repository_id: number;
    request_id: string | null;
};

export type EnableSelectedRepositoryGithubActionsOrganizationFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/permissions/repositories/{repository_id} — HTTP 204. MCP tool: `github_disable_selected_repository_github_actions_organization`. */
export type DisableSelectedRepositoryGithubActionsOrganizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    repository_id: number;
    request_id: string | null;
};

export type DisableSelectedRepositoryGithubActionsOrganizationFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/permissions/selected-actions — HTTP 200. MCP tool: `github_get_allowed_actions_organization`. */
export type GetAllowedActionsOrganizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    allowed_actions: Record<string, unknown>;
    request_id: string | null;
};

export type GetAllowedActionsOrganizationFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/permissions/selected-actions — HTTP 204. MCP tool: `github_set_allowed_actions_organization`. */
export type SetAllowedActionsOrganizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    request_id: string | null;
};

export type SetAllowedActionsOrganizationFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/permissions/workflow — HTTP 200. MCP tool: `github_get_github_actions_default_workflow_permissions_organization`. */
export type GetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    permissions: Record<string, unknown>;
    request_id: string | null;
};

export type GetGithubActionsDefaultWorkflowPermissionsOrganizationFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/permissions/workflow — HTTP 204. MCP tool: `github_set_github_actions_default_workflow_permissions_organization`. */
export type SetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    request_id: string | null;
};

export type SetGithubActionsDefaultWorkflowPermissionsOrganizationFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/permissions — HTTP 200. MCP tool: `github_get_github_actions_permissions_repository`. */
export type GetGithubActionsPermissionsRepositorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    permissions: Record<string, unknown>;
    request_id: string | null;
};

export type GetGithubActionsPermissionsRepositoryFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/actions/permissions — HTTP 204. MCP tool: `github_set_github_actions_permissions_repository`. */
export type SetGithubActionsPermissionsRepositorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type SetGithubActionsPermissionsRepositoryFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/permissions/access — HTTP 200. MCP tool: `github_get_workflow_access_to_repository`. */
export type GetWorkflowAccessToRepositorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    access: Record<string, unknown>;
    request_id: string | null;
};

export type GetWorkflowAccessToRepositoryFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/actions/permissions/access — HTTP 204. MCP tool: `github_set_workflow_access_to_repository`. */
export type SetWorkflowAccessToRepositorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    access_level: string;
    request_id: string | null;
};

export type SetWorkflowAccessToRepositoryFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/permissions/selected-actions — HTTP 200. MCP tool: `github_get_allowed_actions_repository`. */
export type GetAllowedActionsRepositorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    allowed_actions: Record<string, unknown>;
    request_id: string | null;
};

export type GetAllowedActionsRepositoryFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/actions/permissions/selected-actions — HTTP 204. MCP tool: `github_set_allowed_actions_repository`. */
export type SetAllowedActionsRepositorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type SetAllowedActionsRepositoryFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/permissions/workflow — HTTP 200. MCP tool: `github_get_github_actions_default_workflow_permissions_repository`. */
export type GetGithubActionsDefaultWorkflowPermissionsRepositorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    permissions: Record<string, unknown>;
    request_id: string | null;
};

export type GetGithubActionsDefaultWorkflowPermissionsRepositoryFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/actions/permissions/workflow — HTTP 204. MCP tool: `github_set_github_actions_default_workflow_permissions_repository`. */
export type SetGithubActionsDefaultWorkflowPermissionsRepositorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type SetGithubActionsDefaultWorkflowPermissionsRepositoryFailure = CreateRepoFailure;

/** One GitHub Actions secret (name + timestamps; org secrets also include visibility). Value is never returned. */
export type ActionsSecretItem = Record<string, unknown>;

/** A GitHub Actions public key used to encrypt secrets (`key_id`, `key`). */
export type ActionsPublicKey = Record<string, unknown>;

/** GET /orgs/{org}/actions/secrets — HTTP 200. MCP tool: `github_list_org_actions_secrets`. */
export type ListOrgActionsSecretsSuccess = {
    success: true;
    message: string;
    org: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    secrets: ActionsSecretItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgActionsSecretsFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/secrets/public-key — HTTP 200. MCP tool: `github_get_org_actions_public_key`. */
export type GetOrgActionsPublicKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    public_key: ActionsPublicKey;
    request_id: string | null;
};

export type GetOrgActionsPublicKeyFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/secrets/{secret_name} — HTTP 200. MCP tool: `github_get_org_actions_secret`. */
export type GetOrgActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    secret: ActionsSecretItem;
    request_id: string | null;
};

export type GetOrgActionsSecretFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/secrets/{secret_name} — HTTP 201 (created) or 204 (updated). MCP tool: `github_create_or_update_org_actions_secret`. */
export type CreateOrUpdateOrgActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    /** True when GitHub returned 201 (a new secret was created). */
    created: boolean;
    request_id: string | null;
};

export type CreateOrUpdateOrgActionsSecretFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/secrets/{secret_name} — HTTP 204 No Content. MCP tool: `github_delete_org_actions_secret`. */
export type DeleteOrgActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    request_id: string | null;
};

export type DeleteOrgActionsSecretFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/secrets/{secret_name}/repositories — HTTP 200. MCP tool: `github_list_selected_repos_for_org_actions_secret`. */
export type ListSelectedReposForOrgActionsSecretSuccess = {
    success: true;
    message: string;
    org: string;
    secret_name: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    repositories: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListSelectedReposForOrgActionsSecretFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/secrets/{secret_name}/repositories — HTTP 204 No Content. MCP tool: `github_set_selected_repos_for_org_actions_secret`. */
export type SetSelectedReposForOrgActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    selected_repository_ids: number[];
    request_id: string | null;
};

export type SetSelectedReposForOrgActionsSecretFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_add_selected_repo_to_org_actions_secret`. */
export type AddSelectedRepoToOrgActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    repository_id: number;
    request_id: string | null;
};

export type AddSelectedRepoToOrgActionsSecretFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_remove_selected_repo_from_org_actions_secret`. */
export type RemoveSelectedRepoFromOrgActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    repository_id: number;
    request_id: string | null;
};

export type RemoveSelectedRepoFromOrgActionsSecretFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/organization-secrets — HTTP 200. MCP tool: `github_list_repo_organization_actions_secrets`. */
export type ListRepoOrganizationActionsSecretsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    secrets: ActionsSecretItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoOrganizationActionsSecretsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/secrets — HTTP 200. MCP tool: `github_list_repo_actions_secrets`. */
export type ListRepoActionsSecretsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    secrets: ActionsSecretItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoActionsSecretsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/secrets/public-key — HTTP 200. MCP tool: `github_get_repo_actions_public_key`. */
export type GetRepoActionsPublicKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    public_key: ActionsPublicKey;
    request_id: string | null;
};

export type GetRepoActionsPublicKeyFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/secrets/{secret_name} — HTTP 200. MCP tool: `github_get_repo_actions_secret`. */
export type GetRepoActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    secret_name: string;
    secret: ActionsSecretItem;
    request_id: string | null;
};

export type GetRepoActionsSecretFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/actions/secrets/{secret_name} — HTTP 201 (created) or 204 (updated). MCP tool: `github_create_or_update_repo_actions_secret`. */
export type CreateOrUpdateRepoActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    secret_name: string;
    /** True when GitHub returned 201 (a new secret was created). */
    created: boolean;
    request_id: string | null;
};

export type CreateOrUpdateRepoActionsSecretFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name} — HTTP 204 No Content. MCP tool: `github_delete_repo_actions_secret`. */
export type DeleteRepoActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    secret_name: string;
    request_id: string | null;
};

export type DeleteRepoActionsSecretFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/environments/{environment_name}/secrets — HTTP 200. MCP tool: `github_list_environment_actions_secrets`. */
export type ListEnvironmentActionsSecretsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    secrets: ActionsSecretItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListEnvironmentActionsSecretsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key — HTTP 200. MCP tool: `github_get_environment_actions_public_key`. */
export type GetEnvironmentActionsPublicKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    public_key: ActionsPublicKey;
    request_id: string | null;
};

export type GetEnvironmentActionsPublicKeyFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name} — HTTP 200. MCP tool: `github_get_environment_actions_secret`. */
export type GetEnvironmentActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    secret_name: string;
    secret: ActionsSecretItem;
    request_id: string | null;
};

export type GetEnvironmentActionsSecretFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name} — HTTP 201 (created) or 204 (updated). MCP tool: `github_create_or_update_environment_actions_secret`. */
export type CreateOrUpdateEnvironmentActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    secret_name: string;
    /** True when GitHub returned 201 (a new secret was created). */
    created: boolean;
    request_id: string | null;
};

export type CreateOrUpdateEnvironmentActionsSecretFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name} — HTTP 204 No Content. MCP tool: `github_delete_environment_actions_secret`. */
export type DeleteEnvironmentActionsSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    secret_name: string;
    request_id: string | null;
};

export type DeleteEnvironmentActionsSecretFailure = CreateRepoFailure;

/** A self-hosted runner group object (shape varies by endpoint). */
export type RunnerGroupItem = Record<string, unknown>;

/** GET /orgs/{org}/actions/runner-groups — HTTP 200. MCP tool: `github_list_self_hosted_runner_groups_for_org`. */
export type ListSelfHostedRunnerGroupsForOrgSuccess = {
    success: true;
    message: string;
    org: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    runner_groups: RunnerGroupItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListSelfHostedRunnerGroupsForOrgFailure = CreateRepoFailure;

/** POST /orgs/{org}/actions/runner-groups — HTTP 201. MCP tool: `github_create_self_hosted_runner_group_for_org`. */
export type CreateSelfHostedRunnerGroupForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group: RunnerGroupItem;
    request_id: string | null;
};

export type CreateSelfHostedRunnerGroupForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/runner-groups/{runner_group_id} — HTTP 200. MCP tool: `github_get_self_hosted_runner_group_for_org`. */
export type GetSelfHostedRunnerGroupForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group_id: number;
    runner_group: RunnerGroupItem;
    request_id: string | null;
};

export type GetSelfHostedRunnerGroupForOrgFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/actions/runner-groups/{runner_group_id} — HTTP 200. MCP tool: `github_update_self_hosted_runner_group_for_org`. */
export type UpdateSelfHostedRunnerGroupForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group_id: number;
    runner_group: RunnerGroupItem;
    request_id: string | null;
};

export type UpdateSelfHostedRunnerGroupForOrgFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/runner-groups/{runner_group_id} — HTTP 204 No Content. MCP tool: `github_delete_self_hosted_runner_group_from_org`. */
export type DeleteSelfHostedRunnerGroupFromOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group_id: number;
    request_id: string | null;
};

export type DeleteSelfHostedRunnerGroupFromOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/runner-groups/{runner_group_id}/hosted-runners — HTTP 200. MCP tool: `github_list_github_hosted_runners_in_group_for_org`. */
export type ListGithubHostedRunnersInGroupForOrgSuccess = {
    success: true;
    message: string;
    org: string;
    runner_group_id: number;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    runners: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListGithubHostedRunnersInGroupForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories — HTTP 200. MCP tool: `github_list_repo_access_to_self_hosted_runner_group_in_org`. */
export type ListRepoAccessToSelfHostedRunnerGroupInOrgSuccess = {
    success: true;
    message: string;
    org: string;
    runner_group_id: number;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    repositories: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoAccessToSelfHostedRunnerGroupInOrgFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories — HTTP 204 No Content. MCP tool: `github_set_repo_access_to_self_hosted_runner_group_in_org`. */
export type SetRepoAccessToSelfHostedRunnerGroupInOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group_id: number;
    selected_repository_ids: number[];
    request_id: string | null;
};

export type SetRepoAccessToSelfHostedRunnerGroupInOrgFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_add_repo_access_to_self_hosted_runner_group_in_org`. */
export type AddRepoAccessToSelfHostedRunnerGroupInOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group_id: number;
    repository_id: number;
    request_id: string | null;
};

export type AddRepoAccessToSelfHostedRunnerGroupInOrgFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_remove_repo_access_to_self_hosted_runner_group_in_org`. */
export type RemoveRepoAccessToSelfHostedRunnerGroupInOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group_id: number;
    repository_id: number;
    request_id: string | null;
};

export type RemoveRepoAccessToSelfHostedRunnerGroupInOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/runner-groups/{runner_group_id}/runners — HTTP 200. MCP tool: `github_list_self_hosted_runners_in_group_for_org`. */
export type ListSelfHostedRunnersInGroupForOrgSuccess = {
    success: true;
    message: string;
    org: string;
    runner_group_id: number;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    runners: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListSelfHostedRunnersInGroupForOrgFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/runners — HTTP 204 No Content. MCP tool: `github_set_self_hosted_runners_in_group_for_org`. */
export type SetSelfHostedRunnersInGroupForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group_id: number;
    runners: number[];
    request_id: string | null;
};

export type SetSelfHostedRunnersInGroupForOrgFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/runners/{runner_id} — HTTP 204 No Content. MCP tool: `github_add_self_hosted_runner_to_group_for_org`. */
export type AddSelfHostedRunnerToGroupForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group_id: number;
    runner_id: number;
    request_id: string | null;
};

export type AddSelfHostedRunnerToGroupForOrgFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/runner-groups/{runner_group_id}/runners/{runner_id} — HTTP 204 No Content. MCP tool: `github_remove_self_hosted_runner_from_group_for_org`. */
export type RemoveSelfHostedRunnerFromGroupForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_group_id: number;
    runner_id: number;
    request_id: string | null;
};

export type RemoveSelfHostedRunnerFromGroupForOrgFailure = CreateRepoFailure;

/** A self-hosted runner object (id, name, os, status, busy, labels, …). */
export type SelfHostedRunnerItem = Record<string, unknown>;

/** A runner application download entry (os, architecture, download_url, …). */
export type RunnerApplicationItem = Record<string, unknown>;

/** A self-hosted runner label (id, name, type). */
export type SelfHostedRunnerLabelItem = Record<string, unknown>;

/** GET /orgs/{org}/actions/runners — HTTP 200. MCP tool: `github_list_self_hosted_runners_for_org`. */
export type ListSelfHostedRunnersForOrgSuccess = {
    success: true;
    message: string;
    org: string;
    total_count: number;
    runners: SelfHostedRunnerItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListSelfHostedRunnersForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/runners/downloads — HTTP 200. MCP tool: `github_list_runner_applications_for_org`. */
export type ListRunnerApplicationsForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_applications: RunnerApplicationItem[];
    request_id: string | null;
};

export type ListRunnerApplicationsForOrgFailure = CreateRepoFailure;

/** POST /orgs/{org}/actions/runners/generate-jitconfig — HTTP 201. MCP tool: `github_generate_runner_jitconfig_for_org`. */
export type GenerateRunnerJitconfigForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    jitconfig: Record<string, unknown>;
    request_id: string | null;
};

export type GenerateRunnerJitconfigForOrgFailure = CreateRepoFailure;

/** POST /orgs/{org}/actions/runners/registration-token — HTTP 201. MCP tool: `github_create_registration_token_for_org`. */
export type CreateRegistrationTokenForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    token: Record<string, unknown>;
    request_id: string | null;
};

export type CreateRegistrationTokenForOrgFailure = CreateRepoFailure;

/** POST /orgs/{org}/actions/runners/remove-token — HTTP 201. MCP tool: `github_create_remove_token_for_org`. */
export type CreateRemoveTokenForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    token: Record<string, unknown>;
    request_id: string | null;
};

export type CreateRemoveTokenForOrgFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/runners/{runner_id} — HTTP 200. MCP tool: `github_get_self_hosted_runner_for_org`. */
export type GetSelfHostedRunnerForOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_id: number;
    runner: SelfHostedRunnerItem;
    request_id: string | null;
};

export type GetSelfHostedRunnerForOrgFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/runners/{runner_id} — HTTP 204 No Content. MCP tool: `github_delete_self_hosted_runner_from_org`. */
export type DeleteSelfHostedRunnerFromOrgSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_id: number;
    request_id: string | null;
};

export type DeleteSelfHostedRunnerFromOrgFailure = CreateRepoFailure;

/** GET/POST/PUT/DELETE /orgs/{org}/actions/runners/{runner_id}/labels(/**) — HTTP 200. Org runner label tools. */
export type OrgRunnerLabelsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    runner_id: number;
    total_count: number;
    labels: SelfHostedRunnerLabelItem[];
    request_id: string | null;
};

export type ListLabelsForSelfHostedRunnerForOrgSuccess = OrgRunnerLabelsSuccess;
export type ListLabelsForSelfHostedRunnerForOrgFailure = CreateRepoFailure;
export type AddCustomLabelsToSelfHostedRunnerForOrgSuccess = OrgRunnerLabelsSuccess;
export type AddCustomLabelsToSelfHostedRunnerForOrgFailure = CreateRepoFailure;
export type SetCustomLabelsForSelfHostedRunnerForOrgSuccess = OrgRunnerLabelsSuccess;
export type SetCustomLabelsForSelfHostedRunnerForOrgFailure = CreateRepoFailure;
export type RemoveAllCustomLabelsFromSelfHostedRunnerForOrgSuccess = OrgRunnerLabelsSuccess;
export type RemoveAllCustomLabelsFromSelfHostedRunnerForOrgFailure = CreateRepoFailure;
export type RemoveCustomLabelFromSelfHostedRunnerForOrgSuccess = OrgRunnerLabelsSuccess;
export type RemoveCustomLabelFromSelfHostedRunnerForOrgFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runners — HTTP 200. MCP tool: `github_list_self_hosted_runners_for_repo`. */
export type ListSelfHostedRunnersForRepoSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    total_count: number;
    runners: SelfHostedRunnerItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListSelfHostedRunnersForRepoFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runners/downloads — HTTP 200. MCP tool: `github_list_runner_applications_for_repo`. */
export type ListRunnerApplicationsForRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    runner_applications: RunnerApplicationItem[];
    request_id: string | null;
};

export type ListRunnerApplicationsForRepoFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig — HTTP 201. MCP tool: `github_generate_runner_jitconfig_for_repo`. */
export type GenerateRunnerJitconfigForRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    jitconfig: Record<string, unknown>;
    request_id: string | null;
};

export type GenerateRunnerJitconfigForRepoFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runners/registration-token — HTTP 201. MCP tool: `github_create_registration_token_for_repo`. */
export type CreateRegistrationTokenForRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    token: Record<string, unknown>;
    request_id: string | null;
};

export type CreateRegistrationTokenForRepoFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runners/remove-token — HTTP 201. MCP tool: `github_create_remove_token_for_repo`. */
export type CreateRemoveTokenForRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    token: Record<string, unknown>;
    request_id: string | null;
};

export type CreateRemoveTokenForRepoFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runners/{runner_id} — HTTP 200. MCP tool: `github_get_self_hosted_runner_for_repo`. */
export type GetSelfHostedRunnerForRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    runner_id: number;
    runner: SelfHostedRunnerItem;
    request_id: string | null;
};

export type GetSelfHostedRunnerForRepoFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/actions/runners/{runner_id} — HTTP 204 No Content. MCP tool: `github_delete_self_hosted_runner_from_repo`. */
export type DeleteSelfHostedRunnerFromRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    runner_id: number;
    request_id: string | null;
};

export type DeleteSelfHostedRunnerFromRepoFailure = CreateRepoFailure;

/** GET/POST/PUT/DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels(/**) — HTTP 200. Repo runner label tools. */
export type RepoRunnerLabelsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    runner_id: number;
    total_count: number;
    labels: SelfHostedRunnerLabelItem[];
    request_id: string | null;
};

export type ListLabelsForSelfHostedRunnerForRepoSuccess = RepoRunnerLabelsSuccess;
export type ListLabelsForSelfHostedRunnerForRepoFailure = CreateRepoFailure;
export type AddCustomLabelsToSelfHostedRunnerForRepoSuccess = RepoRunnerLabelsSuccess;
export type AddCustomLabelsToSelfHostedRunnerForRepoFailure = CreateRepoFailure;
export type SetCustomLabelsForSelfHostedRunnerForRepoSuccess = RepoRunnerLabelsSuccess;
export type SetCustomLabelsForSelfHostedRunnerForRepoFailure = CreateRepoFailure;
export type RemoveAllCustomLabelsFromSelfHostedRunnerForRepoSuccess = RepoRunnerLabelsSuccess;
export type RemoveAllCustomLabelsFromSelfHostedRunnerForRepoFailure = CreateRepoFailure;
export type RemoveCustomLabelFromSelfHostedRunnerForRepoSuccess = RepoRunnerLabelsSuccess;
export type RemoveCustomLabelFromSelfHostedRunnerForRepoFailure = CreateRepoFailure;

/** One GitHub Actions variable (name, value, timestamps; org variables also include visibility). */
export type ActionsVariableItem = Record<string, unknown>;

/** GET /orgs/{org}/actions/variables — HTTP 200. MCP tool: `github_list_org_actions_variables`. */
export type ListOrgActionsVariablesSuccess = {
    success: true;
    message: string;
    org: string;
    total_count: number;
    variables: ActionsVariableItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgActionsVariablesFailure = CreateRepoFailure;

/** POST /orgs/{org}/actions/variables — HTTP 201. MCP tool: `github_create_org_actions_variable`. */
export type CreateOrgActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    request_id: string | null;
};

export type CreateOrgActionsVariableFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/variables/{name} — HTTP 200. MCP tool: `github_get_org_actions_variable`. */
export type GetOrgActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    variable: ActionsVariableItem;
    request_id: string | null;
};

export type GetOrgActionsVariableFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/actions/variables/{name} — HTTP 204 No Content. MCP tool: `github_update_org_actions_variable`. */
export type UpdateOrgActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    request_id: string | null;
};

export type UpdateOrgActionsVariableFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/variables/{name} — HTTP 204 No Content. MCP tool: `github_delete_org_actions_variable`. */
export type DeleteOrgActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    request_id: string | null;
};

export type DeleteOrgActionsVariableFailure = CreateRepoFailure;

/** GET /orgs/{org}/actions/variables/{name}/repositories — HTTP 200. MCP tool: `github_list_selected_repos_for_org_actions_variable`. */
export type ListSelectedReposForOrgActionsVariableSuccess = {
    success: true;
    message: string;
    org: string;
    variable_name: string;
    total_count: number;
    repositories: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListSelectedReposForOrgActionsVariableFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/variables/{name}/repositories — HTTP 204 No Content. MCP tool: `github_set_selected_repos_for_org_actions_variable`. */
export type SetSelectedReposForOrgActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    selected_repository_ids: number[];
    request_id: string | null;
};

export type SetSelectedReposForOrgActionsVariableFailure = CreateRepoFailure;

/** PUT /orgs/{org}/actions/variables/{name}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_add_selected_repo_to_org_actions_variable`. */
export type AddSelectedRepoToOrgActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    repository_id: number;
    request_id: string | null;
};

export type AddSelectedRepoToOrgActionsVariableFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/actions/variables/{name}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_remove_selected_repo_from_org_actions_variable`. */
export type RemoveSelectedRepoFromOrgActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    repository_id: number;
    request_id: string | null;
};

export type RemoveSelectedRepoFromOrgActionsVariableFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/organization-variables — HTTP 200. MCP tool: `github_list_repo_organization_actions_variables`. */
export type ListRepoOrganizationActionsVariablesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    total_count: number;
    variables: ActionsVariableItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoOrganizationActionsVariablesFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/variables — HTTP 200. MCP tool: `github_list_repo_actions_variables`. */
export type ListRepoActionsVariablesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    total_count: number;
    variables: ActionsVariableItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoActionsVariablesFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/variables — HTTP 201. MCP tool: `github_create_repo_actions_variable`. */
export type CreateRepoActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    variable_name: string;
    request_id: string | null;
};

export type CreateRepoActionsVariableFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/variables/{name} — HTTP 200. MCP tool: `github_get_repo_actions_variable`. */
export type GetRepoActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    variable_name: string;
    variable: ActionsVariableItem;
    request_id: string | null;
};

export type GetRepoActionsVariableFailure = CreateRepoFailure;

/** PATCH /repos/{owner}/{repo}/actions/variables/{name} — HTTP 204 No Content. MCP tool: `github_update_repo_actions_variable`. */
export type UpdateRepoActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    variable_name: string;
    request_id: string | null;
};

export type UpdateRepoActionsVariableFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/actions/variables/{name} — HTTP 204 No Content. MCP tool: `github_delete_repo_actions_variable`. */
export type DeleteRepoActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    variable_name: string;
    request_id: string | null;
};

export type DeleteRepoActionsVariableFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/environments/{environment_name}/variables — HTTP 200. MCP tool: `github_list_environment_actions_variables`. */
export type ListEnvironmentActionsVariablesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    total_count: number;
    variables: ActionsVariableItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListEnvironmentActionsVariablesFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/environments/{environment_name}/variables — HTTP 201. MCP tool: `github_create_environment_actions_variable`. */
export type CreateEnvironmentActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    variable_name: string;
    request_id: string | null;
};

export type CreateEnvironmentActionsVariableFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/environments/{environment_name}/variables/{name} — HTTP 200. MCP tool: `github_get_environment_actions_variable`. */
export type GetEnvironmentActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    variable_name: string;
    variable: ActionsVariableItem;
    request_id: string | null;
};

export type GetEnvironmentActionsVariableFailure = CreateRepoFailure;

/** PATCH /repos/{owner}/{repo}/environments/{environment_name}/variables/{name} — HTTP 204 No Content. MCP tool: `github_update_environment_actions_variable`. */
export type UpdateEnvironmentActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    variable_name: string;
    request_id: string | null;
};

export type UpdateEnvironmentActionsVariableFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/environments/{environment_name}/variables/{name} — HTTP 204 No Content. MCP tool: `github_delete_environment_actions_variable`. */
export type DeleteEnvironmentActionsVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    environment_name: string;
    variable_name: string;
    request_id: string | null;
};

export type DeleteEnvironmentActionsVariableFailure = CreateRepoFailure;

/** One GitHub Actions workflow job (id, run_id, status, conclusion, steps, …). */
export type WorkflowJobItem = Record<string, unknown>;

/** GET /repos/{owner}/{repo}/actions/jobs/{job_id} — HTTP 200. MCP tool: `github_get_job_for_workflow_run`. */
export type GetJobForWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    job_id: number;
    job: WorkflowJobItem;
    request_id: string | null;
};

export type GetJobForWorkflowRunFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs — HTTP 302 Found (redirect URL). MCP tool: `github_download_job_logs_for_workflow_run`. */
export type DownloadJobLogsForWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    job_id: number;
    logs_download_url: string;
    request_id: string | null;
};

export type DownloadJobLogsForWorkflowRunFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs — HTTP 200. MCP tool: `github_list_jobs_for_workflow_run_attempt`. */
export type ListJobsForWorkflowRunAttemptSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    attempt_number: number;
    total_count: number;
    jobs: WorkflowJobItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListJobsForWorkflowRunAttemptFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs — HTTP 200. MCP tool: `github_list_jobs_for_workflow_run`. */
export type ListJobsForWorkflowRunSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    filter: "latest" | "all";
    total_count: number;
    jobs: WorkflowJobItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListJobsForWorkflowRunFailure = CreateRepoFailure;

/** One GitHub Actions workflow run (id, name, status, conclusion, head_sha, …). */
export type WorkflowRunItem = Record<string, unknown>;

/** POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun — HTTP 201. MCP tool: `github_re_run_job_for_workflow_run`. */
export type ReRunJobForWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    job_id: number;
    request_id: string | null;
};

export type ReRunJobForWorkflowRunFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs — HTTP 200. MCP tool: `github_list_workflow_runs_for_repo`. */
export type ListWorkflowRunsForRepoSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    total_count: number;
    workflow_runs: WorkflowRunItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListWorkflowRunsForRepoFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id} — HTTP 200. MCP tool: `github_get_workflow_run`. */
export type GetWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    workflow_run: WorkflowRunItem;
    request_id: string | null;
};

export type GetWorkflowRunFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/actions/runs/{run_id} — HTTP 204 No Content. MCP tool: `github_delete_workflow_run`. */
export type DeleteWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    request_id: string | null;
};

export type DeleteWorkflowRunFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals — HTTP 200. MCP tool: `github_get_reviews_for_workflow_run`. */
export type GetReviewsForWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    reviews: Record<string, unknown>[];
    request_id: string | null;
};

export type GetReviewsForWorkflowRunFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve — HTTP 201. MCP tool: `github_approve_workflow_run`. */
export type ApproveWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    request_id: string | null;
};

export type ApproveWorkflowRunFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number} — HTTP 200. MCP tool: `github_get_workflow_run_attempt`. */
export type GetWorkflowRunAttemptSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    attempt_number: number;
    workflow_run: WorkflowRunItem;
    request_id: string | null;
};

export type GetWorkflowRunAttemptFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs — HTTP 302 Found. MCP tool: `github_download_workflow_run_attempt_logs`. */
export type DownloadWorkflowRunAttemptLogsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    attempt_number: number;
    logs_download_url: string;
    request_id: string | null;
};

export type DownloadWorkflowRunAttemptLogsFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel — HTTP 202 Accepted. MCP tool: `github_cancel_workflow_run`. */
export type CancelWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    request_id: string | null;
};

export type CancelWorkflowRunFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule — HTTP 204 No Content. MCP tool: `github_review_custom_gates_for_workflow_run`. */
export type ReviewCustomGatesForWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    environment_name: string;
    state: "approved" | "rejected";
    request_id: string | null;
};

export type ReviewCustomGatesForWorkflowRunFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runs/{run_id}/force-cancel — HTTP 202 Accepted. MCP tool: `github_force_cancel_workflow_run`. */
export type ForceCancelWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    request_id: string | null;
};

export type ForceCancelWorkflowRunFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs — HTTP 302 Found. MCP tool: `github_download_workflow_run_logs`. */
export type DownloadWorkflowRunLogsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    logs_download_url: string;
    request_id: string | null;
};

export type DownloadWorkflowRunLogsFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs — HTTP 204 No Content. MCP tool: `github_delete_workflow_run_logs`. */
export type DeleteWorkflowRunLogsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    request_id: string | null;
};

export type DeleteWorkflowRunLogsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments — HTTP 200. MCP tool: `github_get_pending_deployments_for_workflow_run`. */
export type GetPendingDeploymentsForWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    pending_deployments: Record<string, unknown>[];
    request_id: string | null;
};

export type GetPendingDeploymentsForWorkflowRunFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments — HTTP 200. MCP tool: `github_review_pending_deployments_for_workflow_run`. */
export type ReviewPendingDeploymentsForWorkflowRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    deployments: Record<string, unknown>[];
    request_id: string | null;
};

export type ReviewPendingDeploymentsForWorkflowRunFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun — HTTP 201. MCP tool: `github_re_run_workflow`. */
export type ReRunWorkflowSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    request_id: string | null;
};

export type ReRunWorkflowFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs — HTTP 201. MCP tool: `github_re_run_workflow_failed_jobs`. */
export type ReRunWorkflowFailedJobsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    request_id: string | null;
};

export type ReRunWorkflowFailedJobsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing — HTTP 200. MCP tool: `github_get_workflow_run_usage`. */
export type GetWorkflowRunUsageSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    run_id: number;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetWorkflowRunUsageFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs — HTTP 200. MCP tool: `github_list_workflow_runs`. */
export type ListWorkflowRunsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    workflow_id: string | number;
    total_count: number;
    workflow_runs: WorkflowRunItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListWorkflowRunsFailure = CreateRepoFailure;

// ============================================================================
// Actions — Workflows
// ============================================================================

/** A workflow object as returned by the GitHub Actions workflows API. */
export type WorkflowItem = Record<string, unknown>;

/** GET /repos/{owner}/{repo}/actions/workflows — HTTP 200. MCP tool: `github_list_repo_workflows`. */
export type ListRepoWorkflowsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    total_count: number;
    workflows: WorkflowItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoWorkflowsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/workflows/{workflow_id} — HTTP 200. MCP tool: `github_get_workflow`. */
export type GetWorkflowSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    workflow_id: string | number;
    workflow: WorkflowItem;
    request_id: string | null;
};

export type GetWorkflowFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable — HTTP 204 No Content. MCP tool: `github_disable_workflow`. */
export type DisableWorkflowSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    workflow_id: string | number;
    request_id: string | null;
};

export type DisableWorkflowFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches — HTTP 204 (or 200 with run details). MCP tool: `github_create_workflow_dispatch`. */
export type CreateWorkflowDispatchSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    workflow_id: string | number;
    ref: string;
    workflow_run_id?: number;
    run_url?: string;
    html_url?: string;
    request_id: string | null;
};

export type CreateWorkflowDispatchFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable — HTTP 204 No Content. MCP tool: `github_enable_workflow`. */
export type EnableWorkflowSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    workflow_id: string | number;
    request_id: string | null;
};

export type EnableWorkflowFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing — HTTP 200. MCP tool: `github_get_workflow_usage`. */
export type GetWorkflowUsageSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    workflow_id: string | number;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetWorkflowUsageFailure = CreateRepoFailure;

// ============================================================================
// Activity — Events
// ============================================================================

/** A GitHub event object as returned by the activity events API. */
export type EventItem = Record<string, unknown>;

/** GET /events — HTTP 200. MCP tool: `github_list_public_events`. */
export type ListPublicEventsSuccess = {
    success: true;
    message: string;
    events: EventItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListPublicEventsFailure = CreateRepoFailure;

/** GET /networks/{owner}/{repo}/events — HTTP 200. MCP tool: `github_list_public_events_for_repo_network`. */
export type ListPublicEventsForRepoNetworkSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    events: EventItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListPublicEventsForRepoNetworkFailure = CreateRepoFailure;

/** GET /orgs/{org}/events — HTTP 200. MCP tool: `github_list_public_org_events`. */
export type ListPublicOrgEventsSuccess = {
    success: true;
    message: string;
    org: string;
    events: EventItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListPublicOrgEventsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/events — HTTP 200. MCP tool: `github_list_repo_events`. */
export type ListRepoEventsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    events: EventItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoEventsFailure = CreateRepoFailure;

/** GET /users/{username}/events — HTTP 200. MCP tool: `github_list_events_for_authenticated_user`. */
export type ListEventsForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    username: string;
    events: EventItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListEventsForAuthenticatedUserFailure = CreateRepoFailure;

/** GET /users/{username}/events/orgs/{org} — HTTP 200. MCP tool: `github_list_org_events_for_authenticated_user`. */
export type ListOrgEventsForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    username: string;
    org: string;
    events: EventItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgEventsForAuthenticatedUserFailure = CreateRepoFailure;

/** GET /users/{username}/events/public — HTTP 200. MCP tool: `github_list_public_events_for_user`. */
export type ListPublicEventsForUserSuccess = {
    success: true;
    message: string;
    username: string;
    events: EventItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListPublicEventsForUserFailure = CreateRepoFailure;

/** GET /users/{username}/received_events — HTTP 200. MCP tool: `github_list_received_events_for_user`. */
export type ListReceivedEventsForUserSuccess = {
    success: true;
    message: string;
    username: string;
    events: EventItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListReceivedEventsForUserFailure = CreateRepoFailure;

/** GET /users/{username}/received_events/public — HTTP 200. MCP tool: `github_list_received_public_events_for_user`. */
export type ListReceivedPublicEventsForUserSuccess = {
    success: true;
    message: string;
    username: string;
    events: EventItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListReceivedPublicEventsForUserFailure = CreateRepoFailure;

// ============================================================================
// Activity — Feeds
// ============================================================================

/** GET /feeds — HTTP 200. MCP tool: `github_get_feeds`. */
export type GetFeedsSuccess = {
    success: true;
    message: string;
    http_status: number;
    feeds: Record<string, unknown>;
    request_id: string | null;
};

export type GetFeedsFailure = CreateRepoFailure;

// ============================================================================
// Activity — Notifications
// ============================================================================

/** A notification thread object as returned by the activity notifications API. */
export type NotificationThreadItem = Record<string, unknown>;

/** GET /notifications — HTTP 200. MCP tool: `github_list_notifications_for_authenticated_user`. */
export type ListNotificationsForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    notifications: NotificationThreadItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListNotificationsForAuthenticatedUserFailure = CreateRepoFailure;

/** PUT /notifications — HTTP 202/205. MCP tool: `github_mark_notifications_as_read`. */
export type MarkNotificationsAsReadSuccess = {
    success: true;
    message: string;
    http_status: number;
    api_message?: string;
    request_id: string | null;
};

export type MarkNotificationsAsReadFailure = CreateRepoFailure;

/** GET /notifications/threads/{thread_id} — HTTP 200. MCP tool: `github_get_thread`. */
export type GetThreadSuccess = {
    success: true;
    message: string;
    http_status: number;
    thread_id: number;
    thread: NotificationThreadItem;
    request_id: string | null;
};

export type GetThreadFailure = CreateRepoFailure;

/** PATCH /notifications/threads/{thread_id} — HTTP 205. MCP tool: `github_mark_thread_as_read`. */
export type MarkThreadAsReadSuccess = {
    success: true;
    message: string;
    http_status: number;
    thread_id: number;
    request_id: string | null;
};

export type MarkThreadAsReadFailure = CreateRepoFailure;

/** DELETE /notifications/threads/{thread_id} — HTTP 204. MCP tool: `github_mark_thread_as_done`. */
export type MarkThreadAsDoneSuccess = {
    success: true;
    message: string;
    http_status: number;
    thread_id: number;
    request_id: string | null;
};

export type MarkThreadAsDoneFailure = CreateRepoFailure;

/** GET /notifications/threads/{thread_id}/subscription — HTTP 200. MCP tool: `github_get_thread_subscription_for_authenticated_user`. */
export type GetThreadSubscriptionForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    thread_id: number;
    subscription: Record<string, unknown>;
    request_id: string | null;
};

export type GetThreadSubscriptionForAuthenticatedUserFailure = CreateRepoFailure;

/** PUT /notifications/threads/{thread_id}/subscription — HTTP 200. MCP tool: `github_set_thread_subscription`. */
export type SetThreadSubscriptionSuccess = {
    success: true;
    message: string;
    http_status: number;
    thread_id: number;
    subscription: Record<string, unknown>;
    request_id: string | null;
};

export type SetThreadSubscriptionFailure = CreateRepoFailure;

/** DELETE /notifications/threads/{thread_id}/subscription — HTTP 204. MCP tool: `github_delete_thread_subscription`. */
export type DeleteThreadSubscriptionSuccess = {
    success: true;
    message: string;
    http_status: number;
    thread_id: number;
    request_id: string | null;
};

export type DeleteThreadSubscriptionFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/notifications — HTTP 200. MCP tool: `github_list_repo_notifications_for_authenticated_user`. */
export type ListRepoNotificationsForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    notifications: NotificationThreadItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoNotificationsForAuthenticatedUserFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/notifications — HTTP 202/205. MCP tool: `github_mark_repo_notifications_as_read`. */
export type MarkRepoNotificationsAsReadSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    api_message?: string;
    url?: string;
    request_id: string | null;
};

export type MarkRepoNotificationsAsReadFailure = CreateRepoFailure;

// ============================================================================
// Activity — Starring
// ============================================================================

/** A stargazer or starred-repository object as returned by the activity starring API. */
export type StarItem = Record<string, unknown>;

/** GET /repos/{owner}/{repo}/stargazers — HTTP 200. MCP tool: `github_list_stargazers`. */
export type ListStargazersSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    stargazers: StarItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListStargazersFailure = CreateRepoFailure;

/** GET /user/starred — HTTP 200. MCP tool: `github_list_repos_starred_by_authenticated_user`. */
export type ListReposStarredByAuthenticatedUserSuccess = {
    success: true;
    message: string;
    sort: "created" | "updated";
    direction: "asc" | "desc";
    starred_repositories: StarItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListReposStarredByAuthenticatedUserFailure = CreateRepoFailure;

/** GET /user/starred/{owner}/{repo} — HTTP 204 (starred) / 404 (not starred). MCP tool: `github_check_repo_is_starred_by_authenticated_user`. */
export type CheckRepoIsStarredByAuthenticatedUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    starred: boolean;
    request_id: string | null;
};

export type CheckRepoIsStarredByAuthenticatedUserFailure = CreateRepoFailure;

/** PUT /user/starred/{owner}/{repo} — HTTP 204. MCP tool: `github_star_repo_for_authenticated_user`. */
export type StarRepoForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type StarRepoForAuthenticatedUserFailure = CreateRepoFailure;

/** DELETE /user/starred/{owner}/{repo} — HTTP 204. MCP tool: `github_unstar_repo_for_authenticated_user`. */
export type UnstarRepoForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type UnstarRepoForAuthenticatedUserFailure = CreateRepoFailure;

/** GET /users/{username}/starred — HTTP 200. MCP tool: `github_list_repos_starred_by_user`. */
export type ListReposStarredByUserSuccess = {
    success: true;
    message: string;
    username: string;
    sort: "created" | "updated";
    direction: "asc" | "desc";
    starred_repositories: StarItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListReposStarredByUserFailure = CreateRepoFailure;

// ============================================================================
// Activity — Watching
// ============================================================================

/** A watcher or watched-repository object as returned by the activity watching API. */
export type WatchItem = Record<string, unknown>;

/** GET /repos/{owner}/{repo}/subscribers — HTTP 200. MCP tool: `github_list_watchers`. */
export type ListWatchersSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    watchers: WatchItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListWatchersFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/subscription — HTTP 200 (subscribed) / 404 (not subscribed). MCP tool: `github_get_repo_subscription`. */
export type GetRepoSubscriptionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    subscribed: boolean;
    subscription: Record<string, unknown> | null;
    request_id: string | null;
};

export type GetRepoSubscriptionFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/subscription — HTTP 200. MCP tool: `github_set_repo_subscription`. */
export type SetRepoSubscriptionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    subscription: Record<string, unknown>;
    request_id: string | null;
};

export type SetRepoSubscriptionFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/subscription — HTTP 204. MCP tool: `github_delete_repo_subscription`. */
export type DeleteRepoSubscriptionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};

export type DeleteRepoSubscriptionFailure = CreateRepoFailure;

/** GET /user/subscriptions — HTTP 200. MCP tool: `github_list_watched_repos_for_authenticated_user`. */
export type ListWatchedReposForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    watched_repositories: WatchItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListWatchedReposForAuthenticatedUserFailure = CreateRepoFailure;

/** GET /users/{username}/subscriptions — HTTP 200. MCP tool: `github_list_repos_watched_by_user`. */
export type ListReposWatchedByUserSuccess = {
    success: true;
    message: string;
    username: string;
    watched_repositories: WatchItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListReposWatchedByUserFailure = CreateRepoFailure;

// ============================================================================
// Agent Tasks
// ============================================================================

/** A Copilot cloud agent task as returned by the agent-tasks API. */
export type AgentTaskItem = Record<string, unknown>;

/** GET /agents/repos/{owner}/{repo}/tasks — HTTP 200. MCP tool: `github_list_agent_tasks_for_repo`. */
export type ListAgentTasksForRepoSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    tasks: AgentTaskItem[];
    total_active_count?: number;
    total_archived_count?: number;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListAgentTasksForRepoFailure = CreateRepoFailure;

/** POST /agents/repos/{owner}/{repo}/tasks — HTTP 201. MCP tool: `github_start_agent_task`. */
export type StartAgentTaskSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    task: AgentTaskItem;
    request_id: string | null;
};

export type StartAgentTaskFailure = CreateRepoFailure;

/** GET /agents/repos/{owner}/{repo}/tasks/{task_id} — HTTP 200. MCP tool: `github_get_agent_task_for_repo`. */
export type GetAgentTaskForRepoSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    task_id: string;
    task: AgentTaskItem;
    request_id: string | null;
};

export type GetAgentTaskForRepoFailure = CreateRepoFailure;

/** GET /agents/tasks — HTTP 200. MCP tool: `github_list_agent_tasks`. */
export type ListAgentTasksSuccess = {
    success: true;
    message: string;
    tasks: AgentTaskItem[];
    total_active_count?: number;
    total_archived_count?: number;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListAgentTasksFailure = CreateRepoFailure;

/** GET /agents/tasks/{task_id} — HTTP 200. MCP tool: `github_get_agent_task`. */
export type GetAgentTaskSuccess = {
    success: true;
    message: string;
    http_status: number;
    task_id: string;
    task: AgentTaskItem;
    request_id: string | null;
};

export type GetAgentTaskFailure = CreateRepoFailure;

/** One GitHub agent secret (name + timestamps; org secrets also include visibility). Value is never returned. */
export type AgentSecretItem = Record<string, unknown>;

/** A GitHub agent public key used to encrypt secrets (`key_id`, `key`). */
export type AgentPublicKey = Record<string, unknown>;

/** GET /orgs/{org}/agents/secrets — HTTP 200. MCP tool: `github_list_org_agent_secrets`. */
export type ListOrgAgentSecretsSuccess = {
    success: true;
    message: string;
    org: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    secrets: AgentSecretItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgAgentSecretsFailure = CreateRepoFailure;

/** GET /orgs/{org}/agents/secrets/public-key — HTTP 200. MCP tool: `github_get_org_agent_public_key`. */
export type GetOrgAgentPublicKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    public_key: AgentPublicKey;
    request_id: string | null;
};

export type GetOrgAgentPublicKeyFailure = CreateRepoFailure;

/** GET /orgs/{org}/agents/secrets/{secret_name} — HTTP 200. MCP tool: `github_get_org_agent_secret`. */
export type GetOrgAgentSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    secret: AgentSecretItem;
    request_id: string | null;
};

export type GetOrgAgentSecretFailure = CreateRepoFailure;

/** PUT /orgs/{org}/agents/secrets/{secret_name} — HTTP 201 (created) or 204 (updated). MCP tool: `github_create_or_update_org_agent_secret`. */
export type CreateOrUpdateOrgAgentSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    /** True when GitHub returned 201 (a new secret was created). */
    created: boolean;
    request_id: string | null;
};

export type CreateOrUpdateOrgAgentSecretFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/agents/secrets/{secret_name} — HTTP 204 No Content. MCP tool: `github_delete_org_agent_secret`. */
export type DeleteOrgAgentSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    request_id: string | null;
};

export type DeleteOrgAgentSecretFailure = CreateRepoFailure;

/** GET /orgs/{org}/agents/secrets/{secret_name}/repositories — HTTP 200. MCP tool: `github_list_selected_repos_for_org_agent_secret`. */
export type ListSelectedReposForOrgAgentSecretSuccess = {
    success: true;
    message: string;
    org: string;
    secret_name: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    repositories: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListSelectedReposForOrgAgentSecretFailure = CreateRepoFailure;

/** PUT /orgs/{org}/agents/secrets/{secret_name}/repositories — HTTP 204 No Content. MCP tool: `github_set_selected_repos_for_org_agent_secret`. */
export type SetSelectedReposForOrgAgentSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    selected_repository_ids: number[];
    request_id: string | null;
};

export type SetSelectedReposForOrgAgentSecretFailure = CreateRepoFailure;

/** PUT /orgs/{org}/agents/secrets/{secret_name}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_add_selected_repo_to_org_agent_secret`. */
export type AddSelectedRepoToOrgAgentSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    repository_id: number;
    request_id: string | null;
};

export type AddSelectedRepoToOrgAgentSecretFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/agents/secrets/{secret_name}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_remove_selected_repo_from_org_agent_secret`. */
export type RemoveSelectedRepoFromOrgAgentSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    repository_id: number;
    request_id: string | null;
};

export type RemoveSelectedRepoFromOrgAgentSecretFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/agents/organization-secrets — HTTP 200. MCP tool: `github_list_repo_organization_agent_secrets`. */
export type ListRepoOrganizationAgentSecretsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    secrets: AgentSecretItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoOrganizationAgentSecretsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/agents/secrets — HTTP 200. MCP tool: `github_list_repo_agent_secrets`. */
export type ListRepoAgentSecretsSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    /** Total count reported by GitHub across all pages. */
    total_count: number;
    secrets: AgentSecretItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoAgentSecretsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/agents/secrets/public-key — HTTP 200. MCP tool: `github_get_repo_agent_public_key`. */
export type GetRepoAgentPublicKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    public_key: AgentPublicKey;
    request_id: string | null;
};

export type GetRepoAgentPublicKeyFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/agents/secrets/{secret_name} — HTTP 200. MCP tool: `github_get_repo_agent_secret`. */
export type GetRepoAgentSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    secret_name: string;
    secret: AgentSecretItem;
    request_id: string | null;
};

export type GetRepoAgentSecretFailure = CreateRepoFailure;

/** PUT /repos/{owner}/{repo}/agents/secrets/{secret_name} — HTTP 201 (created) or 204 (updated). MCP tool: `github_create_or_update_repo_agent_secret`. */
export type CreateOrUpdateRepoAgentSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    secret_name: string;
    /** True when GitHub returned 201 (a new secret was created). */
    created: boolean;
    request_id: string | null;
};

export type CreateOrUpdateRepoAgentSecretFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/agents/secrets/{secret_name} — HTTP 204 No Content. MCP tool: `github_delete_repo_agent_secret`. */
export type DeleteRepoAgentSecretSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    secret_name: string;
    request_id: string | null;
};

export type DeleteRepoAgentSecretFailure = CreateRepoFailure;

/** One GitHub Agents variable (name, value, timestamps; org variables also include visibility). */
export type AgentVariableItem = Record<string, unknown>;

/** GET /orgs/{org}/agents/variables — HTTP 200. MCP tool: `github_list_org_agent_variables`. */
export type ListOrgAgentVariablesSuccess = {
    success: true;
    message: string;
    org: string;
    total_count: number;
    variables: AgentVariableItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgAgentVariablesFailure = CreateRepoFailure;

/** POST /orgs/{org}/agents/variables — HTTP 201. MCP tool: `github_create_org_agent_variable`. */
export type CreateOrgAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    request_id: string | null;
};

export type CreateOrgAgentVariableFailure = CreateRepoFailure;

/** GET /orgs/{org}/agents/variables/{name} — HTTP 200. MCP tool: `github_get_org_agent_variable`. */
export type GetOrgAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    variable: AgentVariableItem;
    request_id: string | null;
};

export type GetOrgAgentVariableFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/agents/variables/{name} — HTTP 204 No Content. MCP tool: `github_update_org_agent_variable`. */
export type UpdateOrgAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    request_id: string | null;
};

export type UpdateOrgAgentVariableFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/agents/variables/{name} — HTTP 204 No Content. MCP tool: `github_delete_org_agent_variable`. */
export type DeleteOrgAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    request_id: string | null;
};

export type DeleteOrgAgentVariableFailure = CreateRepoFailure;

/** GET /orgs/{org}/agents/variables/{name}/repositories — HTTP 200. MCP tool: `github_list_selected_repos_for_org_agent_variable`. */
export type ListSelectedReposForOrgAgentVariableSuccess = {
    success: true;
    message: string;
    org: string;
    variable_name: string;
    total_count: number;
    repositories: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListSelectedReposForOrgAgentVariableFailure = CreateRepoFailure;

/** PUT /orgs/{org}/agents/variables/{name}/repositories — HTTP 204 No Content. MCP tool: `github_set_selected_repos_for_org_agent_variable`. */
export type SetSelectedReposForOrgAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    selected_repository_ids: number[];
    request_id: string | null;
};

export type SetSelectedReposForOrgAgentVariableFailure = CreateRepoFailure;

/** PUT /orgs/{org}/agents/variables/{name}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_add_selected_repo_to_org_agent_variable`. */
export type AddSelectedRepoToOrgAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    repository_id: number;
    request_id: string | null;
};

export type AddSelectedRepoToOrgAgentVariableFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/agents/variables/{name}/repositories/{repository_id} — HTTP 204 No Content. MCP tool: `github_remove_selected_repo_from_org_agent_variable`. */
export type RemoveSelectedRepoFromOrgAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    variable_name: string;
    repository_id: number;
    request_id: string | null;
};

export type RemoveSelectedRepoFromOrgAgentVariableFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/agents/organization-variables — HTTP 200. MCP tool: `github_list_repo_organization_agent_variables`. */
export type ListRepoOrganizationAgentVariablesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    total_count: number;
    variables: AgentVariableItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoOrganizationAgentVariablesFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/agents/variables — HTTP 200. MCP tool: `github_list_repo_agent_variables`. */
export type ListRepoAgentVariablesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    total_count: number;
    variables: AgentVariableItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoAgentVariablesFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/agents/variables — HTTP 201. MCP tool: `github_create_repo_agent_variable`. */
export type CreateRepoAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    variable_name: string;
    request_id: string | null;
};

export type CreateRepoAgentVariableFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/agents/variables/{name} — HTTP 200. MCP tool: `github_get_repo_agent_variable`. */
export type GetRepoAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    variable_name: string;
    variable: AgentVariableItem;
    request_id: string | null;
};

export type GetRepoAgentVariableFailure = CreateRepoFailure;

/** PATCH /repos/{owner}/{repo}/agents/variables/{name} — HTTP 204 No Content. MCP tool: `github_update_repo_agent_variable`. */
export type UpdateRepoAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    variable_name: string;
    request_id: string | null;
};

export type UpdateRepoAgentVariableFailure = CreateRepoFailure;

/** DELETE /repos/{owner}/{repo}/agents/variables/{name} — HTTP 204 No Content. MCP tool: `github_delete_repo_agent_variable`. */
export type DeleteRepoAgentVariableSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    variable_name: string;
    request_id: string | null;
};

export type DeleteRepoAgentVariableFailure = CreateRepoFailure;


// --- Apps > GitHub Apps (REST) ---

/** GitHub App object from GET /app or GET /apps/{app_slug}. */
export type GitHubAppItem = Record<string, unknown>;

/** GitHub App created from a manifest (includes client_secret, pem, webhook_secret). */
export type GitHubAppFromManifestItem = Record<string, unknown>;

/** Installation object for a GitHub App. */
export type AppInstallationItem = Record<string, unknown>;

/** Pending installation request for a GitHub App. */
export type InstallationRequestItem = Record<string, unknown>;

/** Installation access token response (token, expires_at, permissions, repositories, …). */
export type InstallationAccessTokenItem = Record<string, unknown>;

/** Scoped user access token / authorization response. */
export type ScopedAccessTokenItem = Record<string, unknown>;

/** GET /app — HTTP 200. MCP tool: `github_get_authenticated_app`. */
export type GetAuthenticatedAppSuccess = {
    success: true;
    message: string;
    http_status: number;
    app: GitHubAppItem;
    request_id: string | null;
};

export type GetAuthenticatedAppFailure = CreateRepoFailure;

/** POST /app-manifests/{code}/conversions — HTTP 201. MCP tool: `github_create_github_app_from_manifest`. */
export type CreateGithubAppFromManifestSuccess = {
    success: true;
    message: string;
    http_status: number;
    app: GitHubAppFromManifestItem;
    request_id: string | null;
};

export type CreateGithubAppFromManifestFailure = CreateRepoFailure;

/** GET /app/installation-requests — HTTP 200. MCP tool: `github_list_installation_requests_for_authenticated_app`. */
export type ListInstallationRequestsForAuthenticatedAppSuccess = {
    success: true;
    message: string;
    installation_requests: InstallationRequestItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListInstallationRequestsForAuthenticatedAppFailure = CreateRepoFailure;

/** GET /app/installations — HTTP 200. MCP tool: `github_list_installations_for_authenticated_app`. */
export type ListInstallationsForAuthenticatedAppSuccess = {
    success: true;
    message: string;
    installations: AppInstallationItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListInstallationsForAuthenticatedAppFailure = CreateRepoFailure;

/** GET /app/installations/{installation_id} — HTTP 200. MCP tool: `github_get_installation_for_authenticated_app`. */
export type GetInstallationForAuthenticatedAppSuccess = {
    success: true;
    message: string;
    http_status: number;
    installation_id: number;
    installation: AppInstallationItem;
    request_id: string | null;
};

export type GetInstallationForAuthenticatedAppFailure = CreateRepoFailure;

/** DELETE /app/installations/{installation_id} — HTTP 202. MCP tool: `github_delete_installation_for_authenticated_app`. */
export type DeleteInstallationForAuthenticatedAppSuccess = {
    success: true;
    message: string;
    http_status: number;
    installation_id: number;
    request_id: string | null;
};

export type DeleteInstallationForAuthenticatedAppFailure = CreateRepoFailure;

/** POST /app/installations/{installation_id}/access_tokens — HTTP 201. MCP tool: `github_create_installation_access_token`. */
export type CreateInstallationAccessTokenSuccess = {
    success: true;
    message: string;
    http_status: number;
    installation_id: number;
    token: InstallationAccessTokenItem;
    request_id: string | null;
};

export type CreateInstallationAccessTokenFailure = CreateRepoFailure;

/** PUT /app/installations/{installation_id}/suspended — HTTP 204. MCP tool: `github_suspend_app_installation`. */
export type SuspendAppInstallationSuccess = {
    success: true;
    message: string;
    http_status: number;
    installation_id: number;
    request_id: string | null;
};

export type SuspendAppInstallationFailure = CreateRepoFailure;

/** DELETE /app/installations/{installation_id}/suspended — HTTP 204. MCP tool: `github_unsuspend_app_installation`. */
export type UnsuspendAppInstallationSuccess = {
    success: true;
    message: string;
    http_status: number;
    installation_id: number;
    request_id: string | null;
};

export type UnsuspendAppInstallationFailure = CreateRepoFailure;

/** POST /applications/{client_id}/token/scoped — HTTP 200. MCP tool: `github_create_scoped_access_token`. */
export type CreateScopedAccessTokenSuccess = {
    success: true;
    message: string;
    http_status: number;
    client_id: string;
    authorization: ScopedAccessTokenItem;
    request_id: string | null;
};

export type CreateScopedAccessTokenFailure = CreateRepoFailure;

/** GET /apps/{app_slug} — HTTP 200. MCP tool: `github_get_app`. */
export type GetAppSuccess = {
    success: true;
    message: string;
    http_status: number;
    app_slug: string;
    app: GitHubAppItem;
    request_id: string | null;
};

export type GetAppFailure = CreateRepoFailure;

/** GET /orgs/{org}/installation — HTTP 200. MCP tool: `github_get_org_installation_for_authenticated_app`. */
export type GetOrgInstallationForAuthenticatedAppSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    installation: AppInstallationItem;
    request_id: string | null;
};

export type GetOrgInstallationForAuthenticatedAppFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/installation — HTTP 200. MCP tool: `github_get_repo_installation_for_authenticated_app`. */
export type GetRepoInstallationForAuthenticatedAppSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    installation: AppInstallationItem;
    request_id: string | null;
};

export type GetRepoInstallationForAuthenticatedAppFailure = CreateRepoFailure;

/** GET /users/{username}/installation — HTTP 200. MCP tool: `github_get_user_installation_for_authenticated_app`. */
export type GetUserInstallationForAuthenticatedAppSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    installation: AppInstallationItem;
    request_id: string | null;
};

export type GetUserInstallationForAuthenticatedAppFailure = CreateRepoFailure;

/** Repository object from installation repository list endpoints. */
export type InstallationRepositoryItem = Record<string, unknown>;

/** GET /installation/repositories — HTTP 200. MCP tool: `github_list_repos_accessible_to_installation`. */
export type ListReposAccessibleToInstallationSuccess = {
    success: true;
    message: string;
    total_count: number;
    repositories: InstallationRepositoryItem[];
    repository_selection?: string;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListReposAccessibleToInstallationFailure = CreateRepoFailure;

/** DELETE /installation/token — HTTP 204. MCP tool: `github_revoke_installation_access_token`. */
export type RevokeInstallationAccessTokenSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
};

export type RevokeInstallationAccessTokenFailure = CreateRepoFailure;

/** GET /user/installations — HTTP 200. MCP tool: `github_list_app_installations_accessible_to_user`. */
export type ListAppInstallationsAccessibleToUserSuccess = {
    success: true;
    message: string;
    total_count: number;
    installations: AppInstallationItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListAppInstallationsAccessibleToUserFailure = CreateRepoFailure;

/** GET /user/installations/{installation_id}/repositories — HTTP 200. MCP tool: `github_list_installation_repos_for_authenticated_user`. */
export type ListInstallationReposForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    installation_id: number;
    total_count: number;
    repositories: InstallationRepositoryItem[];
    repository_selection?: string;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListInstallationReposForAuthenticatedUserFailure = CreateRepoFailure;

/** PUT /user/installations/{installation_id}/repositories/{repository_id} — HTTP 204. MCP tool: `github_add_repo_to_app_installation`. */
export type AddRepoToAppInstallationSuccess = {
    success: true;
    message: string;
    http_status: number;
    installation_id: number;
    repository_id: number;
    request_id: string | null;
};

export type AddRepoToAppInstallationFailure = CreateRepoFailure;

/** DELETE /user/installations/{installation_id}/repositories/{repository_id} — HTTP 204. MCP tool: `github_remove_repo_from_app_installation`. */
export type RemoveRepoFromAppInstallationSuccess = {
    success: true;
    message: string;
    http_status: number;
    installation_id: number;
    repository_id: number;
    request_id: string | null;
};

export type RemoveRepoFromAppInstallationFailure = CreateRepoFailure;

// --- Apps > Marketplace (REST) ---

/** Marketplace listing plan object. */
export type MarketplaceListingPlanItem = Record<string, unknown>;

/** Account + marketplace purchase (GET account subscription / list accounts for a plan). */
export type MarketplacePurchaseAccountItem = Record<string, unknown>;

/** Authenticated-user marketplace purchase subscription. */
export type UserMarketplacePurchaseItem = Record<string, unknown>;

/** GET /marketplace_listing/accounts/{account_id} — HTTP 200. MCP tool: `github_get_marketplace_subscription_plan_for_account`. */
export type GetMarketplaceSubscriptionPlanForAccountSuccess = {
    success: true;
    message: string;
    http_status: number;
    account_id: number;
    account: MarketplacePurchaseAccountItem;
    request_id: string | null;
};

export type GetMarketplaceSubscriptionPlanForAccountFailure = CreateRepoFailure;

/** GET /marketplace_listing/plans — HTTP 200. MCP tool: `github_list_marketplace_plans`. */
export type ListMarketplacePlansSuccess = {
    success: true;
    message: string;
    plans: MarketplaceListingPlanItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListMarketplacePlansFailure = CreateRepoFailure;

/** GET /marketplace_listing/plans/{plan_id}/accounts — HTTP 200. MCP tool: `github_list_marketplace_accounts_for_plan`. */
export type ListMarketplaceAccountsForPlanSuccess = {
    success: true;
    message: string;
    plan_id: number;
    accounts: MarketplacePurchaseAccountItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListMarketplaceAccountsForPlanFailure = CreateRepoFailure;

/** GET /marketplace_listing/stubbed/accounts/{account_id} — HTTP 200. MCP tool: `github_get_marketplace_subscription_plan_for_account_stubbed`. */
export type GetMarketplaceSubscriptionPlanForAccountStubbedSuccess = {
    success: true;
    message: string;
    http_status: number;
    account_id: number;
    account: MarketplacePurchaseAccountItem;
    request_id: string | null;
};

export type GetMarketplaceSubscriptionPlanForAccountStubbedFailure = CreateRepoFailure;

/** GET /marketplace_listing/stubbed/plans — HTTP 200. MCP tool: `github_list_marketplace_plans_stubbed`. */
export type ListMarketplacePlansStubbedSuccess = {
    success: true;
    message: string;
    plans: MarketplaceListingPlanItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListMarketplacePlansStubbedFailure = CreateRepoFailure;

/** GET /marketplace_listing/stubbed/plans/{plan_id}/accounts — HTTP 200. MCP tool: `github_list_marketplace_accounts_for_plan_stubbed`. */
export type ListMarketplaceAccountsForPlanStubbedSuccess = {
    success: true;
    message: string;
    plan_id: number;
    accounts: MarketplacePurchaseAccountItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListMarketplaceAccountsForPlanStubbedFailure = CreateRepoFailure;

/** GET /user/marketplace_purchases — HTTP 200. MCP tool: `github_list_marketplace_purchases_for_authenticated_user`. */
export type ListMarketplacePurchasesForAuthenticatedUserSuccess = {
    success: true;
    message: string;
    purchases: UserMarketplacePurchaseItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListMarketplacePurchasesForAuthenticatedUserFailure = CreateRepoFailure;

/** GET /user/marketplace_purchases/stubbed — HTTP 200. MCP tool: `github_list_marketplace_purchases_for_authenticated_user_stubbed`. */
export type ListMarketplacePurchasesForAuthenticatedUserStubbedSuccess = {
    success: true;
    message: string;
    purchases: UserMarketplacePurchaseItem[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListMarketplacePurchasesForAuthenticatedUserStubbedFailure = CreateRepoFailure;

// --- Apps > OAuth authorizations (REST) ---

/** Authorization / token metadata from OAuth app check/reset token endpoints. */
export type OAuthAuthorizationItem = Record<string, unknown>;

/** DELETE /applications/{client_id}/grant — HTTP 204. MCP tool: `github_delete_app_authorization`. */
export type DeleteAppAuthorizationSuccess = {
    success: true;
    message: string;
    http_status: number;
    client_id: string;
    request_id: string | null;
};

export type DeleteAppAuthorizationFailure = CreateRepoFailure;

/** POST /applications/{client_id}/token — HTTP 200. MCP tool: `github_check_app_token`. */
export type CheckAppTokenSuccess = {
    success: true;
    message: string;
    http_status: number;
    client_id: string;
    authorization: OAuthAuthorizationItem;
    request_id: string | null;
};

export type CheckAppTokenFailure = CreateRepoFailure;

/** PATCH /applications/{client_id}/token — HTTP 200. MCP tool: `github_reset_app_token`. */
export type ResetAppTokenSuccess = {
    success: true;
    message: string;
    http_status: number;
    client_id: string;
    authorization: OAuthAuthorizationItem;
    request_id: string | null;
};

export type ResetAppTokenFailure = CreateRepoFailure;

/** DELETE /applications/{client_id}/token — HTTP 204. MCP tool: `github_delete_app_token`. */
export type DeleteAppTokenSuccess = {
    success: true;
    message: string;
    http_status: number;
    client_id: string;
    request_id: string | null;
};

export type DeleteAppTokenFailure = CreateRepoFailure;

// --- Apps > Webhooks (REST) ---

/** Config object from GET /app/hook/config (`url`, `content_type`, `secret`, `insecure_ssl`, …). */
export type AppWebhookConfigItem = Record<string, unknown>;

/** GET /app/hook/config — HTTP 200. MCP tool: `github_get_app_webhook_config`. JWT required. */
export type GetAppWebhookConfigSuccess = {
    success: true;
    message: string;
    http_status: number;
    config: AppWebhookConfigItem;
    request_id: string | null;
};

export type GetAppWebhookConfigFailure = CreateRepoFailure;

/** PATCH /app/hook/config — HTTP 200. MCP tool: `github_update_app_webhook_config`. JWT required. */
export type UpdateAppWebhookConfigSuccess = {
    success: true;
    message: string;
    http_status: number;
    config: AppWebhookConfigItem;
    request_id: string | null;
};

export type UpdateAppWebhookConfigFailure = CreateRepoFailure;

/** One delivery from GET /app/hook/deliveries (simple webhook delivery per GitHub). */
export type AppWebhookDeliveryItem = Record<string, unknown>;

/** GET /app/hook/deliveries — HTTP 200. MCP tool: `github_list_app_webhook_deliveries`. JWT required. Cursor pagination. */
export type ListAppWebhookDeliveriesSuccess = {
    success: true;
    message: string;
    deliveries: AppWebhookDeliveryItem[];
    pagination: GitHubCursorQueryLinkPagination | null;
    request_id: string | null;
    /** `cursor` query used for the first page in this response (omit on first page). */
    cursor: string | undefined;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListAppWebhookDeliveriesFailure = CreateRepoFailure;

/** GET /app/hook/deliveries/{delivery_id} — HTTP 200 (full delivery). MCP tool: `github_get_app_webhook_delivery`. JWT required. */
export type GetAppWebhookDeliverySuccess = {
    success: true;
    message: string;
    http_status: number;
    delivery_id: number;
    delivery: AppWebhookDeliveryItem;
    request_id: string | null;
};

export type GetAppWebhookDeliveryFailure = CreateRepoFailure;

/** POST /app/hook/deliveries/{delivery_id}/attempts — typically HTTP 202 Accepted. MCP tool: `github_redeliver_app_webhook_delivery`. JWT required. */
export type RedeliverAppWebhookDeliverySuccess = {
    success: true;
    message: string;
    http_status: number;
    delivery_id: number;
    request_id: string | null;
};

export type RedeliverAppWebhookDeliveryFailure = CreateRepoFailure;

// ============================================================================
// Billing — Advanced Security committers
// ============================================================================

/** GET /orgs/{org}/settings/billing/advanced-security — HTTP 200. MCP tool: `github_get_org_advanced_security_active_committers`. */
export type GetOrgAdvancedSecurityActiveCommittersSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    /** Totals plus `repositories` committer breakdown from the API body. */
    billing: Record<string, unknown>;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type GetOrgAdvancedSecurityActiveCommittersFailure = CreateRepoFailure;

// ============================================================================
// Billing — Budgets
// ============================================================================

/** One budget row from GET /organizations/{org}/settings/billing/budgets. */
export type OrgBudgetItem = Record<string, unknown>;

/** GET /organizations/{org}/settings/billing/budgets — HTTP 200. MCP tool: `github_list_org_budgets`. */
export type ListOrgBudgetsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    budgets: OrgBudgetItem[];
    total_count?: number;
    has_next_page?: boolean;
    /** Remaining top-level fields from the API body (e.g. `user`, `effective_budget`). */
    extra: Record<string, unknown>;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgBudgetsFailure = CreateRepoFailure;

/** POST /organizations/{org}/settings/billing/budgets — HTTP 200. MCP tool: `github_create_org_budget`. */
export type CreateOrgBudgetSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type CreateOrgBudgetFailure = CreateRepoFailure;

/** GET /organizations/{org}/settings/billing/budgets/{budget_id} — HTTP 200. MCP tool: `github_get_org_budget`. */
export type GetOrgBudgetSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    budget_id: string;
    budget: OrgBudgetItem;
    request_id: string | null;
};

export type GetOrgBudgetFailure = CreateRepoFailure;

/** PATCH /organizations/{org}/settings/billing/budgets/{budget_id} — HTTP 200. MCP tool: `github_update_org_budget`. */
export type UpdateOrgBudgetSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    budget_id: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type UpdateOrgBudgetFailure = CreateRepoFailure;

/** DELETE /organizations/{org}/settings/billing/budgets/{budget_id} — HTTP 200. MCP tool: `github_delete_org_budget`. */
export type DeleteOrgBudgetSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    budget_id: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type DeleteOrgBudgetFailure = CreateRepoFailure;

// ============================================================================
// Billing — Cost centers
// ============================================================================

/** One cost center from enterprise billing cost-centers endpoints. */
export type EnterpriseCostCenterItem = Record<string, unknown>;

/** GET /enterprises/{enterprise}/settings/billing/cost-centers — HTTP 200. MCP tool: `github_list_enterprise_cost_centers`. */
export type ListEnterpriseCostCentersSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    cost_centers: EnterpriseCostCenterItem[];
    request_id: string | null;
};

export type ListEnterpriseCostCentersFailure = CreateRepoFailure;

/** POST /enterprises/{enterprise}/settings/billing/cost-centers — HTTP 200. MCP tool: `github_create_enterprise_cost_center`. */
export type CreateEnterpriseCostCenterSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    cost_center: EnterpriseCostCenterItem;
    request_id: string | null;
};

export type CreateEnterpriseCostCenterFailure = CreateRepoFailure;

/** GET /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id} — HTTP 200. MCP tool: `github_get_enterprise_cost_center`. */
export type GetEnterpriseCostCenterSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    cost_center_id: string;
    cost_center: EnterpriseCostCenterItem;
    request_id: string | null;
};

export type GetEnterpriseCostCenterFailure = CreateRepoFailure;

/** PATCH /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id} — HTTP 200. MCP tool: `github_update_enterprise_cost_center`. */
export type UpdateEnterpriseCostCenterSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    cost_center_id: string;
    cost_center: EnterpriseCostCenterItem;
    request_id: string | null;
};

export type UpdateEnterpriseCostCenterFailure = CreateRepoFailure;

/** DELETE /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id} — HTTP 200. MCP tool: `github_delete_enterprise_cost_center`. */
export type DeleteEnterpriseCostCenterSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    cost_center_id: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type DeleteEnterpriseCostCenterFailure = CreateRepoFailure;

/** POST …/cost-centers/{cost_center_id}/resource — HTTP 200. MCP tool: `github_add_resources_to_enterprise_cost_center`. */
export type AddResourcesToEnterpriseCostCenterSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    cost_center_id: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type AddResourcesToEnterpriseCostCenterFailure = CreateRepoFailure;

/** DELETE …/cost-centers/{cost_center_id}/resource — HTTP 200. MCP tool: `github_remove_resources_from_enterprise_cost_center`. */
export type RemoveResourcesFromEnterpriseCostCenterSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    cost_center_id: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type RemoveResourcesFromEnterpriseCostCenterFailure = CreateRepoFailure;

// ============================================================================
// Billing — Usage
// ============================================================================

/** GET /organizations/{org}/settings/billing/ai_credit/usage — HTTP 200. MCP tool: `github_get_org_ai_credit_billing_usage`. */
export type GetOrgAiCreditBillingUsageSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetOrgAiCreditBillingUsageFailure = CreateRepoFailure;

/** GET /organizations/{org}/settings/billing/premium_request/usage — HTTP 200. MCP tool: `github_get_org_premium_request_billing_usage`. */
export type GetOrgPremiumRequestBillingUsageSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetOrgPremiumRequestBillingUsageFailure = CreateRepoFailure;

/** GET /organizations/{org}/settings/billing/usage — HTTP 200. MCP tool: `github_get_org_billing_usage`. */
export type GetOrgBillingUsageSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetOrgBillingUsageFailure = CreateRepoFailure;

/** GET /organizations/{org}/settings/billing/usage/summary — HTTP 200. MCP tool: `github_get_org_billing_usage_summary`. Public preview. */
export type GetOrgBillingUsageSummarySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetOrgBillingUsageSummaryFailure = CreateRepoFailure;

/** GET /users/{username}/settings/billing/ai_credit/usage — HTTP 200. MCP tool: `github_get_user_ai_credit_billing_usage`. */
export type GetUserAiCreditBillingUsageSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetUserAiCreditBillingUsageFailure = CreateRepoFailure;

/** GET /users/{username}/settings/billing/premium_request/usage — HTTP 200. MCP tool: `github_get_user_premium_request_billing_usage`. */
export type GetUserPremiumRequestBillingUsageSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetUserPremiumRequestBillingUsageFailure = CreateRepoFailure;

/** GET /users/{username}/settings/billing/usage — HTTP 200. MCP tool: `github_get_user_billing_usage`. */
export type GetUserBillingUsageSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetUserBillingUsageFailure = CreateRepoFailure;

/** GET /users/{username}/settings/billing/usage/summary — HTTP 200. MCP tool: `github_get_user_billing_usage_summary`. Public preview. */
export type GetUserBillingUsageSummarySuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    usage: Record<string, unknown>;
    request_id: string | null;
};

export type GetUserBillingUsageSummaryFailure = CreateRepoFailure;

// ============================================================================
// Billing — Usage reports
// ============================================================================

/** One export from GET /enterprises/{enterprise}/settings/billing/reports. */
export type EnterpriseUsageReportExportItem = Record<string, unknown>;

/** GET /enterprises/{enterprise}/settings/billing/reports — HTTP 200. MCP tool: `github_list_enterprise_usage_report_exports`. */
export type ListEnterpriseUsageReportExportsSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    usage_report_exports: EnterpriseUsageReportExportItem[];
    request_id: string | null;
};

export type ListEnterpriseUsageReportExportsFailure = CreateRepoFailure;

/** POST /enterprises/{enterprise}/settings/billing/reports — HTTP 202. MCP tool: `github_create_enterprise_usage_report_export`. */
export type CreateEnterpriseUsageReportExportSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    report: EnterpriseUsageReportExportItem;
    request_id: string | null;
};

export type CreateEnterpriseUsageReportExportFailure = CreateRepoFailure;

/** GET /enterprises/{enterprise}/settings/billing/reports/{report_id} — HTTP 200. MCP tool: `github_get_enterprise_usage_report_export`. */
export type GetEnterpriseUsageReportExportSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    report_id: string;
    report: EnterpriseUsageReportExportItem;
    request_id: string | null;
};

export type GetEnterpriseUsageReportExportFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/branches — HTTP 200. MCP tool: `github_list_repo_branches`. */
export type ListRepoBranchesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    branches: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoBranchesFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/branches/{branch} — HTTP 200. MCP tool: `github_get_repo_branch`. */
export type GetRepoBranchSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type GetRepoBranchFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/branches/{branch}/rename — HTTP 201. MCP tool: `github_rename_repo_branch`. */
export type RenameRepoBranchSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    new_name: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type RenameRepoBranchFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/merge-upstream — HTTP 200. MCP tool: `github_sync_fork_branch_with_upstream`. */
export type SyncForkBranchWithUpstreamSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type SyncForkBranchWithUpstreamFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/merges — HTTP 201 or 204. MCP tool: `github_merge_repo_branch`. */
export type MergeRepoBranchSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    base: string;
    head: string;
    merge: Record<string, unknown> | null;
    request_id: string | null;
};

export type MergeRepoBranchFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_branch_protection`. */
export type GetRepoBranchProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    protection: Record<string, unknown>;
    request_id: string | null;
};

export type GetRepoBranchProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_branch_protection`. */
export type UpdateRepoBranchProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    protection: Record<string, unknown>;
    request_id: string | null;
};

export type UpdateRepoBranchProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_branch_protection`. */
export type DeleteRepoBranchProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    request_id: string | null;
};

export type DeleteRepoBranchProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_get_admin_branch_protection`. */
export type GetAdminBranchProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    enforce_admins: Record<string, unknown>;
    request_id: string | null;
};

export type GetAdminBranchProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_set_admin_branch_protection`. */
export type SetAdminBranchProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    enforce_admins: Record<string, unknown>;
    request_id: string | null;
};

export type SetAdminBranchProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_admin_branch_protection`. */
export type DeleteAdminBranchProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    request_id: string | null;
};

export type DeleteAdminBranchProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_get_pull_request_review_protection`. */
export type GetPullRequestReviewProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    required_pull_request_reviews: Record<string, unknown>;
    request_id: string | null;
};

export type GetPullRequestReviewProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_update_pull_request_review_protection`. */
export type UpdatePullRequestReviewProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    required_pull_request_reviews: Record<string, unknown>;
    request_id: string | null;
};

export type UpdatePullRequestReviewProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_pull_request_review_protection`. */
export type DeletePullRequestReviewProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    request_id: string | null;
};

export type DeletePullRequestReviewProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_get_commit_signature_protection`. */
export type GetCommitSignatureProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    required_signatures: Record<string, unknown>;
    request_id: string | null;
};

export type GetCommitSignatureProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_create_commit_signature_protection`. */
export type CreateCommitSignatureProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    required_signatures: Record<string, unknown>;
    request_id: string | null;
};

export type CreateCommitSignatureProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_commit_signature_protection`. */
export type DeleteCommitSignatureProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    request_id: string | null;
};

export type DeleteCommitSignatureProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_get_status_checks_protection`. */
export type GetStatusChecksProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    required_status_checks: Record<string, unknown>;
    request_id: string | null;
};

export type GetStatusChecksProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_update_status_check_protection`. */
export type UpdateStatusCheckProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    required_status_checks: Record<string, unknown>;
    request_id: string | null;
};

export type UpdateStatusCheckProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_remove_status_check_protection`. */
export type RemoveStatusCheckProtectionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    request_id: string | null;
};

export type RemoveStatusCheckProtectionFailure = CreateRepoFailure;

/** MCP tool: `github_get_all_status_check_contexts`. */
export type GetAllStatusCheckContextsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    contexts: unknown[];
    request_id: string | null;
};

export type GetAllStatusCheckContextsFailure = CreateRepoFailure;

/** MCP tool: `github_add_status_check_contexts`. */
export type AddStatusCheckContextsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    contexts: unknown[];
    request_id: string | null;
};

export type AddStatusCheckContextsFailure = CreateRepoFailure;

/** MCP tool: `github_set_status_check_contexts`. */
export type SetStatusCheckContextsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    contexts: unknown[];
    request_id: string | null;
};

export type SetStatusCheckContextsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_status_check_contexts`. */
export type RemoveStatusCheckContextsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    contexts: unknown[];
    request_id: string | null;
};

export type RemoveStatusCheckContextsFailure = CreateRepoFailure;

/** MCP tool: `github_get_access_restrictions`. */
export type GetAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    restrictions: Record<string, unknown>;
    request_id: string | null;
};

export type GetAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_delete_access_restrictions`. */
export type DeleteAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    request_id: string | null;
};

export type DeleteAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_get_apps_with_access_to_protected_branch`. */
export type GetAppsWithAccessToProtectedBranchSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    apps: unknown[];
    request_id: string | null;
};

export type GetAppsWithAccessToProtectedBranchFailure = CreateRepoFailure;

/** MCP tool: `github_add_app_access_restrictions`. */
export type AddAppAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    apps: unknown[];
    request_id: string | null;
};

export type AddAppAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_set_app_access_restrictions`. */
export type SetAppAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    apps: unknown[];
    request_id: string | null;
};

export type SetAppAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_app_access_restrictions`. */
export type RemoveAppAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    apps: unknown[];
    request_id: string | null;
};

export type RemoveAppAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_get_teams_with_access_to_protected_branch`. */
export type GetTeamsWithAccessToProtectedBranchSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    teams: unknown[];
    request_id: string | null;
};

export type GetTeamsWithAccessToProtectedBranchFailure = CreateRepoFailure;

/** MCP tool: `github_add_team_access_restrictions`. */
export type AddTeamAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    teams: unknown[];
    request_id: string | null;
};

export type AddTeamAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_set_team_access_restrictions`. */
export type SetTeamAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    teams: unknown[];
    request_id: string | null;
};

export type SetTeamAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_team_access_restrictions`. */
export type RemoveTeamAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    teams: unknown[];
    request_id: string | null;
};

export type RemoveTeamAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_get_users_with_access_to_protected_branch`. */
export type GetUsersWithAccessToProtectedBranchSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    users: unknown[];
    request_id: string | null;
};

export type GetUsersWithAccessToProtectedBranchFailure = CreateRepoFailure;

/** MCP tool: `github_add_user_access_restrictions`. */
export type AddUserAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    users: unknown[];
    request_id: string | null;
};

export type AddUserAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_set_user_access_restrictions`. */
export type SetUserAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    users: unknown[];
    request_id: string | null;
};

export type SetUserAccessRestrictionsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_user_access_restrictions`. */
export type RemoveUserAccessRestrictionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    branch: string;
    users: unknown[];
    request_id: string | null;
};

export type RemoveUserAccessRestrictionsFailure = CreateRepoFailure;

/** GET /orgs/{org}/campaigns — HTTP 200. MCP tool: `github_list_org_campaigns`. */
export type ListOrgCampaignsSuccess = {
    success: true;
    message: string;
    org: string;
    campaigns: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgCampaignsFailure = CreateRepoFailure;

/** POST /orgs/{org}/campaigns — HTTP 200. MCP tool: `github_create_org_campaign`. */
export type CreateOrgCampaignSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    campaign: Record<string, unknown>;
    request_id: string | null;
};

export type CreateOrgCampaignFailure = CreateRepoFailure;

/** GET /orgs/{org}/campaigns/{campaign_number} — HTTP 200. MCP tool: `github_get_org_campaign`. */
export type GetOrgCampaignSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    campaign_number: number;
    campaign: Record<string, unknown>;
    request_id: string | null;
};

export type GetOrgCampaignFailure = CreateRepoFailure;

/** PATCH /orgs/{org}/campaigns/{campaign_number} — HTTP 200. MCP tool: `github_update_org_campaign`. */
export type UpdateOrgCampaignSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    campaign_number: number;
    campaign: Record<string, unknown>;
    request_id: string | null;
};

export type UpdateOrgCampaignFailure = CreateRepoFailure;

/** DELETE /orgs/{org}/campaigns/{campaign_number} — HTTP 204. MCP tool: `github_delete_org_campaign`. */
export type DeleteOrgCampaignSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    campaign_number: number;
    request_id: string | null;
};

export type DeleteOrgCampaignFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/check-runs — HTTP 201. MCP tool: `github_create_check_run`. */
export type CreateCheckRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    check_run: Record<string, unknown>;
    request_id: string | null;
};

export type CreateCheckRunFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/check-runs/{check_run_id} — HTTP 200. MCP tool: `github_get_check_run`. */
export type GetCheckRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    check_run_id: number;
    check_run: Record<string, unknown>;
    request_id: string | null;
};

export type GetCheckRunFailure = CreateRepoFailure;

/** PATCH /repos/{owner}/{repo}/check-runs/{check_run_id} — HTTP 200. MCP tool: `github_update_check_run`. */
export type UpdateCheckRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    check_run_id: number;
    check_run: Record<string, unknown>;
    request_id: string | null;
};

export type UpdateCheckRunFailure = CreateRepoFailure;

/** GET .../check-runs/{check_run_id}/annotations — HTTP 200. MCP tool: `github_list_check_run_annotations`. */
export type ListCheckRunAnnotationsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    check_run_id: number;
    annotations: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListCheckRunAnnotationsFailure = CreateRepoFailure;

/** POST .../check-runs/{check_run_id}/rerequest — HTTP 201. MCP tool: `github_rerequest_check_run`. */
export type RerequestCheckRunSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    check_run_id: number;
    request_id: string | null;
};

export type RerequestCheckRunFailure = CreateRepoFailure;

/** GET .../check-suites/{check_suite_id}/check-runs — HTTP 200. MCP tool: `github_list_check_runs_for_suite`. */
export type ListCheckRunsForSuiteSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    check_suite_id: number;
    total_count: number;
    check_runs: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListCheckRunsForSuiteFailure = CreateRepoFailure;

/** GET .../commits/{ref}/check-runs — HTTP 200. MCP tool: `github_list_check_runs_for_ref`. */
export type ListCheckRunsForRefSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    ref: string;
    total_count: number;
    check_runs: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListCheckRunsForRefFailure = CreateRepoFailure;

/** POST /repos/{owner}/{repo}/check-suites — HTTP 200 or 201. MCP tool: `github_create_check_suite`. */
export type CreateCheckSuiteSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    check_suite: Record<string, unknown>;
    request_id: string | null;
};

export type CreateCheckSuiteFailure = CreateRepoFailure;

/** PATCH /repos/{owner}/{repo}/check-suites/preferences — HTTP 200. MCP tool: `github_set_check_suites_preferences`. */
export type SetCheckSuitesPreferencesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    preferences: Record<string, unknown>;
    request_id: string | null;
};

export type SetCheckSuitesPreferencesFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/check-suites/{check_suite_id} — HTTP 200. MCP tool: `github_get_check_suite`. */
export type GetCheckSuiteSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    check_suite_id: number;
    check_suite: Record<string, unknown>;
    request_id: string | null;
};

export type GetCheckSuiteFailure = CreateRepoFailure;

/** POST .../check-suites/{check_suite_id}/rerequest — HTTP 201. MCP tool: `github_rerequest_check_suite`. */
export type RerequestCheckSuiteSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    check_suite_id: number;
    request_id: string | null;
};

export type RerequestCheckSuiteFailure = CreateRepoFailure;

/** GET .../commits/{ref}/check-suites — HTTP 200. MCP tool: `github_list_check_suites_for_ref`. */
export type ListCheckSuitesForRefSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    ref: string;
    total_count: number;
    check_suites: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListCheckSuitesForRefFailure = CreateRepoFailure;

/** GET /assignments/{assignment_id} — HTTP 200. MCP tool: `github_get_classroom_assignment`. */
export type GetClassroomAssignmentSuccess = {
    success: true;
    message: string;
    http_status: number;
    assignment_id: number;
    assignment: Record<string, unknown>;
    request_id: string | null;
};

export type GetClassroomAssignmentFailure = CreateRepoFailure;

/** GET /assignments/{assignment_id}/accepted_assignments — HTTP 200. MCP tool: `github_list_accepted_classroom_assignments`. */
export type ListAcceptedClassroomAssignmentsSuccess = {
    success: true;
    message: string;
    assignment_id: number;
    accepted_assignments: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListAcceptedClassroomAssignmentsFailure = CreateRepoFailure;

/** GET /assignments/{assignment_id}/grades — HTTP 200. MCP tool: `github_get_classroom_assignment_grades`. */
export type GetClassroomAssignmentGradesSuccess = {
    success: true;
    message: string;
    http_status: number;
    assignment_id: number;
    grades: Record<string, unknown>[];
    request_id: string | null;
};

export type GetClassroomAssignmentGradesFailure = CreateRepoFailure;

/** GET /classrooms — HTTP 200. MCP tool: `github_list_classrooms`. */
export type ListClassroomsSuccess = {
    success: true;
    message: string;
    classrooms: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListClassroomsFailure = CreateRepoFailure;

/** GET /classrooms/{classroom_id} — HTTP 200. MCP tool: `github_get_classroom`. */
export type GetClassroomSuccess = {
    success: true;
    message: string;
    http_status: number;
    classroom_id: number;
    classroom: Record<string, unknown>;
    request_id: string | null;
};

export type GetClassroomFailure = CreateRepoFailure;

/** GET /classrooms/{classroom_id}/assignments — HTTP 200. MCP tool: `github_list_classroom_assignments`. */
export type ListClassroomAssignmentsSuccess = {
    success: true;
    message: string;
    classroom_id: number;
    assignments: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListClassroomAssignmentsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/code-quality/findings — HTTP 200. MCP tool: `github_list_repo_code_quality_findings`. */
export type ListRepoCodeQualityFindingsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    findings: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoCodeQualityFindingsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/code-quality/findings/{finding_number} — HTTP 200. MCP tool: `github_get_repo_code_quality_finding`. */
export type GetRepoCodeQualityFindingSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    finding_number: number;
    finding: Record<string, unknown>;
    request_id: string | null;
};

export type GetRepoCodeQualityFindingFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/code-quality/setup — HTTP 200. MCP tool: `github_get_repo_code_quality_setup`. */
export type GetRepoCodeQualitySetupSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    setup: Record<string, unknown>;
    request_id: string | null;
};

export type GetRepoCodeQualitySetupFailure = CreateRepoFailure;

/** PATCH /repos/{owner}/{repo}/code-quality/setup — HTTP 200 or 202. MCP tool: `github_update_repo_code_quality_setup`. */
export type UpdateRepoCodeQualitySetupSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    result: Record<string, unknown>;
    request_id: string | null;
};

export type UpdateRepoCodeQualitySetupFailure = CreateRepoFailure;

/** GET /orgs/{org}/dismissal-requests/code-scanning — HTTP 200. MCP tool: `github_list_org_code_scanning_dismissal_requests`. */
export type ListOrgCodeScanningDismissalRequestsSuccess = {
    success: true;
    message: string;
    org: string;
    dismissal_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListOrgCodeScanningDismissalRequestsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/dismissal-requests/code-scanning — HTTP 200. MCP tool: `github_list_repo_code_scanning_dismissal_requests`. */
export type ListRepoCodeScanningDismissalRequestsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    dismissal_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};

export type ListRepoCodeScanningDismissalRequestsFailure = CreateRepoFailure;

/** GET .../dismissal-requests/code-scanning/{alert_number} — HTTP 200. MCP tool: `github_get_repo_code_scanning_dismissal_request`. */
export type GetRepoCodeScanningDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    dismissal_request: Record<string, unknown>;
    request_id: string | null;
};

export type GetRepoCodeScanningDismissalRequestFailure = CreateRepoFailure;

/** PATCH .../dismissal-requests/code-scanning/{alert_number} — HTTP 204. MCP tool: `github_review_repo_code_scanning_dismissal_request`. */
export type ReviewRepoCodeScanningDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    request_id: string | null;
};

export type ReviewRepoCodeScanningDismissalRequestFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_code_scanning_alerts`. */
export type ListOrgCodeScanningAlertsSuccess = {
    success: true;
    message: string;
    org: string;
    alerts: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgCodeScanningAlertsFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_code_scanning_alerts`. */
export type ListRepoCodeScanningAlertsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    alerts: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoCodeScanningAlertsFailure = CreateRepoFailure;

/** MCP tool: `github_list_code_scanning_alert_instances`. */
export type ListCodeScanningAlertInstancesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    alert_number: number;
    instances: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListCodeScanningAlertInstancesFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_code_scanning_analyses`. */
export type ListRepoCodeScanningAnalysesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    analyses: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoCodeScanningAnalysesFailure = CreateRepoFailure;

/** MCP tool: `github_get_code_scanning_alert`. */
export type GetCodeScanningAlertSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    alert: Record<string, unknown>;
    request_id: string | null;
};
export type GetCodeScanningAlertFailure = CreateRepoFailure;

/** MCP tool: `github_update_code_scanning_alert`. */
export type UpdateCodeScanningAlertSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    alert: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateCodeScanningAlertFailure = CreateRepoFailure;

/** MCP tool: `github_get_code_scanning_autofix`. */
export type GetCodeScanningAutofixSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    autofix: Record<string, unknown>;
    request_id: string | null;
};
export type GetCodeScanningAutofixFailure = CreateRepoFailure;

/** MCP tool: `github_create_code_scanning_autofix`. */
export type CreateCodeScanningAutofixSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    autofix: Record<string, unknown>;
    request_id: string | null;
};
export type CreateCodeScanningAutofixFailure = CreateRepoFailure;

/** MCP tool: `github_commit_code_scanning_autofix`. */
export type CommitCodeScanningAutofixSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    commit: Record<string, unknown>;
    request_id: string | null;
};
export type CommitCodeScanningAutofixFailure = CreateRepoFailure;

/** MCP tool: `github_get_code_scanning_analysis`. */
export type GetCodeScanningAnalysisSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    analysis_id: number;
    analysis: Record<string, unknown>;
    request_id: string | null;
};
export type GetCodeScanningAnalysisFailure = CreateRepoFailure;

/** MCP tool: `github_delete_code_scanning_analysis`. */
export type DeleteCodeScanningAnalysisSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    analysis_id: number;
    deletion: Record<string, unknown>;
    request_id: string | null;
};
export type DeleteCodeScanningAnalysisFailure = CreateRepoFailure;

/** MCP tool: `github_list_codeql_databases`. */
export type ListCodeqlDatabasesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    databases: Record<string, unknown>[];
    request_id: string | null;
};
export type ListCodeqlDatabasesFailure = CreateRepoFailure;

/** MCP tool: `github_get_codeql_database`. */
export type GetCodeqlDatabaseSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    language: string;
    database: Record<string, unknown>;
    request_id: string | null;
};
export type GetCodeqlDatabaseFailure = CreateRepoFailure;

/** MCP tool: `github_delete_codeql_database`. */
export type DeleteCodeqlDatabaseSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    language: string;
    request_id: string | null;
};
export type DeleteCodeqlDatabaseFailure = CreateRepoFailure;

/** MCP tool: `github_create_codeql_variant_analysis`. */
export type CreateCodeqlVariantAnalysisSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    variant_analysis: Record<string, unknown>;
    request_id: string | null;
};
export type CreateCodeqlVariantAnalysisFailure = CreateRepoFailure;

/** MCP tool: `github_get_codeql_variant_analysis`. */
export type GetCodeqlVariantAnalysisSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    codeql_variant_analysis_id: number;
    variant_analysis: Record<string, unknown>;
    request_id: string | null;
};
export type GetCodeqlVariantAnalysisFailure = CreateRepoFailure;

/** MCP tool: `github_get_codeql_variant_analysis_repo_task`. */
export type GetCodeqlVariantAnalysisRepoTaskSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    codeql_variant_analysis_id: number;
    repo_owner: string;
    repo_name: string;
    task: Record<string, unknown>;
    request_id: string | null;
};
export type GetCodeqlVariantAnalysisRepoTaskFailure = CreateRepoFailure;

/** MCP tool: `github_get_code_scanning_default_setup`. */
export type GetCodeScanningDefaultSetupSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    setup: Record<string, unknown>;
    request_id: string | null;
};
export type GetCodeScanningDefaultSetupFailure = CreateRepoFailure;

/** MCP tool: `github_update_code_scanning_default_setup`. */
export type UpdateCodeScanningDefaultSetupSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateCodeScanningDefaultSetupFailure = CreateRepoFailure;

/** MCP tool: `github_upload_code_scanning_sarif`. */
export type UploadCodeScanningSarifSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    receipt: Record<string, unknown>;
    request_id: string | null;
};
export type UploadCodeScanningSarifFailure = CreateRepoFailure;

/** MCP tool: `github_get_code_scanning_sarif`. */
export type GetCodeScanningSarifSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    sarif_id: string;
    status: Record<string, unknown>;
    request_id: string | null;
};
export type GetCodeScanningSarifFailure = CreateRepoFailure;

/** MCP tool: `github_list_enterprise_code_security_configurations`. */
export type ListEnterpriseCodeSecurityConfigurationsSuccess = {
    success: true;
    message: string;
    enterprise: string;
    configurations: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListEnterpriseCodeSecurityConfigurationsFailure = CreateRepoFailure;

/** MCP tool: `github_create_enterprise_code_security_configuration`. */
export type CreateEnterpriseCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    configuration: Record<string, unknown>;
    request_id: string | null;
};
export type CreateEnterpriseCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_list_enterprise_code_security_default_configurations`. */
export type ListEnterpriseCodeSecurityDefaultConfigurationsSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    defaults: Record<string, unknown>[];
    request_id: string | null;
};
export type ListEnterpriseCodeSecurityDefaultConfigurationsFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_code_security_configuration`. */
export type GetEnterpriseCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    configuration_id: number;
    configuration: Record<string, unknown>;
    request_id: string | null;
};
export type GetEnterpriseCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_update_enterprise_code_security_configuration`. */
export type UpdateEnterpriseCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    configuration_id: number;
    configuration: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateEnterpriseCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_delete_enterprise_code_security_configuration`. */
export type DeleteEnterpriseCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    configuration_id: number;
    request_id: string | null;
};
export type DeleteEnterpriseCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_attach_enterprise_code_security_configuration`. */
export type AttachEnterpriseCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    configuration_id: number;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type AttachEnterpriseCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_set_enterprise_code_security_configuration_as_default`. */
export type SetEnterpriseCodeSecurityConfigurationAsDefaultSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    configuration_id: number;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type SetEnterpriseCodeSecurityConfigurationAsDefaultFailure = CreateRepoFailure;

/** MCP tool: `github_list_enterprise_code_security_configuration_repositories`. */
export type ListEnterpriseCodeSecurityConfigurationRepositoriesSuccess = {
    success: true;
    message: string;
    enterprise: string;
    configuration_id: number;
    repositories: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListEnterpriseCodeSecurityConfigurationRepositoriesFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_code_security_configurations`. */
export type ListOrgCodeSecurityConfigurationsSuccess = {
    success: true;
    message: string;
    org: string;
    configurations: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgCodeSecurityConfigurationsFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_code_security_configuration`. */
export type CreateOrgCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    configuration: Record<string, unknown>;
    request_id: string | null;
};
export type CreateOrgCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_code_security_default_configurations`. */
export type ListOrgCodeSecurityDefaultConfigurationsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    defaults: Record<string, unknown>[];
    request_id: string | null;
};
export type ListOrgCodeSecurityDefaultConfigurationsFailure = CreateRepoFailure;

/** MCP tool: `github_detach_org_code_security_configurations`. */
export type DetachOrgCodeSecurityConfigurationsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    selected_repository_ids: number[];
    request_id: string | null;
};
export type DetachOrgCodeSecurityConfigurationsFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_code_security_configuration`. */
export type GetOrgCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    configuration_id: number;
    configuration: Record<string, unknown>;
    request_id: string | null;
};
export type GetOrgCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_update_org_code_security_configuration`. */
export type UpdateOrgCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    configuration_id: number;
    configuration: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateOrgCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_code_security_configuration`. */
export type DeleteOrgCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    configuration_id: number;
    request_id: string | null;
};
export type DeleteOrgCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_attach_org_code_security_configuration`. */
export type AttachOrgCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    configuration_id: number;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type AttachOrgCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_set_org_code_security_configuration_as_default`. */
export type SetOrgCodeSecurityConfigurationAsDefaultSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    configuration_id: number;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type SetOrgCodeSecurityConfigurationAsDefaultFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_code_security_configuration_repositories`. */
export type ListOrgCodeSecurityConfigurationRepositoriesSuccess = {
    success: true;
    message: string;
    org: string;
    configuration_id: number;
    repositories: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgCodeSecurityConfigurationRepositoriesFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_code_security_configuration`. */
export type GetRepoCodeSecurityConfigurationSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    configuration: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoCodeSecurityConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_list_codes_of_conduct`. */
export type ListCodesOfConductSuccess = {
    success: true;
    message: string;
    http_status: number;
    codes_of_conduct: Record<string, unknown>[];
    request_id: string | null;
};
export type ListCodesOfConductFailure = CreateRepoFailure;

/** MCP tool: `github_get_code_of_conduct`. */
export type GetCodeOfConductSuccess = {
    success: true;
    message: string;
    http_status: number;
    key: string;
    code_of_conduct: Record<string, unknown>;
    request_id: string | null;
};
export type GetCodeOfConductFailure = CreateRepoFailure;
/** MCP tool: `github_list_repo_codespaces`. */
export type ListRepoCodespacesSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    total_count: number;
    codespaces: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoCodespacesFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_codespace`. */
export type CreateRepoCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    codespace: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_codespace_devcontainers`. */
export type ListRepoCodespaceDevcontainersSuccess = {
    success: true;
    message: string;
    owner: string;
    repo: string;
    full_name: string;
    total_count: number;
    devcontainers: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoCodespaceDevcontainersFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_codespace_defaults`. */
export type GetRepoCodespaceDefaultsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    defaults: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoCodespaceDefaultsFailure = CreateRepoFailure;

/** MCP tool: `github_check_repo_codespace_permissions`. */
export type CheckRepoCodespacePermissionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    accepted: boolean;
    request_id: string | null;
};
export type CheckRepoCodespacePermissionsFailure = CreateRepoFailure;

/** MCP tool: `github_create_pull_request_codespace`. */
export type CreatePullRequestCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    codespace: Record<string, unknown>;
    request_id: string | null;
};
export type CreatePullRequestCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_codespaces`. */
export type ListUserCodespacesSuccess = {
    success: true;
    message: string;
    total_count: number;
    codespaces: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListUserCodespacesFailure = CreateRepoFailure;

/** MCP tool: `github_create_user_codespace`. */
export type CreateUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace: Record<string, unknown>;
    request_id: string | null;
};
export type CreateUserCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_codespace`. */
export type GetUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    codespace: Record<string, unknown>;
    request_id: string | null;
};
export type GetUserCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_update_user_codespace`. */
export type UpdateUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    codespace: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateUserCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_delete_user_codespace`. */
export type DeleteUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    request_id: string | null;
};
export type DeleteUserCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_export_user_codespace`. */
export type ExportUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    export: Record<string, unknown>;
    request_id: string | null;
};
export type ExportUserCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_codespace_export`. */
export type GetUserCodespaceExportSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    export_id: number;
    export: Record<string, unknown>;
    request_id: string | null;
};
export type GetUserCodespaceExportFailure = CreateRepoFailure;

/** MCP tool: `github_publish_user_codespace`. */
export type PublishUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    codespace: Record<string, unknown>;
    request_id: string | null;
};
export type PublishUserCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_start_user_codespace`. */
export type StartUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    codespace: Record<string, unknown>;
    request_id: string | null;
};
export type StartUserCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_stop_user_codespace`. */
export type StopUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    codespace: Record<string, unknown>;
    request_id: string | null;
};
export type StopUserCodespaceFailure = CreateRepoFailure;
/** MCP tool: `github_list_org_codespaces`. */
export type ListOrgCodespacesSuccess = {
    success: true;
    message: string;
    org: string;
    total_count: number;
    codespaces: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgCodespacesFailure = CreateRepoFailure;

/** MCP tool: `github_set_org_codespaces_access`. */
export type SetOrgCodespacesAccessSuccess = { success: true; message: string; http_status: number; org: string; visibility: string; request_id: string | null; };
export type SetOrgCodespacesAccessFailure = CreateRepoFailure;

/** MCP tool: `github_add_org_codespaces_access_users`. */
export type AddOrgCodespacesAccessUsersSuccess = { success: true; message: string; http_status: number; org: string; selected_usernames: string[]; request_id: string | null; };
export type AddOrgCodespacesAccessUsersFailure = CreateRepoFailure;

/** MCP tool: `github_remove_org_codespaces_access_users`. */
export type RemoveOrgCodespacesAccessUsersSuccess = { success: true; message: string; http_status: number; org: string; selected_usernames: string[]; request_id: string | null; };
export type RemoveOrgCodespacesAccessUsersFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_user_codespaces`. */
export type ListOrgUserCodespacesSuccess = {
    success: true;
    message: string;
    org: string;
    username: string;
    total_count: number;
    codespaces: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgUserCodespacesFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_user_codespace`. */
export type DeleteOrgUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    codespace_name: string;
    request_id: string | null;
};
export type DeleteOrgUserCodespaceFailure = CreateRepoFailure;

/** MCP tool: `github_stop_org_user_codespace`. */
export type StopOrgUserCodespaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    username: string;
    codespace_name: string;
    codespace: Record<string, unknown>;
    request_id: string | null;
};
export type StopOrgUserCodespaceFailure = CreateRepoFailure;
/** MCP tool: `github_list_org_codespaces_secrets`. */
export type ListOrgCodespacesSecretsSuccess = { success: true; message: string; org: string; total_count: number; secrets: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListOrgCodespacesSecretsFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_codespaces_public_key`. */
export type GetOrgCodespacesPublicKeySuccess = { success: true; message: string; http_status: number; org: string; public_key: Record<string, unknown>; request_id: string | null; };
export type GetOrgCodespacesPublicKeyFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_codespaces_secret`. */
export type GetOrgCodespacesSecretSuccess = { success: true; message: string; http_status: number; org: string; secret_name: string; secret: Record<string, unknown>; request_id: string | null; };
export type GetOrgCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_create_or_update_org_codespaces_secret`. */
export type CreateOrUpdateOrgCodespacesSecretSuccess = { success: true; message: string; http_status: number; org: string; secret_name: string; created: boolean; request_id: string | null; };
export type CreateOrUpdateOrgCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_codespaces_secret`. */
export type DeleteOrgCodespacesSecretSuccess = { success: true; message: string; http_status: number; org: string; secret_name: string; request_id: string | null; };
export type DeleteOrgCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_list_selected_repos_for_org_codespaces_secret`. */
export type ListSelectedReposForOrgCodespacesSecretSuccess = { success: true; message: string; org: string; secret_name: string; total_count: number; repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListSelectedReposForOrgCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_set_selected_repos_for_org_codespaces_secret`. */
export type SetSelectedReposForOrgCodespacesSecretSuccess = { success: true; message: string; http_status: number; org: string; secret_name: string; selected_repository_ids: number[]; request_id: string | null; };
export type SetSelectedReposForOrgCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_add_selected_repo_to_org_codespaces_secret`. */
export type AddSelectedRepoToOrgCodespacesSecretSuccess = { success: true; message: string; http_status: number; org: string; secret_name: string; repository_id: number; request_id: string | null; };
export type AddSelectedRepoToOrgCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_remove_selected_repo_from_org_codespaces_secret`. */
export type RemoveSelectedRepoFromOrgCodespacesSecretSuccess = { success: true; message: string; http_status: number; org: string; secret_name: string; repository_id: number; request_id: string | null; };
export type RemoveSelectedRepoFromOrgCodespacesSecretFailure = CreateRepoFailure;
/** MCP tool: `github_list_repo_codespace_machines`. */
export type ListRepoCodespaceMachinesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    machines: Record<string, unknown>[];
    request_id: string | null;
};
export type ListRepoCodespaceMachinesFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_codespace_machines`. */
export type ListUserCodespaceMachinesSuccess = {
    success: true;
    message: string;
    http_status: number;
    codespace_name: string;
    machines: Record<string, unknown>[];
    request_id: string | null;
};
export type ListUserCodespaceMachinesFailure = CreateRepoFailure;
/** MCP tool: `github_list_repo_codespaces_secrets`. */
export type ListRepoCodespacesSecretsSuccess = { success: true; message: string; owner: string; repo: string; full_name: string; total_count: number; secrets: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListRepoCodespacesSecretsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_codespaces_public_key`. */
export type GetRepoCodespacesPublicKeySuccess = { success: true; message: string; http_status: number; owner: string; repo: string; full_name: string; public_key: Record<string, unknown>; request_id: string | null; };
export type GetRepoCodespacesPublicKeyFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_codespaces_secret`. */
export type GetRepoCodespacesSecretSuccess = { success: true; message: string; http_status: number; owner: string; repo: string; full_name: string; secret_name: string; secret: Record<string, unknown>; request_id: string | null; };
export type GetRepoCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_create_or_update_repo_codespaces_secret`. */
export type CreateOrUpdateRepoCodespacesSecretSuccess = { success: true; message: string; http_status: number; owner: string; repo: string; full_name: string; secret_name: string; created: boolean; request_id: string | null; };
export type CreateOrUpdateRepoCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_codespaces_secret`. */
export type DeleteRepoCodespacesSecretSuccess = { success: true; message: string; http_status: number; owner: string; repo: string; full_name: string; secret_name: string; request_id: string | null; };
export type DeleteRepoCodespacesSecretFailure = CreateRepoFailure;
/** MCP tool: `github_list_user_codespaces_secrets`. */
export type ListUserCodespacesSecretsSuccess = { success: true; message: string; total_count: number; secrets: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListUserCodespacesSecretsFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_codespaces_public_key`. */
export type GetUserCodespacesPublicKeySuccess = { success: true; message: string; http_status: number; public_key: Record<string, unknown>; request_id: string | null; };
export type GetUserCodespacesPublicKeyFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_codespaces_secret`. */
export type GetUserCodespacesSecretSuccess = { success: true; message: string; http_status: number; secret_name: string; secret: Record<string, unknown>; request_id: string | null; };
export type GetUserCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_create_or_update_user_codespaces_secret`. */
export type CreateOrUpdateUserCodespacesSecretSuccess = { success: true; message: string; http_status: number; secret_name: string; created: boolean; request_id: string | null; };
export type CreateOrUpdateUserCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_delete_user_codespaces_secret`. */
export type DeleteUserCodespacesSecretSuccess = { success: true; message: string; http_status: number; secret_name: string; request_id: string | null; };
export type DeleteUserCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_list_repos_for_user_codespaces_secret`. */
export type ListReposForUserCodespacesSecretSuccess = { success: true; message: string; secret_name: string; total_count: number; repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListReposForUserCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_set_repos_for_user_codespaces_secret`. */
export type SetReposForUserCodespacesSecretSuccess = { success: true; message: string; http_status: number; secret_name: string; selected_repository_ids: number[]; request_id: string | null; };
export type SetReposForUserCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_add_repo_to_user_codespaces_secret`. */
export type AddRepoToUserCodespacesSecretSuccess = { success: true; message: string; http_status: number; secret_name: string; repository_id: number; request_id: string | null; };
export type AddRepoToUserCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_remove_repo_from_user_codespaces_secret`. */
export type RemoveRepoFromUserCodespacesSecretSuccess = { success: true; message: string; http_status: number; secret_name: string; repository_id: number; request_id: string | null; };
export type RemoveRepoFromUserCodespacesSecretFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_collaborators`. */
export type ListRepoCollaboratorsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    collaborators: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoCollaboratorsFailure = CreateRepoFailure;

/** MCP tool: `github_check_repo_collaborator`. */
export type CheckRepoCollaboratorSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    username: string;
    is_collaborator: boolean;
    request_id: string | null;
};
export type CheckRepoCollaboratorFailure = CreateRepoFailure;

/** MCP tool: `github_add_repo_collaborator`. */
export type AddRepoCollaboratorSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    username: string;
    invited: boolean;
    invitation: Record<string, unknown> | null;
    request_id: string | null;
};
export type AddRepoCollaboratorFailure = CreateRepoFailure;

/** MCP tool: `github_remove_repo_collaborator`. */
export type RemoveRepoCollaboratorSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    username: string;
    request_id: string | null;
};
export type RemoveRepoCollaboratorFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_collaborator_permission`. */
export type GetRepoCollaboratorPermissionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    username: string;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoCollaboratorPermissionFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_invitations`. */
export type ListRepoInvitationsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    invitations: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoInvitationsFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_invitation`. */
export type UpdateRepoInvitationSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    invitation_id: number;
    invitation: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoInvitationFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_invitation`. */
export type DeleteRepoInvitationSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    invitation_id: number;
    request_id: string | null;
};
export type DeleteRepoInvitationFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_repository_invitations`. */
export type ListUserRepositoryInvitationsSuccess = {
    success: true;
    message: string;
    invitations: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListUserRepositoryInvitationsFailure = CreateRepoFailure;

/** MCP tool: `github_accept_repository_invitation`. */
export type AcceptRepositoryInvitationSuccess = {
    success: true;
    message: string;
    http_status: number;
    invitation_id: number;
    request_id: string | null;
};
export type AcceptRepositoryInvitationFailure = CreateRepoFailure;

/** MCP tool: `github_decline_repository_invitation`. */
export type DeclineRepositoryInvitationSuccess = {
    success: true;
    message: string;
    http_status: number;
    invitation_id: number;
    request_id: string | null;
};
export type DeclineRepositoryInvitationFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_commits`. */
export type ListRepoCommitsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    commits: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoCommitsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_commit`. */
export type GetRepoCommitSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ref: string;
    result: Record<string, unknown>;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page?: number;
    per_page?: number;
};
export type GetRepoCommitFailure = CreateRepoFailure;

/** MCP tool: `github_compare_repo_commits`. */
export type CompareRepoCommitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    base: string;
    head: string;
    result: Record<string, unknown>;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page?: number;
    per_page?: number;
};
export type CompareRepoCommitsFailure = CreateRepoFailure;

/** MCP tool: `github_list_branches_for_head_commit`. */
export type ListBranchesForHeadCommitSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    commit_sha: string;
    branches: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListBranchesForHeadCommitFailure = CreateRepoFailure;

/** MCP tool: `github_list_pull_requests_associated_with_commit`. */
export type ListPullRequestsAssociatedWithCommitSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    commit_sha: string;
    pull_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListPullRequestsAssociatedWithCommitFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_commit_comments`. */
export type ListRepoCommitCommentsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    comments: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoCommitCommentsFailure = CreateRepoFailure;

/** MCP tool: `github_get_commit_comment`. */
export type GetCommitCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    comment: Record<string, unknown>;
    request_id: string | null;
};
export type GetCommitCommentFailure = CreateRepoFailure;

/** MCP tool: `github_update_commit_comment`. */
export type UpdateCommitCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    comment: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateCommitCommentFailure = CreateRepoFailure;

/** MCP tool: `github_delete_commit_comment`. */
export type DeleteCommitCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    request_id: string | null;
};
export type DeleteCommitCommentFailure = CreateRepoFailure;

/** MCP tool: `github_list_commit_comments`. */
export type ListCommitCommentsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    commit_sha: string;
    comments: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListCommitCommentsFailure = CreateRepoFailure;

/** MCP tool: `github_create_commit_comment`. */
export type CreateCommitCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    commit_sha: string;
    comment: Record<string, unknown>;
    request_id: string | null;
};
export type CreateCommitCommentFailure = CreateRepoFailure;

/** MCP tool: `github_get_combined_commit_status`. */
export type GetCombinedCommitStatusSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ref: string;
    result: Record<string, unknown>;
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
};
export type GetCombinedCommitStatusFailure = CreateRepoFailure;

/** MCP tool: `github_list_commit_statuses`. */
export type ListCommitStatusesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    ref: string;
    statuses: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListCommitStatusesFailure = CreateRepoFailure;

/** MCP tool: `github_create_commit_status`. */
export type CreateCommitStatusSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    sha: string;
    status: Record<string, unknown>;
    request_id: string | null;
};
export type CreateCommitStatusFailure = CreateRepoFailure;

/** MCP tool: `github_set_enterprise_copilot_coding_agent_policy`. */
export type SetEnterpriseCopilotCodingAgentPolicySuccess = {
    success: true;
    message: string;
    request_id: string | null;
    enterprise: string;
    policy_state: string;
};
export type SetEnterpriseCopilotCodingAgentPolicyFailure = CreateRepoFailure;

/** MCP tool: `github_add_enterprise_copilot_coding_agent_organizations`. */
export type AddEnterpriseCopilotCodingAgentOrganizationsSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    enterprise: string;
    organizations?: string[];
    custom_properties?: Record<string, unknown>[];
};
export type AddEnterpriseCopilotCodingAgentOrganizationsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_enterprise_copilot_coding_agent_organizations`. */
export type RemoveEnterpriseCopilotCodingAgentOrganizationsSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    enterprise: string;
    organizations?: string[];
    custom_properties?: Record<string, unknown>[];
};
export type RemoveEnterpriseCopilotCodingAgentOrganizationsFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_coding_agent_permissions`. */
export type GetOrgCopilotCodingAgentPermissionsSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    permissions: Record<string, unknown>;
};
export type GetOrgCopilotCodingAgentPermissionsFailure = CreateRepoFailure;

/** MCP tool: `github_set_org_copilot_coding_agent_permissions`. */
export type SetOrgCopilotCodingAgentPermissionsSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    enabled_repositories: string;
};
export type SetOrgCopilotCodingAgentPermissionsFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_copilot_coding_agent_repositories`. */
export type ListOrgCopilotCodingAgentRepositoriesSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    total_count: number;
    repositories: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgCopilotCodingAgentRepositoriesFailure = CreateRepoFailure;

/** MCP tool: `github_set_org_copilot_coding_agent_repositories`. */
export type SetOrgCopilotCodingAgentRepositoriesSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    selected_repository_ids: number[];
};
export type SetOrgCopilotCodingAgentRepositoriesFailure = CreateRepoFailure;

/** MCP tool: `github_enable_org_copilot_coding_agent_repository`. */
export type EnableOrgCopilotCodingAgentRepositorySuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    repository_id: number;
};
export type EnableOrgCopilotCodingAgentRepositoryFailure = CreateRepoFailure;

/** MCP tool: `github_disable_org_copilot_coding_agent_repository`. */
export type DisableOrgCopilotCodingAgentRepositorySuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    repository_id: number;
};
export type DisableOrgCopilotCodingAgentRepositoryFailure = CreateRepoFailure;


/** MCP tool: `github_get_repo_copilot_cloud_agent_configuration`. */
export type GetRepoCopilotCloudAgentConfigurationSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    owner: string;
    name: string;
    configuration: Record<string, unknown>;
};
export type GetRepoCopilotCloudAgentConfigurationFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_content_exclusion`. */
export type GetOrgCopilotContentExclusionSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    rules: Record<string, unknown>;
};
export type GetOrgCopilotContentExclusionFailure = CreateRepoFailure;

/** MCP tool: `github_set_org_copilot_content_exclusion`. */
export type SetOrgCopilotContentExclusionSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    rules: Record<string, string[]>;
    result?: Record<string, unknown>;
};
export type SetOrgCopilotContentExclusionFailure = CreateRepoFailure;

/** MCP tool: `github_list_enterprise_copilot_custom_agents`. */
export type ListEnterpriseCopilotCustomAgentsSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    enterprise: string;
    custom_agents: Record<string, unknown>[] | null;
    pagination: GitHubPageLinkPagination | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListEnterpriseCopilotCustomAgentsFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_copilot_custom_agents_source`. */
export type GetEnterpriseCopilotCustomAgentsSourceSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    enterprise: string;
    source: Record<string, unknown>;
};
export type GetEnterpriseCopilotCustomAgentsSourceFailure = CreateRepoFailure;

/** MCP tool: `github_set_enterprise_copilot_custom_agents_source`. */
export type SetEnterpriseCopilotCustomAgentsSourceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    enterprise: string;
    organization_id: number;
    create_ruleset?: boolean;
    source: Record<string, unknown>;
};
export type SetEnterpriseCopilotCustomAgentsSourceFailure = CreateRepoFailure;

/** MCP tool: `github_delete_enterprise_copilot_custom_agents_source`. */
export type DeleteEnterpriseCopilotCustomAgentsSourceSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    enterprise: string;
};
export type DeleteEnterpriseCopilotCustomAgentsSourceFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_copilot_metrics_1_day`. */
export type GetEnterpriseCopilotMetrics1DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    enterprise: string;
    day: string;
    report: Record<string, unknown>;
};
export type GetEnterpriseCopilotMetrics1DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_copilot_metrics_28_day`. */
export type GetEnterpriseCopilotMetrics28DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    enterprise: string;
    report: Record<string, unknown>;
};
export type GetEnterpriseCopilotMetrics28DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_copilot_repos_metrics_1_day`. */
export type GetEnterpriseCopilotReposMetrics1DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    enterprise: string;
    day: string;
    report: Record<string, unknown>;
};
export type GetEnterpriseCopilotReposMetrics1DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_copilot_user_teams_metrics_1_day`. */
export type GetEnterpriseCopilotUserTeamsMetrics1DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    enterprise: string;
    day: string;
    report: Record<string, unknown>;
};
export type GetEnterpriseCopilotUserTeamsMetrics1DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_copilot_users_metrics_1_day`. */
export type GetEnterpriseCopilotUsersMetrics1DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    enterprise: string;
    day: string;
    report: Record<string, unknown>;
};
export type GetEnterpriseCopilotUsersMetrics1DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_copilot_users_metrics_28_day`. */
export type GetEnterpriseCopilotUsersMetrics28DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    enterprise: string;
    report: Record<string, unknown>;
};
export type GetEnterpriseCopilotUsersMetrics28DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_metrics_1_day`. */
export type GetOrgCopilotMetrics1DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    day: string;
    report: Record<string, unknown>;
};
export type GetOrgCopilotMetrics1DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_metrics_28_day`. */
export type GetOrgCopilotMetrics28DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    report: Record<string, unknown>;
};
export type GetOrgCopilotMetrics28DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_repos_metrics_1_day`. */
export type GetOrgCopilotReposMetrics1DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    day: string;
    report: Record<string, unknown>;
};
export type GetOrgCopilotReposMetrics1DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_user_teams_metrics_1_day`. */
export type GetOrgCopilotUserTeamsMetrics1DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    day: string;
    report: Record<string, unknown>;
};
export type GetOrgCopilotUserTeamsMetrics1DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_users_metrics_1_day`. */
export type GetOrgCopilotUsersMetrics1DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    day: string;
    report: Record<string, unknown>;
};
export type GetOrgCopilotUsersMetrics1DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_users_metrics_28_day`. */
export type GetOrgCopilotUsersMetrics28DaySuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    report: Record<string, unknown>;
};
export type GetOrgCopilotUsersMetrics28DayFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_billing`. */
export type GetOrgCopilotBillingSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    billing: Record<string, unknown>;
};
export type GetOrgCopilotBillingFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_copilot_seats`. */
export type ListOrgCopilotSeatsSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    total_seats: number;
    seats: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgCopilotSeatsFailure = CreateRepoFailure;

/** MCP tool: `github_add_org_copilot_seats_for_teams`. */
export type AddOrgCopilotSeatsForTeamsSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    selected_teams: string[];
    result: Record<string, unknown>;
};
export type AddOrgCopilotSeatsForTeamsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_org_copilot_seats_for_teams`. */
export type RemoveOrgCopilotSeatsForTeamsSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    selected_teams: string[];
    result: Record<string, unknown>;
};
export type RemoveOrgCopilotSeatsForTeamsFailure = CreateRepoFailure;

/** MCP tool: `github_add_org_copilot_seats_for_users`. */
export type AddOrgCopilotSeatsForUsersSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    selected_usernames: string[];
    result: Record<string, unknown>;
};
export type AddOrgCopilotSeatsForUsersFailure = CreateRepoFailure;

/** MCP tool: `github_remove_org_copilot_seats_for_users`. */
export type RemoveOrgCopilotSeatsForUsersSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    selected_usernames: string[];
    result: Record<string, unknown>;
};
export type RemoveOrgCopilotSeatsForUsersFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_seat_details_for_user`. */
export type GetOrgCopilotSeatDetailsForUserSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    username: string;
    seat: Record<string, unknown>;
};
export type GetOrgCopilotSeatDetailsForUserFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_copilot_space_collaborators`. */
export type ListOrgCopilotSpaceCollaboratorsSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    space_number: number;
    collaborators: Record<string, unknown>[];
};
export type ListOrgCopilotSpaceCollaboratorsFailure = CreateRepoFailure;

/** MCP tool: `github_add_org_copilot_space_collaborator`. */
export type AddOrgCopilotSpaceCollaboratorSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    space_number: number;
    actor_type: "User" | "Team";
    actor_identifier: string;
    role: "reader" | "writer" | "admin";
    collaborator: Record<string, unknown>;
};
export type AddOrgCopilotSpaceCollaboratorFailure = CreateRepoFailure;

/** MCP tool: `github_set_org_copilot_space_collaborator_role`. */
export type SetOrgCopilotSpaceCollaboratorRoleSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    space_number: number;
    actor_type: "User" | "Team";
    actor_identifier: string;
    role: "reader" | "writer" | "admin" | "no_access";
    collaborator: Record<string, unknown> | null;
};
export type SetOrgCopilotSpaceCollaboratorRoleFailure = CreateRepoFailure;

/** MCP tool: `github_remove_org_copilot_space_collaborator`. */
export type RemoveOrgCopilotSpaceCollaboratorSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    space_number: number;
    actor_type: "User" | "Team";
    actor_identifier: string;
};
export type RemoveOrgCopilotSpaceCollaboratorFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_copilot_space_collaborators`. */
export type ListUserCopilotSpaceCollaboratorsSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    username: string;
    space_number: number;
    collaborators: Record<string, unknown>[];
};
export type ListUserCopilotSpaceCollaboratorsFailure = CreateRepoFailure;

/** MCP tool: `github_add_user_copilot_space_collaborator`. */
export type AddUserCopilotSpaceCollaboratorSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    username: string;
    space_number: number;
    actor_type: "User" | "Team";
    actor_identifier: string;
    role: "reader" | "writer" | "admin";
    collaborator: Record<string, unknown>;
};
export type AddUserCopilotSpaceCollaboratorFailure = CreateRepoFailure;

/** MCP tool: `github_set_user_copilot_space_collaborator_role`. */
export type SetUserCopilotSpaceCollaboratorRoleSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    username: string;
    space_number: number;
    actor_type: "User" | "Team";
    actor_identifier: string;
    role: "reader" | "writer" | "admin" | "no_access";
    collaborator: Record<string, unknown> | null;
};
export type SetUserCopilotSpaceCollaboratorRoleFailure = CreateRepoFailure;

/** MCP tool: `github_remove_user_copilot_space_collaborator`. */
export type RemoveUserCopilotSpaceCollaboratorSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    username: string;
    space_number: number;
    actor_type: "User" | "Team";
    actor_identifier: string;
};
export type RemoveUserCopilotSpaceCollaboratorFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_copilot_spaces`. */
export type ListOrgCopilotSpacesSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    spaces: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgCopilotSpacesFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_copilot_space`. */
export type CreateOrgCopilotSpaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    space: Record<string, unknown>;
};
export type CreateOrgCopilotSpaceFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_space`. */
export type GetOrgCopilotSpaceSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    space_number: number;
    space: Record<string, unknown>;
};
export type GetOrgCopilotSpaceFailure = CreateRepoFailure;

/** MCP tool: `github_set_org_copilot_space`. */
export type SetOrgCopilotSpaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    space_number: number;
    space: Record<string, unknown>;
};
export type SetOrgCopilotSpaceFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_copilot_space`. */
export type DeleteOrgCopilotSpaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    space_number: number;
};
export type DeleteOrgCopilotSpaceFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_copilot_spaces`. */
export type ListUserCopilotSpacesSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    username: string;
    spaces: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListUserCopilotSpacesFailure = CreateRepoFailure;

/** MCP tool: `github_create_user_copilot_space`. */
export type CreateUserCopilotSpaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    username: string;
    space: Record<string, unknown>;
};
export type CreateUserCopilotSpaceFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_copilot_space`. */
export type GetUserCopilotSpaceSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    username: string;
    space_number: number;
    space: Record<string, unknown>;
};
export type GetUserCopilotSpaceFailure = CreateRepoFailure;

/** MCP tool: `github_set_user_copilot_space`. */
export type SetUserCopilotSpaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    username: string;
    space_number: number;
    space: Record<string, unknown>;
};
export type SetUserCopilotSpaceFailure = CreateRepoFailure;

/** MCP tool: `github_delete_user_copilot_space`. */
export type DeleteUserCopilotSpaceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    username: string;
    space_number: number;
};
export type DeleteUserCopilotSpaceFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_copilot_space_resources`. */
export type ListOrgCopilotSpaceResourcesSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    space_number: number;
    resources: Record<string, unknown>[];
};
export type ListOrgCopilotSpaceResourcesFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_copilot_space_resource`. */
export type CreateOrgCopilotSpaceResourceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    space_number: number;
    resource_type: "repository" | "github_file" | "free_text" | "github_issue" | "github_pull_request";
    resource: Record<string, unknown>;
};
export type CreateOrgCopilotSpaceResourceFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_copilot_space_resource`. */
export type GetOrgCopilotSpaceResourceSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    org: string;
    space_number: number;
    space_resource_id: number;
    resource: Record<string, unknown>;
};
export type GetOrgCopilotSpaceResourceFailure = CreateRepoFailure;

/** MCP tool: `github_set_org_copilot_space_resource`. */
export type SetOrgCopilotSpaceResourceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    space_number: number;
    space_resource_id: number;
    resource: Record<string, unknown>;
};
export type SetOrgCopilotSpaceResourceFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_copilot_space_resource`. */
export type DeleteOrgCopilotSpaceResourceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    org: string;
    space_number: number;
    space_resource_id: number;
};
export type DeleteOrgCopilotSpaceResourceFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_copilot_space_resources`. */
export type ListUserCopilotSpaceResourcesSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    username: string;
    space_number: number;
    resources: Record<string, unknown>[];
};
export type ListUserCopilotSpaceResourcesFailure = CreateRepoFailure;

/** MCP tool: `github_create_user_copilot_space_resource`. */
export type CreateUserCopilotSpaceResourceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    username: string;
    space_number: number;
    resource_type: "repository" | "github_file" | "free_text" | "github_issue" | "github_pull_request";
    resource: Record<string, unknown>;
};
export type CreateUserCopilotSpaceResourceFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_copilot_space_resource`. */
export type GetUserCopilotSpaceResourceSuccess = {
    success: true;
    message: string;
    request_id: string | null;
    username: string;
    space_number: number;
    space_resource_id: number;
    resource: Record<string, unknown>;
};
export type GetUserCopilotSpaceResourceFailure = CreateRepoFailure;

/** MCP tool: `github_set_user_copilot_space_resource`. */
export type SetUserCopilotSpaceResourceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    username: string;
    space_number: number;
    space_resource_id: number;
    resource: Record<string, unknown>;
};
export type SetUserCopilotSpaceResourceFailure = CreateRepoFailure;

/** MCP tool: `github_delete_user_copilot_space_resource`. */
export type DeleteUserCopilotSpaceResourceSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
    username: string;
    space_number: number;
    space_resource_id: number;
};
export type DeleteUserCopilotSpaceResourceFailure = CreateRepoFailure;

/** MCP tool: `github_revoke_credentials`. */
export type RevokeCredentialsSuccess = {
    success: true;
    message: string;
    http_status: number;
    credentials_count: number;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type RevokeCredentialsFailure = CreateRepoFailure;

/** GET /orgs/{org}/dismissal-requests/dependabot — HTTP 200. MCP tool: `github_list_org_dependabot_dismissal_requests`. */
export type ListOrgDependabotDismissalRequestsSuccess = {
    success: true;
    message: string;
    org: string;
    dismissal_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgDependabotDismissalRequestsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/dismissal-requests/dependabot — HTTP 200. MCP tool: `github_list_repo_dependabot_dismissal_requests`. */
export type ListRepoDependabotDismissalRequestsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    dismissal_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoDependabotDismissalRequestsFailure = CreateRepoFailure;

/** GET .../dismissal-requests/dependabot/{alert_number} — HTTP 200. MCP tool: `github_get_repo_dependabot_dismissal_request`. */
export type GetRepoDependabotDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    dismissal_request: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoDependabotDismissalRequestFailure = CreateRepoFailure;

/** POST .../dismissal-requests/dependabot/{alert_number} — HTTP 201. MCP tool: `github_create_repo_dependabot_dismissal_request`. */
export type CreateRepoDependabotDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    dismissal_request: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoDependabotDismissalRequestFailure = CreateRepoFailure;

/** PATCH .../dismissal-requests/dependabot/{alert_number} — HTTP 200. MCP tool: `github_review_repo_dependabot_dismissal_request`. */
export type ReviewRepoDependabotDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type ReviewRepoDependabotDismissalRequestFailure = CreateRepoFailure;

/** DELETE .../dismissal-requests/dependabot/{alert_number} — HTTP 204. MCP tool: `github_cancel_repo_dependabot_dismissal_request`. */
export type CancelRepoDependabotDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    request_id: string | null;
};
export type CancelRepoDependabotDismissalRequestFailure = CreateRepoFailure;


/** MCP tool: `github_list_enterprise_dependabot_alerts`. */
export type ListEnterpriseDependabotAlertsSuccess = { success: true; message: string; enterprise: string; alerts: Record<string, unknown>[]; pagination: GitHubLinkPagination | null; request_id: string | null; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListEnterpriseDependabotAlertsFailure = CreateRepoFailure;
/** MCP tool: `github_list_org_dependabot_alerts`. */
export type ListOrgDependabotAlertsSuccess = { success: true; message: string; org: string; alerts: Record<string, unknown>[]; pagination: GitHubLinkPagination | null; request_id: string | null; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListOrgDependabotAlertsFailure = CreateRepoFailure;
/** MCP tool: `github_list_repo_dependabot_alerts`. */
export type ListRepoDependabotAlertsSuccess = { success: true; message: string; owner: string; name: string; alerts: Record<string, unknown>[]; pagination: GitHubLinkPagination | null; request_id: string | null; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListRepoDependabotAlertsFailure = CreateRepoFailure;
/** MCP tool: `github_get_repo_dependabot_alert`. */
export type GetRepoDependabotAlertSuccess = { success: true; message: string; http_status: number; owner: string; name: string; alert_number: number; alert: Record<string, unknown>; request_id: string | null; };
export type GetRepoDependabotAlertFailure = CreateRepoFailure;
/** MCP tool: `github_update_repo_dependabot_alert`. */
export type UpdateRepoDependabotAlertSuccess = { success: true; message: string; http_status: number; owner: string; name: string; alert_number: number; alert: Record<string, unknown>; request_id: string | null; };
export type UpdateRepoDependabotAlertFailure = CreateRepoFailure;


export type ListEnterpriseDependabotRepositoryAccessSuccess = { success: true; message: string; http_status: number; enterprise: string; default_level: unknown; accessible_repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; };
export type ListEnterpriseDependabotRepositoryAccessFailure = CreateRepoFailure;
export type UpdateEnterpriseDependabotRepositoryAccessSuccess = { success: true; message: string; http_status: number; enterprise: string; request_id: string | null; };
export type UpdateEnterpriseDependabotRepositoryAccessFailure = CreateRepoFailure;
export type SetEnterpriseDependabotRepositoryAccessDefaultLevelSuccess = { success: true; message: string; http_status: number; enterprise: string; default_level: string; request_id: string | null; };
export type SetEnterpriseDependabotRepositoryAccessDefaultLevelFailure = CreateRepoFailure;
export type ListOrgDependabotRepositoryAccessSuccess = { success: true; message: string; http_status: number; org: string; default_level: unknown; accessible_repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; };
export type ListOrgDependabotRepositoryAccessFailure = CreateRepoFailure;
export type UpdateOrgDependabotRepositoryAccessSuccess = { success: true; message: string; http_status: number; org: string; request_id: string | null; };
export type UpdateOrgDependabotRepositoryAccessFailure = CreateRepoFailure;
export type SetOrgDependabotRepositoryAccessDefaultLevelSuccess = { success: true; message: string; http_status: number; org: string; default_level: string; request_id: string | null; };
export type SetOrgDependabotRepositoryAccessDefaultLevelFailure = CreateRepoFailure;

export type ListOrgDependabotSecretsSuccess = { success: true; message: string; org?: string; owner?: string; name?: string; total_count: number; secrets: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListOrgDependabotSecretsFailure = CreateRepoFailure;
export type GetOrgDependabotPublicKeySuccess = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; public_key: Record<string, unknown>; request_id: string | null; };
export type GetOrgDependabotPublicKeyFailure = CreateRepoFailure;
export type GetOrgDependabotSecretSuccess = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; secret_name: string; secret: Record<string, unknown>; request_id: string | null; };
export type GetOrgDependabotSecretFailure = CreateRepoFailure;
export type CreateOrUpdateOrgDependabotSecretSuccess = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; secret_name: string; created: boolean; request_id: string | null; };
export type CreateOrUpdateOrgDependabotSecretFailure = CreateRepoFailure;
export type DeleteOrgDependabotSecretSuccess = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; secret_name: string; request_id: string | null; };
export type DeleteOrgDependabotSecretFailure = CreateRepoFailure;
export type ListSelectedReposForOrgDependabotSecretSuccess = { success: true; message: string; org: string; secret_name: string; total_count: number; repositories: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListSelectedReposForOrgDependabotSecretFailure = CreateRepoFailure;
export type SetSelectedReposForOrgDependabotSecretSuccess = { success: true; message: string; http_status: number; org: string; secret_name: string; selected_repository_ids: number[]; request_id: string | null; };
export type SetSelectedReposForOrgDependabotSecretFailure = CreateRepoFailure;
export type AddSelectedRepoToOrgDependabotSecretSuccess = { success: true; message: string; http_status: number; org: string; secret_name: string; repository_id: number; request_id: string | null; };
export type AddSelectedRepoToOrgDependabotSecretFailure = CreateRepoFailure;
export type RemoveSelectedRepoFromOrgDependabotSecretSuccess = { success: true; message: string; http_status: number; org: string; secret_name: string; repository_id: number; request_id: string | null; };
export type RemoveSelectedRepoFromOrgDependabotSecretFailure = CreateRepoFailure;
export type ListRepoDependabotSecretsSuccess = { success: true; message: string; org?: string; owner?: string; name?: string; total_count: number; secrets: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListRepoDependabotSecretsFailure = CreateRepoFailure;
export type GetRepoDependabotPublicKeySuccess = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; public_key: Record<string, unknown>; request_id: string | null; };
export type GetRepoDependabotPublicKeyFailure = CreateRepoFailure;
export type GetRepoDependabotSecretSuccess = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; secret_name: string; secret: Record<string, unknown>; request_id: string | null; };
export type GetRepoDependabotSecretFailure = CreateRepoFailure;
export type CreateOrUpdateRepoDependabotSecretSuccess = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; secret_name: string; created: boolean; request_id: string | null; };
export type CreateOrUpdateRepoDependabotSecretFailure = CreateRepoFailure;
export type DeleteRepoDependabotSecretSuccess = { success: true; message: string; http_status: number; org?: string; owner?: string; name?: string; secret_name: string; request_id: string | null; };
export type DeleteRepoDependabotSecretFailure = CreateRepoFailure;

/** MCP tool: `github_compare_repo_dependency_graph`. */
export type CompareRepoDependencyGraphSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    base: string;
    head: string;
    changes: Record<string, unknown>[];
    request_id: string | null;
};
export type CompareRepoDependencyGraphFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_dependency_snapshot`. */
export type CreateRepoDependencySnapshotSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    snapshot: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoDependencySnapshotFailure = CreateRepoFailure;

/** MCP tool: `github_export_repo_sbom`. */
export type ExportRepoSbomSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    sbom: Record<string, unknown>;
    request_id: string | null;
};
export type ExportRepoSbomFailure = CreateRepoFailure;

/** MCP tool: `github_fetch_repo_sbom_report`. */
export type FetchRepoSbomReportSuccess = {
    success: true;
    message: string;
    http_status: 202 | 302;
    owner: string;
    name: string;
    sbom_uuid: string;
    ready: boolean;
    sbom_download_url: string | null;
    request_id: string | null;
};
export type FetchRepoSbomReportFailure = CreateRepoFailure;

/** MCP tool: `github_generate_repo_sbom_report`. */
export type GenerateRepoSbomReportSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    sbom_url: string | null;
    sbom_uuid: string | null;
    report: Record<string, unknown>;
    request_id: string | null;
};
export type GenerateRepoSbomReportFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_deploy_keys`. */
export type ListRepoDeployKeysSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    keys: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoDeployKeysFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_deploy_key`. */
export type CreateRepoDeployKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    deploy_key: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoDeployKeyFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_deploy_key`. */
export type GetRepoDeployKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    key_id: number;
    deploy_key: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoDeployKeyFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_deploy_key`. */
export type DeleteRepoDeployKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    key_id: number;
    request_id: string | null;
};
export type DeleteRepoDeployKeyFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_environment_deployment_branch_policies`. */
export type ListRepoEnvironmentDeploymentBranchPoliciesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    environment_name: string;
    total_count: number;
    branch_policies: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoEnvironmentDeploymentBranchPoliciesFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_environment_deployment_branch_policy`. */
export type CreateRepoEnvironmentDeploymentBranchPolicySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
    branch_policy: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoEnvironmentDeploymentBranchPolicyFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_environment_deployment_branch_policy`. */
export type GetRepoEnvironmentDeploymentBranchPolicySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
        branch_policy_id: number;
    branch_policy: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoEnvironmentDeploymentBranchPolicyFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_environment_deployment_branch_policy`. */
export type UpdateRepoEnvironmentDeploymentBranchPolicySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
        branch_policy_id: number;
    branch_policy: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoEnvironmentDeploymentBranchPolicyFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_environment_deployment_branch_policy`. */
export type DeleteRepoEnvironmentDeploymentBranchPolicySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
        branch_policy_id: number;
    request_id: string | null;
};
export type DeleteRepoEnvironmentDeploymentBranchPolicyFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_deployments`. */
export type ListRepoDeploymentsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    deployments: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoDeploymentsFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_deployment`. */
export type CreateRepoDeploymentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    deployment: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoDeploymentFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_deployment`. */
export type GetRepoDeploymentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    deployment_id: number;
    deployment: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoDeploymentFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_deployment`. */
export type DeleteRepoDeploymentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    deployment_id: number;
    request_id: string | null;
};
export type DeleteRepoDeploymentFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_environments`. */
export type ListRepoEnvironmentsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    total_count: number;
    environments: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoEnvironmentsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_environment`. */
export type GetRepoEnvironmentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
    environment: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoEnvironmentFailure = CreateRepoFailure;

/** MCP tool: `github_create_or_update_repo_environment`. */
export type CreateOrUpdateRepoEnvironmentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
    environment: Record<string, unknown>;
    request_id: string | null;
};
export type CreateOrUpdateRepoEnvironmentFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_environment`. */
export type DeleteRepoEnvironmentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
    request_id: string | null;
};
export type DeleteRepoEnvironmentFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_environment_deployment_protection_rules`. */
export type ListRepoEnvironmentDeploymentProtectionRulesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
    total_count: number;
    custom_deployment_protection_rules: Record<string, unknown>[];
    request_id: string | null;
};
export type ListRepoEnvironmentDeploymentProtectionRulesFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_environment_deployment_protection_rule`. */
export type CreateRepoEnvironmentDeploymentProtectionRuleSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
    deployment_protection_rule: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoEnvironmentDeploymentProtectionRuleFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_environment_available_deployment_protection_rule_apps`. */
export type ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    environment_name: string;
    total_count: number;
    available_custom_deployment_protection_rule_integrations: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_environment_deployment_protection_rule`. */
export type GetRepoEnvironmentDeploymentProtectionRuleSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
        protection_rule_id: number;
    deployment_protection_rule: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoEnvironmentDeploymentProtectionRuleFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_environment_deployment_protection_rule`. */
export type DeleteRepoEnvironmentDeploymentProtectionRuleSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    environment_name: string;
        protection_rule_id: number;
    request_id: string | null;
};
export type DeleteRepoEnvironmentDeploymentProtectionRuleFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_deployment_statuses`. */
export type ListRepoDeploymentStatusesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    deployment_id: number;
    statuses: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoDeploymentStatusesFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_deployment_status`. */
export type CreateRepoDeploymentStatusSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    deployment_id: number;
    status: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoDeploymentStatusFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_deployment_status`. */
export type GetRepoDeploymentStatusSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    deployment_id: number;
        status_id: number;
    status: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoDeploymentStatusFailure = CreateRepoFailure;

/** MCP tool: `github_get_emojis`. */
export type GetEmojisSuccess = {
    success: true;
    message: string;
    http_status: number;
    emoji_count: number;
    emojis: Record<string, string>;
    request_id: string | null;
};
export type GetEmojisFailure = CreateRepoFailure;

/** MCP tool: `github_list_enterprise_team_members`. */
export type ListEnterpriseTeamMembersSuccess = {
    success: true;
    message: string;
    enterprise: string;
    enterprise_team: string;
    members: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListEnterpriseTeamMembersFailure = CreateRepoFailure;

/** MCP tool: `github_bulk_add_enterprise_team_members`. */
export type BulkAddEnterpriseTeamMembersSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    usernames: string[];
    members: Record<string, unknown>[];
    request_id: string | null;
};
export type BulkAddEnterpriseTeamMembersFailure = CreateRepoFailure;

/** MCP tool: `github_bulk_remove_enterprise_team_members`. */
export type BulkRemoveEnterpriseTeamMembersSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    usernames: string[];
    members: Record<string, unknown>[];
    request_id: string | null;
};
export type BulkRemoveEnterpriseTeamMembersFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_team_membership`. */
export type GetEnterpriseTeamMembershipSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    username: string;
    member: Record<string, unknown>;
    request_id: string | null;
};
export type GetEnterpriseTeamMembershipFailure = CreateRepoFailure;

/** MCP tool: `github_add_enterprise_team_member`. */
export type AddEnterpriseTeamMemberSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    username: string;
    member: Record<string, unknown>;
    request_id: string | null;
};
export type AddEnterpriseTeamMemberFailure = CreateRepoFailure;

/** MCP tool: `github_remove_enterprise_team_membership`. */
export type RemoveEnterpriseTeamMembershipSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    username: string;
    request_id: string | null;
};
export type RemoveEnterpriseTeamMembershipFailure = CreateRepoFailure;

/** MCP tool: `github_list_enterprise_team_organization_assignments`. */
export type ListEnterpriseTeamOrganizationAssignmentsSuccess = {
    success: true;
    message: string;
    enterprise: string;
    enterprise_team: string;
    organizations: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListEnterpriseTeamOrganizationAssignmentsFailure = CreateRepoFailure;

/** MCP tool: `github_bulk_add_enterprise_team_organization_assignments`. */
export type BulkAddEnterpriseTeamOrganizationAssignmentsSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    organization_slugs: string[];
    organizations: Record<string, unknown>[];
    request_id: string | null;
};
export type BulkAddEnterpriseTeamOrganizationAssignmentsFailure = CreateRepoFailure;

/** MCP tool: `github_bulk_remove_enterprise_team_organization_assignments`. */
export type BulkRemoveEnterpriseTeamOrganizationAssignmentsSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    organization_slugs: string[];
    request_id: string | null;
};
export type BulkRemoveEnterpriseTeamOrganizationAssignmentsFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_team_organization_assignment`. */
export type GetEnterpriseTeamOrganizationAssignmentSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    org: string;
    organization: Record<string, unknown>;
    request_id: string | null;
};
export type GetEnterpriseTeamOrganizationAssignmentFailure = CreateRepoFailure;

/** MCP tool: `github_add_enterprise_team_organization_assignment`. */
export type AddEnterpriseTeamOrganizationAssignmentSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    org: string;
    organization: Record<string, unknown>;
    request_id: string | null;
};
export type AddEnterpriseTeamOrganizationAssignmentFailure = CreateRepoFailure;

/** MCP tool: `github_delete_enterprise_team_organization_assignment`. */
export type DeleteEnterpriseTeamOrganizationAssignmentSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    enterprise_team: string;
    org: string;
    request_id: string | null;
};
export type DeleteEnterpriseTeamOrganizationAssignmentFailure = CreateRepoFailure;

/** MCP tool: `github_list_enterprise_teams`. */
export type ListEnterpriseTeamsSuccess = {
    success: true;
    message: string;
    enterprise: string;
    teams: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListEnterpriseTeamsFailure = CreateRepoFailure;

/** MCP tool: `github_create_enterprise_team`. */
export type CreateEnterpriseTeamSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    team: Record<string, unknown>;
    request_id: string | null;
};
export type CreateEnterpriseTeamFailure = CreateRepoFailure;

/** MCP tool: `github_get_enterprise_team`. */
export type GetEnterpriseTeamSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    team_slug: string;
    team: Record<string, unknown>;
    request_id: string | null;
};
export type GetEnterpriseTeamFailure = CreateRepoFailure;

/** MCP tool: `github_update_enterprise_team`. */
export type UpdateEnterpriseTeamSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    team_slug: string;
    team: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateEnterpriseTeamFailure = CreateRepoFailure;

/** MCP tool: `github_delete_enterprise_team`. */
export type DeleteEnterpriseTeamSuccess = {
    success: true;
    message: string;
    http_status: number;
    enterprise: string;
    team_slug: string;
    request_id: string | null;
};
export type DeleteEnterpriseTeamFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_git_blob`. */
export type CreateRepoGitBlobSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    blob: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoGitBlobFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_git_blob`. */
export type GetRepoGitBlobSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    blob: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoGitBlobFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_git_commit`. */
export type CreateRepoGitCommitSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    commit: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoGitCommitFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_git_commit`. */
export type GetRepoGitCommitSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    commit: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoGitCommitFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_git_matching_refs`. */
export type ListRepoGitMatchingRefsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ref: string;
    refs: Record<string, unknown>[];
    request_id: string | null;
};
export type ListRepoGitMatchingRefsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_git_ref`. */
export type GetRepoGitRefSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ref: string;
    reference: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoGitRefFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_git_ref`. */
export type CreateRepoGitRefSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    reference: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoGitRefFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_git_ref`. */
export type UpdateRepoGitRefSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ref: string;
    reference: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoGitRefFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_git_ref`. */
export type DeleteRepoGitRefSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ref: string;
    request_id: string | null;
};
export type DeleteRepoGitRefFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_git_tag`. */
export type CreateRepoGitTagSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    tag_object: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoGitTagFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_git_tag`. */
export type GetRepoGitTagSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    tag_object: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoGitTagFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_git_tree`. */
export type CreateRepoGitTreeSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    tree: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoGitTreeFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_git_tree`. */
export type GetRepoGitTreeSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    tree: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoGitTreeFailure = CreateRepoFailure;

/** MCP tool: `github_list_gitignore_templates`. */
export type ListGitignoreTemplatesSuccess = {
    success: true;
    message: string;
    http_status: number;
    templates: string[];
    request_id: string | null;
};
export type ListGitignoreTemplatesFailure = CreateRepoFailure;

/** MCP tool: `github_get_gitignore_template`. */
export type GetGitignoreTemplateSuccess = {
    success: true;
    message: string;
    http_status: number;
    name: string;
    template: Record<string, unknown>;
    request_id: string | null;
};
export type GetGitignoreTemplateFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_interaction_limits`. */
export type GetOrgInteractionLimitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    interaction_limits: Record<string, unknown> | null;
    request_id: string | null;
};
export type GetOrgInteractionLimitsFailure = CreateRepoFailure;

/** MCP tool: `github_set_org_interaction_limits`. */
export type SetOrgInteractionLimitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    interaction_limits: Record<string, unknown>;
    request_id: string | null;
};
export type SetOrgInteractionLimitsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_org_interaction_limits`. */
export type RemoveOrgInteractionLimitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    request_id: string | null;
};
export type RemoveOrgInteractionLimitsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_interaction_limits`. */
export type GetRepoInteractionLimitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    interaction_limits: Record<string, unknown> | null;
    request_id: string | null;
};
export type GetRepoInteractionLimitsFailure = CreateRepoFailure;

/** MCP tool: `github_set_repo_interaction_limits`. */
export type SetRepoInteractionLimitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    interaction_limits: Record<string, unknown>;
    request_id: string | null;
};
export type SetRepoInteractionLimitsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_repo_interaction_limits`. */
export type RemoveRepoInteractionLimitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    request_id: string | null;
};
export type RemoveRepoInteractionLimitsFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_pull_request_creation_cap_bypass_list`. */
export type ListRepoPullRequestCreationCapBypassListSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    users: Record<string, unknown>[];
    request_id: string | null;
};
export type ListRepoPullRequestCreationCapBypassListFailure = CreateRepoFailure;

/** MCP tool: `github_add_repo_pull_request_creation_cap_bypass_users`. */
export type AddRepoPullRequestCreationCapBypassUsersSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    users: string[];
    request_id: string | null;
};
export type AddRepoPullRequestCreationCapBypassUsersFailure = CreateRepoFailure;

/** MCP tool: `github_remove_repo_pull_request_creation_cap_bypass_users`. */
export type RemoveRepoPullRequestCreationCapBypassUsersSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    users: string[];
    request_id: string | null;
};
export type RemoveRepoPullRequestCreationCapBypassUsersFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_pull_request_creation_cap`. */
export type GetRepoPullRequestCreationCapSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    creation_cap: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoPullRequestCreationCapFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_pull_request_creation_cap`. */
export type UpdateRepoPullRequestCreationCapSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    repo: string;
    full_name: string;
    creation_cap: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoPullRequestCreationCapFailure = CreateRepoFailure;

/** MCP tool: `github_get_authenticated_user_interaction_limits`. */
export type GetAuthenticatedUserInteractionLimitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    interaction_limits: Record<string, unknown> | null;
    request_id: string | null;
};
export type GetAuthenticatedUserInteractionLimitsFailure = CreateRepoFailure;

/** MCP tool: `github_set_authenticated_user_interaction_limits`. */
export type SetAuthenticatedUserInteractionLimitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    interaction_limits: Record<string, unknown>;
    request_id: string | null;
};
export type SetAuthenticatedUserInteractionLimitsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_authenticated_user_interaction_limits`. */
export type RemoveAuthenticatedUserInteractionLimitsSuccess = {
    success: true;
    message: string;
    http_status: number;
    request_id: string | null;
};
export type RemoveAuthenticatedUserInteractionLimitsFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_assignees`. */
export type ListRepoAssigneesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    assignees: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoAssigneesFailure = CreateRepoFailure;

/** MCP tool: `github_check_user_can_be_assigned`. */
export type CheckUserCanBeAssignedSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    assignee: string;
    can_be_assigned: boolean;
    http_status: number;
    request_id: string | null;
};
export type CheckUserCanBeAssignedFailure = CreateRepoFailure;

/** MCP tool: `github_add_issue_assignees`. */
export type AddIssueAssigneesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type AddIssueAssigneesFailure = CreateRepoFailure;

/** MCP tool: `github_remove_issue_assignees`. */
export type RemoveIssueAssigneesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type RemoveIssueAssigneesFailure = CreateRepoFailure;

/** MCP tool: `github_check_user_can_be_assigned_to_issue`. */
export type CheckUserCanBeAssignedToIssueSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    issue_number: number;
    assignee: string;
    can_be_assigned: boolean;
    http_status: number;
    request_id: string | null;
};
export type CheckUserCanBeAssignedToIssueFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_issue_comments`. */
export type ListRepoIssueCommentsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    comments: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoIssueCommentsFailure = CreateRepoFailure;

/** MCP tool: `github_get_issue_comment`. */
export type GetIssueCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    comment: Record<string, unknown>;
    request_id: string | null;
};
export type GetIssueCommentFailure = CreateRepoFailure;

/** MCP tool: `github_update_issue_comment`. */
export type UpdateIssueCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    comment: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateIssueCommentFailure = CreateRepoFailure;

/** MCP tool: `github_delete_issue_comment`. */
export type DeleteIssueCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    request_id: string | null;
};
export type DeleteIssueCommentFailure = CreateRepoFailure;

/** MCP tool: `github_pin_issue_comment`. */
export type PinIssueCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    comment: Record<string, unknown>;
    request_id: string | null;
};
export type PinIssueCommentFailure = CreateRepoFailure;

/** MCP tool: `github_unpin_issue_comment`. */
export type UnpinIssueCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    request_id: string | null;
};
export type UnpinIssueCommentFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_comments`. */
export type ListIssueCommentsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    comments: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueCommentsFailure = CreateRepoFailure;

/** MCP tool: `github_create_issue_comment`. */
export type CreateIssueCommentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    comment: Record<string, unknown>;
    request_id: string | null;
};
export type CreateIssueCommentFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_issue_events`. */
export type ListRepoIssueEventsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    events: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoIssueEventsFailure = CreateRepoFailure;

/** MCP tool: `github_get_issue_event`. */
export type GetIssueEventSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    event_id: number;
    event: Record<string, unknown>;
    request_id: string | null;
};
export type GetIssueEventFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_events`. */
export type ListIssueEventsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    events: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueEventsFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_dependencies_blocked_by`. */
export type ListIssueDependenciesBlockedBySuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    issues: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueDependenciesBlockedByFailure = CreateRepoFailure;

/** MCP tool: `github_add_issue_dependency_blocked_by`. */
export type AddIssueDependencyBlockedBySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    issue_id: number;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type AddIssueDependencyBlockedByFailure = CreateRepoFailure;

/** MCP tool: `github_remove_issue_dependency_blocked_by`. */
export type RemoveIssueDependencyBlockedBySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    issue_id: number;
    request_id: string | null;
};
export type RemoveIssueDependencyBlockedByFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_dependencies_blocking`. */
export type ListIssueDependenciesBlockingSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    issues: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueDependenciesBlockingFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_field_values`. */
export type ListIssueFieldValuesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    field_values: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueFieldValuesFailure = CreateRepoFailure;

/** MCP tool: `github_add_issue_field_values`. */
export type AddIssueFieldValuesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    field_values: Record<string, unknown>;
    request_id: string | null;
};
export type AddIssueFieldValuesFailure = CreateRepoFailure;

/** MCP tool: `github_set_issue_field_values`. */
export type SetIssueFieldValuesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    field_values: Record<string, unknown>;
    request_id: string | null;
};
export type SetIssueFieldValuesFailure = CreateRepoFailure;

/** MCP tool: `github_delete_issue_field_value`. */
export type DeleteIssueFieldValueSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    issue_field_id: number;
    request_id: string | null;
};
export type DeleteIssueFieldValueFailure = CreateRepoFailure;

/** MCP tool: `github_list_issues`. */
export type ListIssuesSuccess = {
    success: true;
    message: string;
    issues: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssuesFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_account_issues`. */
export type ListUserAccountIssuesSuccess = {
    success: true;
    message: string;
    issues: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListUserAccountIssuesFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_issues`. */
export type ListOrgIssuesSuccess = {
    success: true;
    message: string;
    org: string;
    issues: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgIssuesFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_issues`. */
export type ListRepoIssuesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    issues: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoIssuesFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_issue`. */
export type CreateRepoIssueSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoIssueFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_issue`. */
export type GetRepoIssueSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoIssueFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_issue`. */
export type UpdateRepoIssueSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoIssueFailure = CreateRepoFailure;

/** MCP tool: `github_lock_repo_issue`. */
export type LockRepoIssueSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    request_id: string | null;
};
export type LockRepoIssueFailure = CreateRepoFailure;

/** MCP tool: `github_unlock_repo_issue`. */
export type UnlockRepoIssueSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    request_id: string | null;
};
export type UnlockRepoIssueFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_labels`. */
export type ListIssueLabelsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    labels: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueLabelsFailure = CreateRepoFailure;

/** MCP tool: `github_add_issue_labels`. */
export type AddIssueLabelsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    labels: Record<string, unknown>[];
    request_id: string | null;
};
export type AddIssueLabelsFailure = CreateRepoFailure;

/** MCP tool: `github_set_issue_labels`. */
export type SetIssueLabelsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    labels: Record<string, unknown>[];
    request_id: string | null;
};
export type SetIssueLabelsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_all_issue_labels`. */
export type RemoveAllIssueLabelsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    request_id: string | null;
};
export type RemoveAllIssueLabelsFailure = CreateRepoFailure;

/** MCP tool: `github_remove_issue_label`. */
export type RemoveIssueLabelSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    labels: Record<string, unknown>[];
    request_id: string | null;
};
export type RemoveIssueLabelFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_labels`. */
export type ListRepoLabelsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    labels: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoLabelsFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_label`. */
export type CreateRepoLabelSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    label_name: string;
    label: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoLabelFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_label`. */
export type GetRepoLabelSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    label_name: string;
    label: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoLabelFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_label`. */
export type UpdateRepoLabelSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    label_name: string;
    label: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoLabelFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_label`. */
export type DeleteRepoLabelSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    label_name: string;
    request_id: string | null;
};
export type DeleteRepoLabelFailure = CreateRepoFailure;

/** MCP tool: `github_list_milestone_labels`. */
export type ListMilestoneLabelsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    labels: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListMilestoneLabelsFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_milestones`. */
export type ListRepoMilestonesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    milestones: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoMilestonesFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_milestone`. */
export type CreateRepoMilestoneSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    milestone: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoMilestoneFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_milestone`. */
export type GetRepoMilestoneSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    milestone_number: number;
    milestone: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoMilestoneFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_milestone`. */
export type UpdateRepoMilestoneSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    milestone_number: number;
    milestone: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoMilestoneFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_milestone`. */
export type DeleteRepoMilestoneSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    milestone_number: number;
    request_id: string | null;
};
export type DeleteRepoMilestoneFailure = CreateRepoFailure;

/** MCP tool: `github_get_issue_parent`. */
export type GetIssueParentSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type GetIssueParentFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_sub_issues`. */
export type ListIssueSubIssuesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    issues: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueSubIssuesFailure = CreateRepoFailure;

/** MCP tool: `github_add_issue_sub_issue`. */
export type AddIssueSubIssueSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    sub_issue_id: number;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type AddIssueSubIssueFailure = CreateRepoFailure;

/** MCP tool: `github_remove_issue_sub_issue`. */
export type RemoveIssueSubIssueSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    sub_issue_id: number;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type RemoveIssueSubIssueFailure = CreateRepoFailure;

/** MCP tool: `github_reprioritize_issue_sub_issue`. */
export type ReprioritizeIssueSubIssueSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    sub_issue_id: number;
    issue: Record<string, unknown>;
    request_id: string | null;
};
export type ReprioritizeIssueSubIssueFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_timeline_events`. */
export type ListIssueTimelineEventsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    events: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueTimelineEventsFailure = CreateRepoFailure;

/** MCP tool: `github_list_commonly_used_licenses`. */
export type ListCommonlyUsedLicensesSuccess = {
    success: true;
    message: string;
    licenses: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListCommonlyUsedLicensesFailure = CreateRepoFailure;

/** MCP tool: `github_get_license`. */
export type GetLicenseSuccess = {
    success: true;
    message: string;
    http_status: number;
    license_key: string;
    license: Record<string, unknown>;
    request_id: string | null;
};
export type GetLicenseFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_license`. */
export type GetRepoLicenseSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    license_file: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoLicenseFailure = CreateRepoFailure;

/** MCP tool: `github_render_markdown`. */
export type RenderMarkdownSuccess = {
    success: true;
    message: string;
    http_status: number;
    html: string;
    request_id: string | null;
};
export type RenderMarkdownFailure = CreateRepoFailure;

/** MCP tool: `github_render_markdown_raw`. */
export type RenderMarkdownRawSuccess = {
    success: true;
    message: string;
    http_status: number;
    html: string;
    request_id: string | null;
};
export type RenderMarkdownRawFailure = CreateRepoFailure;

/** MCP tool: `github_get_api_root`. */
export type GetApiRootSuccess = {
    success: true;
    message: string;
    http_status: number;
    root: Record<string, unknown>;
    request_id: string | null;
};
export type GetApiRootFailure = CreateRepoFailure;

/** MCP tool: `github_get_meta`. */
export type GetMetaSuccess = {
    success: true;
    message: string;
    http_status: number;
    meta: Record<string, unknown>;
    request_id: string | null;
};
export type GetMetaFailure = CreateRepoFailure;

/** MCP tool: `github_get_octocat`. */
export type GetOctocatSuccess = {
    success: true;
    message: string;
    http_status: number;
    octocat: string;
    request_id: string | null;
};
export type GetOctocatFailure = CreateRepoFailure;

/** MCP tool: `github_list_api_versions`. */
export type ListApiVersionsSuccess = {
    success: true;
    message: string;
    http_status: number;
    versions: string[];
    request_id: string | null;
};
export type ListApiVersionsFailure = CreateRepoFailure;

/** MCP tool: `github_get_zen`. */
export type GetZenSuccess = {
    success: true;
    message: string;
    http_status: number;
    zen: string;
    request_id: string | null;
};
export type GetZenFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_community_profile_metrics`. */
export type GetRepoCommunityProfileMetricsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    community_profile: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoCommunityProfileMetricsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_code_frequency_stats`. */
export type GetRepoCodeFrequencyStatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    code_frequency: unknown;
    request_id: string | null;
};
export type GetRepoCodeFrequencyStatsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_commit_activity_stats`. */
export type GetRepoCommitActivityStatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    commit_activity: Record<string, unknown>[] | null;
    request_id: string | null;
};
export type GetRepoCommitActivityStatsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_contributors_stats`. */
export type GetRepoContributorsStatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    contributors: Record<string, unknown>[] | null;
    request_id: string | null;
};
export type GetRepoContributorsStatsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_participation_stats`. */
export type GetRepoParticipationStatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    participation: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoParticipationStatsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_punch_card_stats`. */
export type GetRepoPunchCardStatsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    punch_card: unknown;
    request_id: string | null;
};
export type GetRepoPunchCardStatsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_clones`. */
export type GetRepoClonesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    clones: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoClonesFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_top_paths`. */
export type GetRepoTopPathsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    paths: Record<string, unknown>[];
    request_id: string | null;
};
export type GetRepoTopPathsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_top_referrers`. */
export type GetRepoTopReferrersSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    referrers: Record<string, unknown>[];
    request_id: string | null;
};
export type GetRepoTopReferrersFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_views`. */
export type GetRepoViewsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    views: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoViewsFailure = CreateRepoFailure;

/** MCP tool: `github_list_models`. */
export type ListModelsSuccess = {
    success: true;
    message: string;
    http_status: number;
    models: Record<string, unknown>[];
    request_id: string | null;
};
export type ListModelsFailure = CreateRepoFailure;

/** MCP tool: `github_create_model_embeddings`. */
export type CreateModelEmbeddingsSuccess = {
    success: true;
    message: string;
    http_status: number;
    embeddings: Record<string, unknown>;
    request_id: string | null;
};
export type CreateModelEmbeddingsFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_model_embeddings`. */
export type CreateOrgModelEmbeddingsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    embeddings: Record<string, unknown>;
    request_id: string | null;
};
export type CreateOrgModelEmbeddingsFailure = CreateRepoFailure;

/** MCP tool: `github_create_model_chat_completion`. */
export type CreateModelChatCompletionSuccess = {
    success: true;
    message: string;
    http_status: number;
    completion: Record<string, unknown>;
    request_id: string | null;
};
export type CreateModelChatCompletionFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_model_chat_completion`. */
export type CreateOrgModelChatCompletionSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    completion: Record<string, unknown>;
    request_id: string | null;
};
export type CreateOrgModelChatCompletionFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_docker_migration_conflicts`. */
export type ListOrgDockerMigrationConflictsSuccess = { success: true; message: string; http_status: number; org: string; packages: Record<string, unknown>[]; request_id: string | null; };
export type ListOrgDockerMigrationConflictsFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_packages`. */
export type ListOrgPackagesSuccess = { success: true; message: string; org: string; packages: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListOrgPackagesFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_package`. */
export type GetOrgPackageSuccess = { success: true; message: string; http_status: number; org: string; package_type: string; package_name: string; package: Record<string, unknown>; request_id: string | null; };
export type GetOrgPackageFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_package`. */
export type DeleteOrgPackageSuccess = { success: true; message: string; http_status: number; org: string; package_type: string; package_name: string; request_id: string | null; };
export type DeleteOrgPackageFailure = CreateRepoFailure;

/** MCP tool: `github_restore_org_package`. */
export type RestoreOrgPackageSuccess = { success: true; message: string; http_status: number; org: string; package_type: string; package_name: string; request_id: string | null; };
export type RestoreOrgPackageFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_package_versions`. */
export type ListOrgPackageVersionsSuccess = { success: true; message: string; org: string; package_type: string; package_name: string; versions: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListOrgPackageVersionsFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_package_version`. */
export type GetOrgPackageVersionSuccess = { success: true; message: string; http_status: number; org: string; package_type: string; package_name: string; package_version_id: number; version: Record<string, unknown>; request_id: string | null; };
export type GetOrgPackageVersionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_package_version`. */
export type DeleteOrgPackageVersionSuccess = { success: true; message: string; http_status: number; org: string; package_type: string; package_name: string; package_version_id: number; request_id: string | null; };
export type DeleteOrgPackageVersionFailure = CreateRepoFailure;

/** MCP tool: `github_restore_org_package_version`. */
export type RestoreOrgPackageVersionSuccess = { success: true; message: string; http_status: number; org: string; package_type: string; package_name: string; package_version_id: number; request_id: string | null; };
export type RestoreOrgPackageVersionFailure = CreateRepoFailure;

/** MCP tool: `github_list_authenticated_user_docker_migration_conflicts`. */
export type ListAuthenticatedUserDockerMigrationConflictsSuccess = { success: true; message: string; http_status: number; packages: Record<string, unknown>[]; request_id: string | null; };
export type ListAuthenticatedUserDockerMigrationConflictsFailure = CreateRepoFailure;

/** MCP tool: `github_list_authenticated_user_packages`. */
export type ListAuthenticatedUserPackagesSuccess = { success: true; message: string; packages: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListAuthenticatedUserPackagesFailure = CreateRepoFailure;

/** MCP tool: `github_get_authenticated_user_package`. */
export type GetAuthenticatedUserPackageSuccess = { success: true; message: string; http_status: number; package_type: string; package_name: string; package: Record<string, unknown>; request_id: string | null; };
export type GetAuthenticatedUserPackageFailure = CreateRepoFailure;

/** MCP tool: `github_delete_authenticated_user_package`. */
export type DeleteAuthenticatedUserPackageSuccess = { success: true; message: string; http_status: number; package_type: string; package_name: string; request_id: string | null; };
export type DeleteAuthenticatedUserPackageFailure = CreateRepoFailure;

/** MCP tool: `github_restore_authenticated_user_package`. */
export type RestoreAuthenticatedUserPackageSuccess = { success: true; message: string; http_status: number; package_type: string; package_name: string; request_id: string | null; };
export type RestoreAuthenticatedUserPackageFailure = CreateRepoFailure;

/** MCP tool: `github_list_authenticated_user_package_versions`. */
export type ListAuthenticatedUserPackageVersionsSuccess = { success: true; message: string; package_type: string; package_name: string; versions: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListAuthenticatedUserPackageVersionsFailure = CreateRepoFailure;

/** MCP tool: `github_get_authenticated_user_package_version`. */
export type GetAuthenticatedUserPackageVersionSuccess = { success: true; message: string; http_status: number; package_type: string; package_name: string; package_version_id: number; version: Record<string, unknown>; request_id: string | null; };
export type GetAuthenticatedUserPackageVersionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_authenticated_user_package_version`. */
export type DeleteAuthenticatedUserPackageVersionSuccess = { success: true; message: string; http_status: number; package_type: string; package_name: string; package_version_id: number; request_id: string | null; };
export type DeleteAuthenticatedUserPackageVersionFailure = CreateRepoFailure;

/** MCP tool: `github_restore_authenticated_user_package_version`. */
export type RestoreAuthenticatedUserPackageVersionSuccess = { success: true; message: string; http_status: number; package_type: string; package_name: string; package_version_id: number; request_id: string | null; };
export type RestoreAuthenticatedUserPackageVersionFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_docker_migration_conflicts`. */
export type ListUserDockerMigrationConflictsSuccess = { success: true; message: string; http_status: number; username: string; packages: Record<string, unknown>[]; request_id: string | null; };
export type ListUserDockerMigrationConflictsFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_packages`. */
export type ListUserPackagesSuccess = { success: true; message: string; username: string; packages: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListUserPackagesFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_package`. */
export type GetUserPackageSuccess = { success: true; message: string; http_status: number; username: string; package_type: string; package_name: string; package: Record<string, unknown>; request_id: string | null; };
export type GetUserPackageFailure = CreateRepoFailure;

/** MCP tool: `github_delete_user_package`. */
export type DeleteUserPackageSuccess = { success: true; message: string; http_status: number; username: string; package_type: string; package_name: string; request_id: string | null; };
export type DeleteUserPackageFailure = CreateRepoFailure;

/** MCP tool: `github_restore_user_package`. */
export type RestoreUserPackageSuccess = { success: true; message: string; http_status: number; username: string; package_type: string; package_name: string; request_id: string | null; };
export type RestoreUserPackageFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_package_versions`. */
export type ListUserPackageVersionsSuccess = { success: true; message: string; username: string; package_type: string; package_name: string; versions: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListUserPackageVersionsFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_package_version`. */
export type GetUserPackageVersionSuccess = { success: true; message: string; http_status: number; username: string; package_type: string; package_name: string; package_version_id: number; version: Record<string, unknown>; request_id: string | null; };
export type GetUserPackageVersionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_user_package_version`. */
export type DeleteUserPackageVersionSuccess = { success: true; message: string; http_status: number; username: string; package_type: string; package_name: string; package_version_id: number; request_id: string | null; };
export type DeleteUserPackageVersionFailure = CreateRepoFailure;

/** MCP tool: `github_restore_user_package_version`. */
export type RestoreUserPackageVersionSuccess = { success: true; message: string; http_status: number; username: string; package_type: string; package_name: string; package_version_id: number; request_id: string | null; };
export type RestoreUserPackageVersionFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_pages`. */
export type GetRepoPagesSuccess = { success: true; message: string; http_status: number; owner: string; name: string; pages: Record<string, unknown>; request_id: string | null; };
export type GetRepoPagesFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_pages_site`. */
export type CreateRepoPagesSiteSuccess = { success: true; message: string; http_status: number; owner: string; name: string; pages: Record<string, unknown>; request_id: string | null; };
export type CreateRepoPagesSiteFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_pages_site`. */
export type UpdateRepoPagesSiteSuccess = { success: true; message: string; http_status: number; owner: string; name: string; request_id: string | null; };
export type UpdateRepoPagesSiteFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_pages_site`. */
export type DeleteRepoPagesSiteSuccess = { success: true; message: string; http_status: number; owner: string; name: string; request_id: string | null; };
export type DeleteRepoPagesSiteFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_pages_builds`. */
export type ListRepoPagesBuildsSuccess = { success: true; message: string; owner: string; name: string; builds: Record<string, unknown>[]; pagination: GitHubPageLinkPagination | null; request_id: string | null; page: number; per_page: number; pages_fetched: number; truncated?: boolean; };
export type ListRepoPagesBuildsFailure = CreateRepoFailure;

/** MCP tool: `github_request_repo_pages_build`. */
export type RequestRepoPagesBuildSuccess = { success: true; message: string; http_status: number; owner: string; name: string; build: Record<string, unknown>; request_id: string | null; };
export type RequestRepoPagesBuildFailure = CreateRepoFailure;

/** MCP tool: `github_get_latest_repo_pages_build`. */
export type GetLatestRepoPagesBuildSuccess = { success: true; message: string; http_status: number; owner: string; name: string; build: Record<string, unknown>; request_id: string | null; };
export type GetLatestRepoPagesBuildFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_pages_build`. */
export type GetRepoPagesBuildSuccess = { success: true; message: string; http_status: number; owner: string; name: string; build_id: number; build: Record<string, unknown>; request_id: string | null; };
export type GetRepoPagesBuildFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_pages_deployment`. */
export type CreateRepoPagesDeploymentSuccess = { success: true; message: string; http_status: number; owner: string; name: string; deployment: Record<string, unknown>; request_id: string | null; };
export type CreateRepoPagesDeploymentFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_pages_deployment`. */
export type GetRepoPagesDeploymentSuccess = { success: true; message: string; http_status: number; owner: string; name: string; pages_deployment_id: number | string; deployment: Record<string, unknown>; request_id: string | null; };
export type GetRepoPagesDeploymentFailure = CreateRepoFailure;

/** MCP tool: `github_cancel_repo_pages_deployment`. */
export type CancelRepoPagesDeploymentSuccess = { success: true; message: string; http_status: number; owner: string; name: string; pages_deployment_id: number | string; request_id: string | null; };
export type CancelRepoPagesDeploymentFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_pages_health_check`. */
export type GetRepoPagesHealthCheckSuccess = { success: true; message: string; http_status: number; owner: string; name: string; health: Record<string, unknown> | null; request_id: string | null; };
export type GetRepoPagesHealthCheckFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_private_registries`. */
export type ListOrgPrivateRegistriesSuccess = {
    success: true;
    message: string;
    org: string;
    total_count: number;
    configurations: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgPrivateRegistriesFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_private_registry`. */
export type CreateOrgPrivateRegistrySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    registry: Record<string, unknown>;
    request_id: string | null;
};
export type CreateOrgPrivateRegistryFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_private_registries_public_key`. */
export type GetOrgPrivateRegistriesPublicKeySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    public_key: Record<string, unknown>;
    request_id: string | null;
};
export type GetOrgPrivateRegistriesPublicKeyFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_private_registry`. */
export type GetOrgPrivateRegistrySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    registry: Record<string, unknown>;
    request_id: string | null;
};
export type GetOrgPrivateRegistryFailure = CreateRepoFailure;

/** MCP tool: `github_update_org_private_registry`. */
export type UpdateOrgPrivateRegistrySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    request_id: string | null;
};
export type UpdateOrgPrivateRegistryFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_private_registry`. */
export type DeleteOrgPrivateRegistrySuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    secret_name: string;
    request_id: string | null;
};
export type DeleteOrgPrivateRegistryFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_project_draft_item`. */
export type CreateOrgProjectDraftItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    project_number: number;
    item: Record<string, unknown>;
    request_id: string | null;
};
export type CreateOrgProjectDraftItemFailure = CreateRepoFailure;

/** MCP tool: `github_create_user_project_draft_item`. */
export type CreateUserProjectDraftItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    user_id: string;
    project_number: number;
    item: Record<string, unknown>;
    request_id: string | null;
};
export type CreateUserProjectDraftItemFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_project_fields`. */
export type ListOrgProjectFieldsSuccess = {
    success: true;
    message: string;
    org: string;
    project_number: number;
    fields: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgProjectFieldsFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_project_fields`. */
export type ListUserProjectFieldsSuccess = {
    success: true;
    message: string;
    username: string;
    project_number: number;
    fields: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListUserProjectFieldsFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_project_field`. */
export type GetOrgProjectFieldSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    project_number: number;
    field_id: number;
    field: Record<string, unknown>;
    request_id: string | null;
};
export type GetOrgProjectFieldFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_project_field`. */
export type GetUserProjectFieldSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    project_number: number;
    field_id: number;
    field: Record<string, unknown>;
    request_id: string | null;
};
export type GetUserProjectFieldFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_project_field`. */
export type CreateOrgProjectFieldSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    project_number: number;
    field: Record<string, unknown>;
    request_id: string | null;
};
export type CreateOrgProjectFieldFailure = CreateRepoFailure;

/** MCP tool: `github_create_user_project_field`. */
export type CreateUserProjectFieldSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    project_number: number;
    field: Record<string, unknown>;
    request_id: string | null;
};
export type CreateUserProjectFieldFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_project_items`. */
export type ListOrgProjectItemsSuccess = {
    success: true;
    message: string;
    org: string;
    project_number: number;
    items: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgProjectItemsFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_project_items`. */
export type ListUserProjectItemsSuccess = {
    success: true;
    message: string;
    username: string;
    project_number: number;
    items: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListUserProjectItemsFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_project_view_items`. */
export type ListOrgProjectViewItemsSuccess = {
    success: true;
    message: string;
    org: string;
    project_number: number;
    view_number: number;
    items: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgProjectViewItemsFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_project_view_items`. */
export type ListUserProjectViewItemsSuccess = {
    success: true;
    message: string;
    username: string;
    project_number: number;
    view_number: number;
    items: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListUserProjectViewItemsFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_project_item`. */
export type GetOrgProjectItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    project_number: number;
    item_id: number;
    item: Record<string, unknown>;
    request_id: string | null;
};
export type GetOrgProjectItemFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_project_item`. */
export type GetUserProjectItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    project_number: number;
    item_id: number;
    item: Record<string, unknown>;
    request_id: string | null;
};
export type GetUserProjectItemFailure = CreateRepoFailure;

/** MCP tool: `github_add_org_project_item`. */
export type AddOrgProjectItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    project_number: number;
    item: Record<string, unknown>;
    request_id: string | null;
};
export type AddOrgProjectItemFailure = CreateRepoFailure;

/** MCP tool: `github_add_user_project_item`. */
export type AddUserProjectItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    project_number: number;
    item: Record<string, unknown>;
    request_id: string | null;
};
export type AddUserProjectItemFailure = CreateRepoFailure;

/** MCP tool: `github_update_org_project_item`. */
export type UpdateOrgProjectItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    project_number: number;
    item_id: number;
    item: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateOrgProjectItemFailure = CreateRepoFailure;

/** MCP tool: `github_update_user_project_item`. */
export type UpdateUserProjectItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    project_number: number;
    item_id: number;
    item: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateUserProjectItemFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_project_item`. */
export type DeleteOrgProjectItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    project_number: number;
    item_id: number;
    request_id: string | null;
};
export type DeleteOrgProjectItemFailure = CreateRepoFailure;

/** MCP tool: `github_delete_user_project_item`. */
export type DeleteUserProjectItemSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    project_number: number;
    item_id: number;
    request_id: string | null;
};
export type DeleteUserProjectItemFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_projects`. */
export type ListOrgProjectsSuccess = {
    success: true;
    message: string;
    org: string;
    projects: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgProjectsFailure = CreateRepoFailure;

/** MCP tool: `github_list_user_projects`. */
export type ListUserProjectsSuccess = {
    success: true;
    message: string;
    username: string;
    projects: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListUserProjectsFailure = CreateRepoFailure;

/** MCP tool: `github_get_org_project`. */
export type GetOrgProjectSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    project_number: number;
    project: Record<string, unknown>;
    request_id: string | null;
};
export type GetOrgProjectFailure = CreateRepoFailure;

/** MCP tool: `github_get_user_project`. */
export type GetUserProjectSuccess = {
    success: true;
    message: string;
    http_status: number;
    username: string;
    project_number: number;
    project: Record<string, unknown>;
    request_id: string | null;
};
export type GetUserProjectFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_project_view`. */
export type CreateOrgProjectViewSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    project_number: number;
    view: Record<string, unknown>;
    request_id: string | null;
};
export type CreateOrgProjectViewFailure = CreateRepoFailure;

/** MCP tool: `github_create_user_project_view`. */
export type CreateUserProjectViewSuccess = {
    success: true;
    message: string;
    http_status: number;
    user_id: string;
    project_number: number;
    view: Record<string, unknown>;
    request_id: string | null;
};
export type CreateUserProjectViewFailure = CreateRepoFailure;

/** MCP tool: `github_get_rate_limit`. */
export type GetRateLimitSuccess = {
    success: true;
    message: string;
    http_status: number;
    rate_limit: Record<string, unknown>;
    request_id: string | null;
};
export type GetRateLimitFailure = CreateRepoFailure;

/** MCP tool: `github_list_commit_comment_reactions`. */
export type ListCommitCommentReactionsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    comment_id: number;
    reactions: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListCommitCommentReactionsFailure = CreateRepoFailure;

/** MCP tool: `github_create_commit_comment_reaction`. */
export type CreateCommitCommentReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    reaction: Record<string, unknown>;
    request_id: string | null;
};
export type CreateCommitCommentReactionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_commit_comment_reaction`. */
export type DeleteCommitCommentReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    reaction_id: number;
    request_id: string | null;
};
export type DeleteCommitCommentReactionFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_comment_reactions`. */
export type ListIssueCommentReactionsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    comment_id: number;
    reactions: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueCommentReactionsFailure = CreateRepoFailure;

/** MCP tool: `github_create_issue_comment_reaction`. */
export type CreateIssueCommentReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    reaction: Record<string, unknown>;
    request_id: string | null;
};
export type CreateIssueCommentReactionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_issue_comment_reaction`. */
export type DeleteIssueCommentReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    reaction_id: number;
    request_id: string | null;
};
export type DeleteIssueCommentReactionFailure = CreateRepoFailure;

/** MCP tool: `github_list_issue_reactions`. */
export type ListIssueReactionsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    issue_number: number;
    reactions: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListIssueReactionsFailure = CreateRepoFailure;

/** MCP tool: `github_create_issue_reaction`. */
export type CreateIssueReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    reaction: Record<string, unknown>;
    request_id: string | null;
};
export type CreateIssueReactionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_issue_reaction`. */
export type DeleteIssueReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    issue_number: number;
    reaction_id: number;
    request_id: string | null;
};
export type DeleteIssueReactionFailure = CreateRepoFailure;

/** MCP tool: `github_list_pull_request_review_comment_reactions`. */
export type ListPullRequestReviewCommentReactionsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    comment_id: number;
    reactions: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListPullRequestReviewCommentReactionsFailure = CreateRepoFailure;

/** MCP tool: `github_create_pull_request_review_comment_reaction`. */
export type CreatePullRequestReviewCommentReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    reaction: Record<string, unknown>;
    request_id: string | null;
};
export type CreatePullRequestReviewCommentReactionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_pull_request_review_comment_reaction`. */
export type DeletePullRequestReviewCommentReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    comment_id: number;
    reaction_id: number;
    request_id: string | null;
};
export type DeletePullRequestReviewCommentReactionFailure = CreateRepoFailure;

/** MCP tool: `github_list_release_reactions`. */
export type ListReleaseReactionsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    release_id: number;
    reactions: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListReleaseReactionsFailure = CreateRepoFailure;

/** MCP tool: `github_create_release_reaction`. */
export type CreateReleaseReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    release_id: number;
    reaction: Record<string, unknown>;
    request_id: string | null;
};
export type CreateReleaseReactionFailure = CreateRepoFailure;

/** MCP tool: `github_delete_release_reaction`. */
export type DeleteReleaseReactionSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    release_id: number;
    reaction_id: number;
    request_id: string | null;
};
export type DeleteReleaseReactionFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_releases`. */
export type ListRepoReleasesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    releases: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoReleasesFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_release`. */
export type CreateRepoReleaseSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    release: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoReleaseFailure = CreateRepoFailure;

/** MCP tool: `github_generate_repo_release_notes`. */
export type GenerateRepoReleaseNotesSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    notes: Record<string, unknown>;
    request_id: string | null;
};
export type GenerateRepoReleaseNotesFailure = CreateRepoFailure;

/** MCP tool: `github_get_latest_repo_release`. */
export type GetLatestRepoReleaseSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    release: Record<string, unknown>;
    request_id: string | null;
};
export type GetLatestRepoReleaseFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_release_by_tag`. */
export type GetRepoReleaseByTagSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    tag: string;
    release: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoReleaseByTagFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_release`. */
export type GetRepoReleaseSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    release_id: number;
    release: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoReleaseFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_release`. */
export type UpdateRepoReleaseSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    release_id: number;
    release: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoReleaseFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_release`. */
export type DeleteRepoReleaseSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    release_id: number;
    request_id: string | null;
};
export type DeleteRepoReleaseFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_release_assets`. */
export type ListRepoReleaseAssetsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    release_id: number;
    assets: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoReleaseAssetsFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_release_asset`. */
export type GetRepoReleaseAssetSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    asset_id: number;
    asset: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoReleaseAssetFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_release_asset`. */
export type UpdateRepoReleaseAssetSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    asset_id: number;
    asset: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoReleaseAssetFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_release_asset`. */
export type DeleteRepoReleaseAssetSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    asset_id: number;
    request_id: string | null;
};
export type DeleteRepoReleaseAssetFailure = CreateRepoFailure;

/** MCP tool: `github_upload_repo_release_asset`. */
export type UploadRepoReleaseAssetSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    release_id: number;
    asset: Record<string, unknown>;
    request_id: string | null;
};
export type UploadRepoReleaseAssetFailure = CreateRepoFailure;

/** MCP tool: `github_search_code`. */
export type SearchCodeSuccess = {
    success: true;
    message: string;
    q: string;
    total_count: number;
    incomplete_results: boolean;
    items: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type SearchCodeFailure = CreateRepoFailure;

/** MCP tool: `github_search_commits`. */
export type SearchCommitsSuccess = {
    success: true;
    message: string;
    q: string;
    total_count: number;
    incomplete_results: boolean;
    items: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type SearchCommitsFailure = CreateRepoFailure;

/** MCP tool: `github_search_issues`. */
export type SearchIssuesSuccess = {
    success: true;
    message: string;
    q: string;
    total_count: number;
    incomplete_results: boolean;
    items: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type SearchIssuesFailure = CreateRepoFailure;

/** MCP tool: `github_search_labels`. */
export type SearchLabelsSuccess = {
    success: true;
    message: string;
    q: string;
    repository_id: number;
    total_count: number;
    incomplete_results: boolean;
    items: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type SearchLabelsFailure = CreateRepoFailure;

/** MCP tool: `github_search_repositories`. */
export type SearchRepositoriesSuccess = {
    success: true;
    message: string;
    q: string;
    total_count: number;
    incomplete_results: boolean;
    items: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type SearchRepositoriesFailure = CreateRepoFailure;

/** MCP tool: `github_search_topics`. */
export type SearchTopicsSuccess = {
    success: true;
    message: string;
    q: string;
    total_count: number;
    incomplete_results: boolean;
    items: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type SearchTopicsFailure = CreateRepoFailure;

/** MCP tool: `github_search_users`. */
export type SearchUsersSuccess = {
    success: true;
    message: string;
    q: string;
    total_count: number;
    incomplete_results: boolean;
    items: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type SearchUsersFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_secret_scanning_alerts`. */
export type ListOrgSecretScanningAlertsSuccess = {
    success: true;
    message: string;
    org: string;
    alerts: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgSecretScanningAlertsFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_secret_scanning_alerts`. */
export type ListRepoSecretScanningAlertsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    alerts: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoSecretScanningAlertsFailure = CreateRepoFailure;

/** MCP tool: `github_get_secret_scanning_alert`. */
export type GetSecretScanningAlertSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    alert: Record<string, unknown>;
    request_id: string | null;
};
export type GetSecretScanningAlertFailure = CreateRepoFailure;

/** MCP tool: `github_update_secret_scanning_alert`. */
export type UpdateSecretScanningAlertSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    alert: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateSecretScanningAlertFailure = CreateRepoFailure;

/** MCP tool: `github_list_secret_scanning_alert_locations`. */
export type ListSecretScanningAlertLocationsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    alert_number: number;
    locations: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListSecretScanningAlertLocationsFailure = CreateRepoFailure;

/** MCP tool: `github_create_secret_scanning_push_protection_bypass`. */
export type CreateSecretScanningPushProtectionBypassSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    bypass: Record<string, unknown>;
    request_id: string | null;
};
export type CreateSecretScanningPushProtectionBypassFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_secret_scanning_scan_history`. */
export type GetRepoSecretScanningScanHistorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    scan_history: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoSecretScanningScanHistoryFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_secret_scanning_custom_patterns`. */
export type ListOrgSecretScanningCustomPatternsSuccess = {
    success: true;
    message: string;
    org: string;
    custom_patterns: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgSecretScanningCustomPatternsFailure = CreateRepoFailure;

/** MCP tool: `github_create_org_secret_scanning_custom_patterns`. */
export type CreateOrgSecretScanningCustomPatternsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type CreateOrgSecretScanningCustomPatternsFailure = CreateRepoFailure;

/** MCP tool: `github_delete_org_secret_scanning_custom_patterns`. */
export type DeleteOrgSecretScanningCustomPatternsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    request_id: string | null;
};
export type DeleteOrgSecretScanningCustomPatternsFailure = CreateRepoFailure;

/** MCP tool: `github_update_org_secret_scanning_custom_pattern`. */
export type UpdateOrgSecretScanningCustomPatternSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    pattern_id: number;
    custom_pattern: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateOrgSecretScanningCustomPatternFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_secret_scanning_custom_patterns`. */
export type ListRepoSecretScanningCustomPatternsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    custom_patterns: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoSecretScanningCustomPatternsFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_secret_scanning_custom_patterns`. */
export type CreateRepoSecretScanningCustomPatternsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoSecretScanningCustomPatternsFailure = CreateRepoFailure;

/** MCP tool: `github_delete_repo_secret_scanning_custom_patterns`. */
export type DeleteRepoSecretScanningCustomPatternsSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    request_id: string | null;
};
export type DeleteRepoSecretScanningCustomPatternsFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_secret_scanning_custom_pattern`. */
export type UpdateRepoSecretScanningCustomPatternSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    pattern_id: number;
    custom_pattern: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoSecretScanningCustomPatternFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_secret_scanning_pattern_configurations`. */
export type ListOrgSecretScanningPatternConfigurationsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    pattern_configurations: Record<string, unknown>;
    request_id: string | null;
};
export type ListOrgSecretScanningPatternConfigurationsFailure = CreateRepoFailure;

/** MCP tool: `github_update_org_secret_scanning_pattern_configurations`. */
export type UpdateOrgSecretScanningPatternConfigurationsSuccess = {
    success: true;
    message: string;
    http_status: number;
    org: string;
    pattern_configurations: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateOrgSecretScanningPatternConfigurationsFailure = CreateRepoFailure;

/** MCP tool: `github_list_enterprise_secret_scanning_alert_dismissal_requests`. */
export type ListEnterpriseSecretScanningAlertDismissalRequestsSuccess = {
    success: true;
    message: string;
    enterprise: string;
    dismissal_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListEnterpriseSecretScanningAlertDismissalRequestsFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_secret_scanning_alert_dismissal_requests`. */
export type ListOrgSecretScanningAlertDismissalRequestsSuccess = {
    success: true;
    message: string;
    org: string;
    dismissal_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgSecretScanningAlertDismissalRequestsFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_secret_scanning_alert_dismissal_requests`. */
export type ListRepoSecretScanningAlertDismissalRequestsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    dismissal_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoSecretScanningAlertDismissalRequestsFailure = CreateRepoFailure;

/** MCP tool: `github_get_secret_scanning_alert_dismissal_request`. */
export type GetSecretScanningAlertDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    dismissal_request: Record<string, unknown>;
    request_id: string | null;
};
export type GetSecretScanningAlertDismissalRequestFailure = CreateRepoFailure;

/** MCP tool: `github_review_secret_scanning_alert_dismissal_request`. */
export type ReviewSecretScanningAlertDismissalRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    alert_number: number;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type ReviewSecretScanningAlertDismissalRequestFailure = CreateRepoFailure;

/** MCP tool: `github_list_enterprise_secret_scanning_bypass_requests`. */
export type ListEnterpriseSecretScanningBypassRequestsSuccess = {
    success: true;
    message: string;
    enterprise: string;
    bypass_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListEnterpriseSecretScanningBypassRequestsFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_secret_scanning_bypass_requests`. */
export type ListOrgSecretScanningBypassRequestsSuccess = {
    success: true;
    message: string;
    org: string;
    bypass_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgSecretScanningBypassRequestsFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_secret_scanning_bypass_requests`. */
export type ListRepoSecretScanningBypassRequestsSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    bypass_requests: Record<string, unknown>[];
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
    page: number;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoSecretScanningBypassRequestsFailure = CreateRepoFailure;

/** MCP tool: `github_get_secret_scanning_bypass_request`. */
export type GetSecretScanningBypassRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    bypass_request_number: number;
    bypass_request: Record<string, unknown>;
    request_id: string | null;
};
export type GetSecretScanningBypassRequestFailure = CreateRepoFailure;

/** MCP tool: `github_review_secret_scanning_bypass_request`. */
export type ReviewSecretScanningBypassRequestSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    bypass_request_number: number;
    result: Record<string, unknown>;
    request_id: string | null;
};
export type ReviewSecretScanningBypassRequestFailure = CreateRepoFailure;

/** MCP tool: `github_dismiss_secret_scanning_bypass_response`. */
export type DismissSecretScanningBypassResponseSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    bypass_response_id: number;
    request_id: string | null;
};
export type DismissSecretScanningBypassResponseFailure = CreateRepoFailure;

/** MCP tool: `github_list_global_security_advisories`. */
export type ListGlobalSecurityAdvisoriesSuccess = {
    success: true;
    message: string;
    advisories: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListGlobalSecurityAdvisoriesFailure = CreateRepoFailure;

/** MCP tool: `github_get_global_security_advisory`. */
export type GetGlobalSecurityAdvisorySuccess = {
    success: true;
    message: string;
    http_status: number;
    ghsa_id: string;
    advisory: Record<string, unknown>;
    request_id: string | null;
};
export type GetGlobalSecurityAdvisoryFailure = CreateRepoFailure;

/** MCP tool: `github_list_org_repository_security_advisories`. */
export type ListOrgRepositorySecurityAdvisoriesSuccess = {
    success: true;
    message: string;
    org: string;
    advisories: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListOrgRepositorySecurityAdvisoriesFailure = CreateRepoFailure;

/** MCP tool: `github_list_repo_security_advisories`. */
export type ListRepoSecurityAdvisoriesSuccess = {
    success: true;
    message: string;
    owner: string;
    name: string;
    advisories: Record<string, unknown>[];
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
    per_page: number;
    pages_fetched: number;
    truncated?: boolean;
};
export type ListRepoSecurityAdvisoriesFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_security_advisory`. */
export type CreateRepoSecurityAdvisorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    advisory: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoSecurityAdvisoryFailure = CreateRepoFailure;

/** MCP tool: `github_create_private_vulnerability_report`. */
export type CreatePrivateVulnerabilityReportSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    advisory: Record<string, unknown>;
    request_id: string | null;
};
export type CreatePrivateVulnerabilityReportFailure = CreateRepoFailure;

/** MCP tool: `github_get_repo_security_advisory`. */
export type GetRepoSecurityAdvisorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ghsa_id: string;
    advisory: Record<string, unknown>;
    request_id: string | null;
};
export type GetRepoSecurityAdvisoryFailure = CreateRepoFailure;

/** MCP tool: `github_update_repo_security_advisory`. */
export type UpdateRepoSecurityAdvisorySuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ghsa_id: string;
    advisory: Record<string, unknown>;
    request_id: string | null;
};
export type UpdateRepoSecurityAdvisoryFailure = CreateRepoFailure;

/** MCP tool: `github_request_repo_security_advisory_cve`. */
export type RequestRepoSecurityAdvisoryCveSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ghsa_id: string;
    request_id: string | null;
};
export type RequestRepoSecurityAdvisoryCveFailure = CreateRepoFailure;

/** MCP tool: `github_create_repo_security_advisory_temporary_fork`. */
export type CreateRepoSecurityAdvisoryTemporaryForkSuccess = {
    success: true;
    message: string;
    http_status: number;
    owner: string;
    name: string;
    ghsa_id: string;
    fork: Record<string, unknown>;
    request_id: string | null;
};
export type CreateRepoSecurityAdvisoryTemporaryForkFailure = CreateRepoFailure;

