import type {
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
