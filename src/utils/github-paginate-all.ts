import type {
    GitHubCursorQueryLinkPagination,
    GitHubLinkPagination,
    GitHubPageLinkPagination,
    GitHubSinceLinkPagination
} from "./parse-github-link-header.js";
import {
    parseGitHubCursorQueryLinkPagination,
    parseGitHubLinkPagination,
    parseGitHubPageLinkPagination,
    parseGitHubSinceLinkPagination
} from "./parse-github-link-header.js";

/** Default cap for `all_pages` / `max_pages` when callers omit it. */
export const DEFAULT_MAX_ALL_PAGES = 100 as const;

export type PaginateChunkResult<T> = {
    rows: T[];
    linkHeader: string | undefined;
    requestId: string | null;
};

/**
 * Follow `Link` headers that use `page` / `per_page` (standard numeric pagination).
 */
export async function fetchAllPageLinkPages<T>(options: {
    perPage: number;
    maxPages: number;
    fetchPage: (page: number, perPage: number) => Promise<PaginateChunkResult<T>>;
}): Promise<{
    rows: T[];
    pagesFetched: number;
    lastPage: number;
    lastRequestId: string | null;
    truncated: boolean;
    /** `null` when every page was fetched; when `truncated`, includes `next` for follow-up. */
    responsePagination: GitHubPageLinkPagination | null;
}> {
    const aggregated: T[] = [];
    let currentPage = 1;
    let pagesFetched = 0;
    let lastRequestId: string | null = null;
    let lastPagination: GitHubPageLinkPagination | null = null;

    while (pagesFetched < options.maxPages) {
        const { rows, linkHeader, requestId } = await options.fetchPage(currentPage, options.perPage);
        lastRequestId = requestId;
        lastPagination = parseGitHubPageLinkPagination(linkHeader);
        aggregated.push(...rows);
        pagesFetched++;
        const next = lastPagination?.next;
        if (rows.length === 0 || next == null) {
            return {
                rows: aggregated,
                pagesFetched,
                lastPage: currentPage,
                lastRequestId,
                truncated: false,
                responsePagination: null
            };
        }
        currentPage = next.page;
    }
    const truncated = lastPagination?.next != null;
    return {
        rows: aggregated,
        pagesFetched,
        lastPage: currentPage,
        lastRequestId,
        truncated,
        responsePagination: truncated ? lastPagination : null
    };
}

/**
 * Follow `Link` headers for `GET /repositories` (`since` id cursor).
 */
export async function fetchAllSinceLinkPages<T>(options: {
    maxPages: number;
    initialSince: number | undefined;
    fetchChunk: (since: number | undefined) => Promise<PaginateChunkResult<T>>;
}): Promise<{
    rows: T[];
    pagesFetched: number;
    /** `since` query used on the last request in this run. */
    lastSinceUsed: number | undefined;
    lastRequestId: string | null;
    truncated: boolean;
    responsePagination: GitHubSinceLinkPagination | null;
}> {
    let since: number | undefined = options.initialSince;
    const aggregated: T[] = [];
    let pagesFetched = 0;
    let lastRequestId: string | null = null;
    let lastPagination: GitHubSinceLinkPagination | null = null;

    while (pagesFetched < options.maxPages) {
        const { rows, linkHeader, requestId } = await options.fetchChunk(since);
        lastRequestId = requestId;
        lastPagination = parseGitHubSinceLinkPagination(linkHeader);
        aggregated.push(...rows);
        pagesFetched++;
        const nextSince = lastPagination?.next?.since;
        if (rows.length === 0 || nextSince == null) {
            return {
                rows: aggregated,
                pagesFetched,
                lastSinceUsed: since,
                lastRequestId,
                truncated: false,
                responsePagination: null
            };
        }
        since = nextSince;
    }
    const truncated = lastPagination?.next != null;
    return {
        rows: aggregated,
        pagesFetched,
        lastSinceUsed: since,
        lastRequestId,
        truncated,
        responsePagination: truncated ? lastPagination : null
    };
}

/**
 * Follow `Link` headers that use `after` / `before` cursors (e.g. repository activity).
 */
export async function fetchAllCursorLinkPages<T>(options: {
    maxPages: number;
    initialAfter?: string | undefined;
    initialBefore?: string | undefined;
    fetchChunk: (cursors: { after?: string; before?: string }) => Promise<PaginateChunkResult<T>>;
}): Promise<{
    rows: T[];
    pagesFetched: number;
    lastRequestId: string | null;
    truncated: boolean;
    responsePagination: GitHubLinkPagination | null;
}> {
    let after: string | undefined = options.initialAfter;
    let before: string | undefined = options.initialBefore;
    const aggregated: T[] = [];
    let pagesFetched = 0;
    let lastRequestId: string | null = null;
    let lastPagination: GitHubLinkPagination | null = null;

    while (pagesFetched < options.maxPages) {
        const { rows, linkHeader, requestId } = await options.fetchChunk({ after, before });
        lastRequestId = requestId;
        lastPagination = parseGitHubLinkPagination(linkHeader);
        aggregated.push(...rows);
        pagesFetched++;
        const next = lastPagination?.next;
        if (
            rows.length === 0 ||
            next == null ||
            (next.after == null && next.before == null)
        ) {
            return {
                rows: aggregated,
                pagesFetched,
                lastRequestId,
                truncated: false,
                responsePagination: null
            };
        }
        after = next.after ?? undefined;
        before = next.before ?? undefined;
    }
    const truncated = lastPagination?.next != null;
    return {
        rows: aggregated,
        pagesFetched,
        lastRequestId,
        truncated,
        responsePagination: truncated ? lastPagination : null
    };
}

/**
 * Follow `Link` headers that use the `cursor` query param (e.g. list repository webhook deliveries).
 */
export async function fetchAllCursorQueryLinkPages<T>(options: {
    perPage: number;
    maxPages: number;
    initialCursor: string | undefined;
    fetchChunk: (cursor: string | undefined) => Promise<PaginateChunkResult<T>>;
}): Promise<{
    rows: T[];
    pagesFetched: number;
    /** `cursor` query passed on the last request in this run. */
    lastCursorUsed: string | undefined;
    lastRequestId: string | null;
    truncated: boolean;
    /** `null` when every page was fetched; when `truncated`, includes `next` for follow-up. */
    responsePagination: GitHubCursorQueryLinkPagination | null;
}> {
    let cursor: string | undefined = options.initialCursor;
    const aggregated: T[] = [];
    let pagesFetched = 0;
    let lastRequestId: string | null = null;
    let lastPagination: GitHubCursorQueryLinkPagination | null = null;

    while (pagesFetched < options.maxPages) {
        const { rows, linkHeader, requestId } = await options.fetchChunk(cursor);
        lastRequestId = requestId;
        lastPagination = parseGitHubCursorQueryLinkPagination(linkHeader);
        aggregated.push(...rows);
        pagesFetched++;
        const nextCursor = lastPagination?.next?.cursor;
        if (rows.length === 0 || nextCursor == null || nextCursor === "") {
            return {
                rows: aggregated,
                pagesFetched,
                lastCursorUsed: cursor,
                lastRequestId,
                truncated: false,
                responsePagination: null
            };
        }
        cursor = nextCursor;
    }
    const truncated = lastPagination?.next != null && lastPagination.next.cursor != null;
    return {
        rows: aggregated,
        pagesFetched,
        lastCursorUsed: cursor,
        lastRequestId,
        truncated,
        responsePagination: truncated ? lastPagination : null
    };
}
