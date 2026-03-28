import type { GitHubLinkPagination } from "./utils/parse-github-link-header.js";

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
