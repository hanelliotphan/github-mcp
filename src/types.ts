import type { GitHubLinkPagination, GitHubPageLinkPagination } from "./utils/parse-github-link-header.js";

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
    /** Parsed from the response `Link` header; pass `next.after` / `next.before` (etc.) as tool args. */
    pagination: GitHubLinkPagination | null;
    request_id: string | null;
};

export type ListRepoActivitiesFailure = CreateRepoFailure;

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
    /** Parsed from the response `Link` header; use `next.page` / `next.per_page` for the following request when present. */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
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
    /** Parsed from the response `Link` header; use `next.page` / `next.per_page` for the following request when present. */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
};

export type ListRepoTagsFailure = CreateRepoFailure;

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
    /** Parsed from the response `Link` header; use `next.page` / `next.per_page` for the following request when present. */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
};

export type ListRepoTeamsFailure = CreateRepoFailure;

/** GET /repos/{owner}/{repo}/topics — topic names for the repository. */
export type ListRepoTopicsSuccess = {
    success: true;
    message: string;
    names: string[];
    /** Parsed from the response `Link` header; use `next.page` / `next.per_page` for the following request when present. */
    pagination: GitHubPageLinkPagination | null;
    request_id: string | null;
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
