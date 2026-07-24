# Packages MCP tools

Tool implementations wrap [REST API endpoints for packages](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10) under **Packages**. They are registered from `src/index.ts`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (`CreateRepoFailure`).

## Tools

| Tool | Octokit method |
| --- | --- |
| `github_list_org_docker_migration_conflicts` | `listDockerMigrationConflictingPackagesForOrganization` |
| `github_list_org_packages` | `listPackagesForOrganization` |
| `github_get_org_package` | `getPackageForOrganization` |
| `github_delete_org_package` | `deletePackageForOrg` |
| `github_restore_org_package` | `restorePackageForOrg` |
| `github_list_org_package_versions` | `getAllPackageVersionsForPackageOwnedByOrg` |
| `github_get_org_package_version` | `getPackageVersionForOrganization` |
| `github_delete_org_package_version` | `deletePackageVersionForOrg` |
| `github_restore_org_package_version` | `restorePackageVersionForOrg` |
| `github_list_authenticated_user_docker_migration_conflicts` | `listDockerMigrationConflictingPackagesForAuthenticatedUser` |
| `github_list_authenticated_user_packages` | `listPackagesForAuthenticatedUser` |
| `github_get_authenticated_user_package` | `getPackageForAuthenticatedUser` |
| `github_delete_authenticated_user_package` | `deletePackageForAuthenticatedUser` |
| `github_restore_authenticated_user_package` | `restorePackageForAuthenticatedUser` |
| `github_list_authenticated_user_package_versions` | `getAllPackageVersionsForPackageOwnedByAuthenticatedUser` |
| `github_get_authenticated_user_package_version` | `getPackageVersionForAuthenticatedUser` |
| `github_delete_authenticated_user_package_version` | `deletePackageVersionForAuthenticatedUser` |
| `github_restore_authenticated_user_package_version` | `restorePackageVersionForAuthenticatedUser` |
| `github_list_user_docker_migration_conflicts` | `listDockerMigrationConflictingPackagesForUser` |
| `github_list_user_packages` | `listPackagesForUser` |
| `github_get_user_package` | `getPackageForUser` |
| `github_delete_user_package` | `deletePackageForUser` |
| `github_restore_user_package` | `restorePackageForUser` |
| `github_list_user_package_versions` | `getAllPackageVersionsForPackageOwnedByUser` |
| `github_get_user_package_version` | `getPackageVersionForUser` |
| `github_delete_user_package_version` | `deletePackageVersionForUser` |
| `github_restore_user_package_version` | `restorePackageVersionForUser` |
