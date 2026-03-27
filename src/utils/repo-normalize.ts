import type { RepoInfo } from "../types.js";

/** Map GitHub repository API payload to our stable `RepoInfo` shape. */
export function normalizeRepo(data: {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    visibility?: string | null;
    html_url: string;
    clone_url: string;
    ssh_url?: string | null;
    default_branch: string | null;
    created_at: string;
    updated_at: string;
    pushed_at: string | null;
    homepage: string | null;
    fork: boolean;
    archived: boolean;
    disabled?: boolean;
    language: string | null;
    forks_count: number;
    stargazers_count: number;
    open_issues_count: number;
    topics?: string[] | null;
    owner: { login: string; type?: string | null } | null;
    license: { spdx_id?: string | null; name?: string | null } | null;
    permissions?: { admin?: boolean; push?: boolean; pull?: boolean } | null;
}): RepoInfo {
    return {
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        private: data.private,
        visibility: data.visibility ?? null,
        html_url: data.html_url,
        clone_url: data.clone_url,
        ssh_url: data.ssh_url ?? null,
        default_branch: data.default_branch,
        created_at: data.created_at ?? null,
        updated_at: data.updated_at ?? null,
        pushed_at: data.pushed_at,
        homepage: data.homepage,
        fork: data.fork,
        archived: data.archived,
        disabled: data.disabled ?? false,
        language: data.language,
        forks_count: data.forks_count,
        stargazers_count: data.stargazers_count,
        open_issues_count: data.open_issues_count,
        topics: data.topics ?? [],
        owner: {
            login: data.owner?.login ?? "",
            type: data.owner?.type ?? null
        },
        license: data.license
            ? {
                  spdx_id: data.license.spdx_id ?? null,
                  name: data.license.name ?? null
              }
            : null,
        permissions: data.permissions
            ? {
                  admin: data.permissions.admin ?? false,
                  push: data.permissions.push ?? false,
                  pull: data.permissions.pull ?? false
              }
            : null
    };
}
