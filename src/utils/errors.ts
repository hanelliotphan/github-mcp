import type { ErrorEnvelope } from "../types.js";

/** HTTP status from Octokit RequestError or similar (`status` or `response.status`). */
export function getHttpStatus(error: unknown): number | undefined {
    if (typeof error !== "object" || error === null) {
        return undefined;
    }
    const e = error as { status?: unknown; response?: { status?: unknown } };
    if (typeof e.status === "number" && !Number.isNaN(e.status)) {
        return e.status;
    }
    if (typeof e.response?.status === "number" && !Number.isNaN(e.response.status)) {
        return e.response.status;
    }
    return undefined;
}

export function isHttpStatus(error: unknown, code: number): boolean {
    return getHttpStatus(error) === code;
}

export function getRequestId(value: unknown): string | null {
    if (typeof value === "string") {
        return value;
    }
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return value[0];
    }
    return null;
}

export function mapGitHubError(error: unknown): ErrorEnvelope {
    // Convert provider-specific errors into one consistent response shape.
    const maybe = error as {
        status?: number;
        message?: string;
    };
    const status = getHttpStatus(error) ?? 500;
    const message = maybe.message ?? "Unknown error";

    if (status === 401) {
        return {
            status_code: status,
            error_type: "auth_error",
            message: "GitHub authentication failed.",
            hint: "Check GITHUB_TOKEN validity and permissions.",
            retryable: false
        };
    }

    if (status === 403) {
        return {
            status_code: status,
            error_type: "permission_error",
            message: "GitHub permission denied.",
            hint: "Ensure token has required scopes (e.g. delete_repo for deletion) and access to this resource.",
            retryable: false
        };
    }

    if (status === 404) {
        return {
            status_code: status,
            error_type: "not_found",
            message: "Resource not found or not accessible.",
            hint: "Check owner and repository name, and that this token may access the repository (private repos need appropriate scope).",
            retryable: false
        };
    }

    if (status === 422) {
        return {
            status_code: status,
            error_type: "validation_error",
            message: "Request validation failed.",
            hint: "Check input fields and constraints, then try again.",
            retryable: false
        };
    }

    if (
        status === 429 ||
        /secondary rate limit/i.test(message) ||
        /rate limit/i.test(message)
    ) {
        return {
            status_code: status,
            error_type: "rate_limit_error",
            message: "GitHub rate limit reached.",
            hint: "Retry later with exponential backoff.",
            retryable: true
        };
    }

    if (status >= 500) {
        return {
            status_code: status,
            error_type: "github_api_error",
            message: "GitHub API returned a server error.",
            hint: "Retry after a short delay.",
            retryable: true
        };
    }

    return {
        status_code: status,
        error_type: "unknown_error",
        message,
        retryable: false
    };
}
