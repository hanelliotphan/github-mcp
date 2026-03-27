/** Cursors to pass as `before` / `after` on the next request (GitHub REST cursor pagination). */
export type GitHubPageCursors = {
    after: string | null;
    before: string | null;
};

export type GitHubLinkPagination = {
    next: GitHubPageCursors | null;
    prev: GitHubPageCursors | null;
    first: GitHubPageCursors | null;
    last: GitHubPageCursors | null;
};

function parseRelations(linkHeader: string): Map<string, string> {
    const relations = new Map<string, string>();
    const re = /<([^>]+)>\s*;\s*rel="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(linkHeader)) !== null) {
        relations.set(m[2], m[1]);
    }
    return relations;
}

function cursorsFromHref(href: string): GitHubPageCursors {
    try {
        const u = new URL(href);
        const after = u.searchParams.get("after");
        const before = u.searchParams.get("before");
        return {
            after: after && after.length > 0 ? after : null,
            before: before && before.length > 0 ? before : null
        };
    } catch {
        return { after: null, before: null };
    }
}

/**
 * Parses GitHub `Link` response header into cursor params for `before` / `after`.
 * @see https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api
 */
export function parseGitHubLinkPagination(linkHeader: string | undefined): GitHubLinkPagination | null {
    if (linkHeader == null || linkHeader === "") {
        return null;
    }
    const rels = parseRelations(linkHeader);
    const nextUrl = rels.get("next");
    const prevUrl = rels.get("prev");
    const firstUrl = rels.get("first");
    const lastUrl = rels.get("last");
    if (!nextUrl && !prevUrl && !firstUrl && !lastUrl) {
        return null;
    }
    return {
        next: nextUrl ? cursorsFromHref(nextUrl) : null,
        prev: prevUrl ? cursorsFromHref(prevUrl) : null,
        first: firstUrl ? cursorsFromHref(firstUrl) : null,
        last: lastUrl ? cursorsFromHref(lastUrl) : null
    };
}

export function getLinkHeaderFromResponse(headers: {
    link?: string | undefined;
    Link?: string | undefined;
}): string | undefined {
    const h = headers as Record<string, string | undefined>;
    return h.link ?? h.Link;
}
