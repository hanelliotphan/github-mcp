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
