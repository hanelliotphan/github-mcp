#!/usr/bin/env node
/**
 * Generate GitHub Copilot MCP tools for one section at a time.
 * Usage: node scripts/generate-copilot-section.mjs <section-number> (1-6)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function pascalFromTool(name) {
    return name
        .replace(/^github_/, "")
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
}

function registerFn(name) {
    return `registerGithub${pascalFromTool(name)}Tool`;
}

function kebabFromTool(name) {
    return name.replace(/_/g, "-");
}

const COMMON = {
    ownerLoginRegex: `/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/`,
    repoNameRegex: `/^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/`,
    orgLoginRegex: `/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/`,
    enterpriseSlugRegex: `/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/`,
    dayRegex: `/^\\d{4}-\\d{2}-\\d{2}$/`
};

const SECTIONS = {
    1: {
        folder: "copilot-cloud-agent-management",
        readmeTitle: "Copilot cloud agent repository management",
        docsUrl:
            "https://docs.github.com/en/rest/copilot/copilot-cloud-agent-management?apiVersion=2026-03-10",
        tools: [
            {
                name: "github_get_repo_copilot_cloud_agent_configuration",
                description:
                    "Get Copilot cloud agent configuration for a repository (GET /repos/{owner}/{repo}/copilot/cloud-agent/configuration). Public preview. Returns MCP server configuration, enabled review tools, Actions workflow approval settings, and firewall configuration. See [Get Copilot cloud agent configuration for a repository](https://docs.github.com/en/rest/copilot/copilot-cloud-agent-management?apiVersion=2026-03-10#get-copilot-cloud-agent-configuration-for-a-repository).",
                kind: "get",
                method: "GET /repos/{owner}/{repo}/copilot/cloud-agent/configuration",
                params: ["owner", "name"],
                mapRepo: true,
                resultKey: "configuration"
            }
        ]
    },
    2: {
        folder: "copilot-coding-agent-management",
        readmeTitle: "Copilot coding agent management",
        docsUrl:
            "https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10",
        tools: [
            {
                name: "github_set_enterprise_copilot_coding_agent_policy",
                description:
                    "Set the Copilot cloud agent policy for an enterprise (PUT /enterprises/{enterprise}/copilot/policies/coding_agent). policy_state required: enabled_for_all_orgs, disabled_for_all_orgs, enabled_for_selected_orgs, or configured_by_org_admins. Returns HTTP 204. See [Set the coding agent policy for an enterprise](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#set-the-coding-agent-policy-for-an-enterprise).",
                kind: "put204",
                method: "PUT /enterprises/{enterprise}/copilot/policies/coding_agent",
                params: ["enterprise"],
                body: [{ key: "policy_state", zod: 'z.enum(["enabled_for_all_orgs", "disabled_for_all_orgs", "enabled_for_selected_orgs", "configured_by_org_admins"])', required: true }]
            },
            {
                name: "github_add_enterprise_copilot_coding_agent_organizations",
                description:
                    "Add organizations to the enterprise Copilot cloud agent policy (POST /enterprises/{enterprise}/copilot/policies/coding_agent/organizations). Enterprise policy must be enabled_for_selected_orgs. Optional organizations (logins) and/or custom_properties filters. Returns HTTP 204. See [Add organizations to the enterprise coding agent policy](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#add-organizations-to-the-enterprise-coding-agent-policy).",
                kind: "post204",
                method: "POST /enterprises/{enterprise}/copilot/policies/coding_agent/organizations",
                params: ["enterprise"],
                body: [
                    { key: "organizations", zod: "z.array(z.string().min(1)).optional()" },
                    {
                        key: "custom_properties",
                        zod: 'z.array(z.object({ property_name: z.string().min(1), values: z.array(z.string().min(1)).min(1) })).optional()'
                    }
                ]
            },
            {
                name: "github_remove_enterprise_copilot_coding_agent_organizations",
                description:
                    "Remove organizations from the enterprise Copilot cloud agent policy (DELETE /enterprises/{enterprise}/copilot/policies/coding_agent/organizations). Enterprise policy must be enabled_for_selected_orgs. Optional organizations (logins) and/or custom_properties filters. Returns HTTP 204. See [Remove organizations from the enterprise coding agent policy](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#remove-organizations-from-the-enterprise-coding-agent-policy).",
                kind: "delete204body",
                method: "DELETE /enterprises/{enterprise}/copilot/policies/coding_agent/organizations",
                params: ["enterprise"],
                body: [
                    { key: "organizations", zod: "z.array(z.string().min(1)).optional()" },
                    {
                        key: "custom_properties",
                        zod: 'z.array(z.object({ property_name: z.string().min(1), values: z.array(z.string().min(1)).min(1) })).optional()'
                    }
                ]
            },
            {
                name: "github_get_org_copilot_coding_agent_permissions",
                description:
                    "Get Copilot cloud agent repository permissions for an organization (GET /orgs/{org}/copilot/coding-agent/permissions). Public preview. Returns enabled_repositories (all|selected|none) and selected_repositories_url. See [Get Copilot cloud agent permissions for an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#get-copilot-cloud-agent-permissions-for-an-organization).",
                kind: "get",
                method: "GET /orgs/{org}/copilot/coding-agent/permissions",
                params: ["org"],
                resultKey: "permissions"
            },
            {
                name: "github_set_org_copilot_coding_agent_permissions",
                description:
                    "Set Copilot cloud agent repository permissions for an organization (PUT /orgs/{org}/copilot/coding-agent/permissions). enabled_repositories required: all, selected, or none. Returns HTTP 204. See [Set Copilot cloud agent permissions for an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#set-copilot-cloud-agent-permissions-for-an-organization).",
                kind: "put204",
                method: "PUT /orgs/{org}/copilot/coding-agent/permissions",
                params: ["org"],
                body: [{ key: "enabled_repositories", zod: 'z.enum(["all", "selected", "none"])', required: true }]
            },
            {
                name: "github_list_org_copilot_coding_agent_repositories",
                description:
                    "List repositories enabled for Copilot cloud agent in an organization (GET /orgs/{org}/copilot/coding-agent/permissions/repositories). Returns total_count and repositories. Use per_page/page; all_pages follows Link headers. See [List repositories enabled for Copilot cloud agent in an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#list-repositories-enabled-for-copilot-cloud-agent-in-an-organization).",
                kind: "list",
                method: "GET /orgs/{org}/copilot/coding-agent/permissions/repositories",
                params: ["org"],
                listKey: "repositories",
                countKey: "total_count"
            },
            {
                name: "github_set_org_copilot_coding_agent_repositories",
                description:
                    "Replace selected repositories enabled for Copilot cloud agent (PUT /orgs/{org}/copilot/coding-agent/permissions/repositories). selected_repository_ids required. Organization policy must be selected. Returns HTTP 204. See [Set selected repositories for Copilot cloud agent in an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#set-selected-repositories-for-copilot-cloud-agent-in-an-organization).",
                kind: "put204",
                method: "PUT /orgs/{org}/copilot/coding-agent/permissions/repositories",
                params: ["org"],
                body: [{ key: "selected_repository_ids", zod: "z.array(z.number().int().positive()).min(1)", required: true }]
            },
            {
                name: "github_enable_org_copilot_coding_agent_repository",
                description:
                    "Enable a repository for Copilot cloud agent in an organization (PUT /orgs/{org}/copilot/coding-agent/permissions/repositories/{repository_id}). Organization policy must be selected. Returns HTTP 204. See [Enable a repository for Copilot cloud agent in an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#enable-a-repository-for-copilot-cloud-agent-in-an-organization).",
                kind: "put204",
                method: "PUT /orgs/{org}/copilot/coding-agent/permissions/repositories/{repository_id}",
                params: ["org", "repository_id"]
            },
            {
                name: "github_disable_org_copilot_coding_agent_repository",
                description:
                    "Disable a repository for Copilot cloud agent in an organization (DELETE /orgs/{org}/copilot/coding-agent/permissions/repositories/{repository_id}). Organization policy must be selected. Returns HTTP 204. See [Disable a repository for Copilot cloud agent in an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#disable-a-repository-for-copilot-cloud-agent-in-an-organization).",
                kind: "delete204",
                method: "DELETE /orgs/{org}/copilot/coding-agent/permissions/repositories/{repository_id}",
                params: ["org", "repository_id"]
            }
        ]
    },
    3: {
        folder: "copilot-content-exclusion-management",
        readmeTitle: "Copilot content exclusion management",
        docsUrl:
            "https://docs.github.com/en/rest/copilot/copilot-content-exclusion-management?apiVersion=2026-03-10",
        tools: [
            {
                name: "github_get_org_copilot_content_exclusion",
                description:
                    "Get Copilot content exclusion rules for an organization (GET /orgs/{org}/copilot/content_exclusion). Public preview. Returns a map of repository names to path exclusion arrays. See [Get Copilot content exclusion rules for an organization](https://docs.github.com/en/rest/copilot/copilot-content-exclusion-management?apiVersion=2026-03-10#get-copilot-content-exclusion-rules-for-an-organization).",
                kind: "get",
                method: "GET /orgs/{org}/copilot/content_exclusion",
                params: ["org"],
                resultKey: "rules"
            },
            {
                name: "github_set_org_copilot_content_exclusion",
                description:
                    "Set Copilot content exclusion rules for an organization (PUT /orgs/{org}/copilot/content_exclusion). rules is a map of repository name to path arrays; sent as the JSON request body. See [Set Copilot content exclusion rules for an organization](https://docs.github.com/en/rest/copilot/copilot-content-exclusion-management?apiVersion=2026-03-10#set-copilot-content-exclusion-rules-for-an-organization).",
                kind: "putRules",
                method: "PUT /orgs/{org}/copilot/content_exclusion",
                params: ["org"],
                body: [{ key: "rules", zod: "z.record(z.string(), z.array(z.string()))", required: true }]
            }
        ]
    },
    4: {
        folder: "copilot-custom-agents",
        readmeTitle: "Copilot custom agents",
        docsUrl: "https://docs.github.com/en/rest/copilot/copilot-custom-agents?apiVersion=2026-03-10",
        tools: [
            {
                name: "github_list_enterprise_copilot_custom_agents",
                description:
                    "List custom agents for an enterprise (GET /enterprises/{enterprise}/copilot/custom-agents). Returns custom_agents (may be null). Supports per_page/page and all_pages when Link headers are present. See [Get custom agents for an enterprise](https://docs.github.com/en/rest/copilot/copilot-custom-agents?apiVersion=2026-03-10#get-custom-agents-for-an-enterprise).",
                kind: "listCustomAgents",
                method: "GET /enterprises/{enterprise}/copilot/custom-agents",
                params: ["enterprise"],
                listKey: "custom_agents"
            },
            {
                name: "github_get_enterprise_copilot_custom_agents_source",
                description:
                    "Get the source organization for custom agents in an enterprise (GET /enterprises/{enterprise}/copilot/custom-agents/source). See [Get the source organization for custom agents in an enterprise](https://docs.github.com/en/rest/copilot/copilot-custom-agents?apiVersion=2026-03-10#get-the-source-organization-for-custom-agents-in-an-enterprise).",
                kind: "get",
                method: "GET /enterprises/{enterprise}/copilot/custom-agents/source",
                params: ["enterprise"],
                resultKey: "source"
            },
            {
                name: "github_set_enterprise_copilot_custom_agents_source",
                description:
                    "Set the source organization for custom agents in an enterprise (PUT /enterprises/{enterprise}/copilot/custom-agents/source). organization_id required; create_ruleset optional (default true). See [Set the source organization for custom agents in an enterprise](https://docs.github.com/en/rest/copilot/copilot-custom-agents?apiVersion=2026-03-10#set-the-source-organization-for-custom-agents-in-an-enterprise).",
                kind: "put",
                method: "PUT /enterprises/{enterprise}/copilot/custom-agents/source",
                params: ["enterprise"],
                body: [
                    { key: "organization_id", zod: "z.number().int().positive()", required: true },
                    { key: "create_ruleset", zod: "z.boolean().optional()" }
                ],
                resultKey: "source"
            },
            {
                name: "github_delete_enterprise_copilot_custom_agents_source",
                description:
                    "Delete the custom agents source for an enterprise (DELETE /enterprises/{enterprise}/copilot/custom-agents/source). Returns HTTP 204. See [Delete the custom agents source for an enterprise](https://docs.github.com/en/rest/copilot/copilot-custom-agents?apiVersion=2026-03-10#delete-the-custom-agents-source-for-an-enterprise).",
                kind: "delete204",
                method: "DELETE /enterprises/{enterprise}/copilot/custom-agents/source",
                params: ["enterprise"]
            }
        ]
    },
    5: {
        folder: "copilot-usage-metrics",
        readmeTitle: "Copilot usage metrics",
        docsUrl: "https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10",
        tools: [
            {
                name: "github_get_enterprise_copilot_metrics_1_day",
                description:
                    "Get Copilot enterprise usage metrics download links for a specific day (GET /enterprises/{enterprise}/copilot/metrics/reports/enterprise-1-day). day (YYYY-MM-DD) required. See [Get Copilot enterprise usage metrics for a specific day](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-usage-metrics-for-a-specific-day).",
                kind: "metrics",
                method: "GET /enterprises/{enterprise}/copilot/metrics/reports/enterprise-1-day",
                params: ["enterprise"],
                query: ["day"]
            },
            {
                name: "github_get_enterprise_copilot_metrics_28_day",
                description:
                    "Get latest 28-day Copilot enterprise usage metrics download links (GET /enterprises/{enterprise}/copilot/metrics/reports/enterprise-28-day/latest). See [Get Copilot enterprise usage metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-usage-metrics).",
                kind: "metrics",
                method: "GET /enterprises/{enterprise}/copilot/metrics/reports/enterprise-28-day/latest",
                params: ["enterprise"]
            },
            {
                name: "github_get_enterprise_copilot_repos_metrics_1_day",
                description:
                    "Get Copilot enterprise repository metrics download links for a specific day (GET /enterprises/{enterprise}/copilot/metrics/reports/repos-1-day). day (YYYY-MM-DD) required. See [Get Copilot enterprise repository report for a specific day](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-repository-report-for-a-specific-day).",
                kind: "metrics",
                method: "GET /enterprises/{enterprise}/copilot/metrics/reports/repos-1-day",
                params: ["enterprise"],
                query: ["day"]
            },
            {
                name: "github_get_enterprise_copilot_user_teams_metrics_1_day",
                description:
                    "Get Copilot enterprise user-teams metrics download links for a specific day (GET /enterprises/{enterprise}/copilot/metrics/reports/user-teams-1-day). day (YYYY-MM-DD) required. See [Get Copilot enterprise user-teams report for a specific day](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-user-teams-report-for-a-specific-day).",
                kind: "metrics",
                method: "GET /enterprises/{enterprise}/copilot/metrics/reports/user-teams-1-day",
                params: ["enterprise"],
                query: ["day"]
            },
            {
                name: "github_get_enterprise_copilot_users_metrics_1_day",
                description:
                    "Get Copilot enterprise users metrics download links for a specific day (GET /enterprises/{enterprise}/copilot/metrics/reports/users-1-day). day (YYYY-MM-DD) required. See [Get Copilot enterprise users report for a specific day](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-users-report-for-a-specific-day).",
                kind: "metrics",
                method: "GET /enterprises/{enterprise}/copilot/metrics/reports/users-1-day",
                params: ["enterprise"],
                query: ["day"]
            },
            {
                name: "github_get_enterprise_copilot_users_metrics_28_day",
                description:
                    "Get latest 28-day Copilot enterprise users metrics download links (GET /enterprises/{enterprise}/copilot/metrics/reports/users-28-day/latest). See [Get Copilot enterprise users metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-users-metrics).",
                kind: "metrics",
                method: "GET /enterprises/{enterprise}/copilot/metrics/reports/users-28-day/latest",
                params: ["enterprise"]
            },
            {
                name: "github_get_org_copilot_metrics_1_day",
                description:
                    "Get Copilot organization usage metrics download links for a specific day (GET /orgs/{org}/copilot/metrics/reports/organization-1-day). day (YYYY-MM-DD) required. See [Get Copilot organization usage metrics for a specific day](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-usage-metrics-for-a-specific-day).",
                kind: "metrics",
                method: "GET /orgs/{org}/copilot/metrics/reports/organization-1-day",
                params: ["org"],
                query: ["day"]
            },
            {
                name: "github_get_org_copilot_metrics_28_day",
                description:
                    "Get latest 28-day Copilot organization usage metrics download links (GET /orgs/{org}/copilot/metrics/reports/organization-28-day/latest). See [Get Copilot organization usage metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-usage-metrics).",
                kind: "metrics",
                method: "GET /orgs/{org}/copilot/metrics/reports/organization-28-day/latest",
                params: ["org"]
            },
            {
                name: "github_get_org_copilot_repos_metrics_1_day",
                description:
                    "Get Copilot organization repository metrics download links for a specific day (GET /orgs/{org}/copilot/metrics/reports/repos-1-day). day (YYYY-MM-DD) required. See [Get Copilot organization repository report for a specific day](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-repository-report-for-a-specific-day).",
                kind: "metrics",
                method: "GET /orgs/{org}/copilot/metrics/reports/repos-1-day",
                params: ["org"],
                query: ["day"]
            },
            {
                name: "github_get_org_copilot_user_teams_metrics_1_day",
                description:
                    "Get Copilot organization user-teams metrics download links for a specific day (GET /orgs/{org}/copilot/metrics/reports/user-teams-1-day). day (YYYY-MM-DD) required. See [Get Copilot organization user-teams report for a specific day](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-user-teams-report-for-a-specific-day).",
                kind: "metrics",
                method: "GET /orgs/{org}/copilot/metrics/reports/user-teams-1-day",
                params: ["org"],
                query: ["day"]
            },
            {
                name: "github_get_org_copilot_users_metrics_1_day",
                description:
                    "Get Copilot organization users metrics download links for a specific day (GET /orgs/{org}/copilot/metrics/reports/users-1-day). day (YYYY-MM-DD) required. See [Get Copilot organization users report for a specific day](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-users-report-for-a-specific-day).",
                kind: "metrics",
                method: "GET /orgs/{org}/copilot/metrics/reports/users-1-day",
                params: ["org"],
                query: ["day"]
            },
            {
                name: "github_get_org_copilot_users_metrics_28_day",
                description:
                    "Get latest 28-day Copilot organization users metrics download links (GET /orgs/{org}/copilot/metrics/reports/users-28-day/latest). See [Get Copilot organization users metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-users-metrics).",
                kind: "metrics",
                method: "GET /orgs/{org}/copilot/metrics/reports/users-28-day/latest",
                params: ["org"]
            }
        ]
    },
    6: {
        folder: "copilot-user-management",
        readmeTitle: "Copilot user management",
        docsUrl: "https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10",
        tools: [
            {
                name: "github_get_org_copilot_billing",
                description:
                    "Get Copilot seat information and settings for an organization (GET /orgs/{org}/copilot/billing). Public preview. Returns seat_breakdown and feature policies. See [Get Copilot seat information and settings for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#get-copilot-seat-information-and-settings-for-an-organization).",
                kind: "copilotGet",
                octokit: "getCopilotOrganizationDetails",
                params: ["org"],
                resultKey: "billing"
            },
            {
                name: "github_list_org_copilot_seats",
                description:
                    "List all Copilot seat assignments for an organization (GET /orgs/{org}/copilot/billing/seats). Returns total_seats and seats. Use per_page/page; all_pages follows Link headers. See [List all Copilot seat assignments for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#list-all-copilot-seat-assignments-for-an-organization).",
                kind: "copilotListSeats",
                octokit: "listCopilotSeats",
                params: ["org"],
                listKey: "seats",
                countKey: "total_seats"
            },
            {
                name: "github_add_org_copilot_seats_for_teams",
                description:
                    "Add teams to the Copilot subscription for an organization (POST /orgs/{org}/copilot/billing/selected_teams). selected_teams required. Returns HTTP 201 with seats_created. See [Add teams to the Copilot subscription for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#add-teams-to-the-copilot-subscription-for-an-organization).",
                kind: "copilotPost",
                octokit: "addCopilotSeatsForTeams",
                params: ["org"],
                body: [{ key: "selected_teams", zod: "z.array(z.string().min(1)).min(1)", required: true }],
                resultKey: "result"
            },
            {
                name: "github_remove_org_copilot_seats_for_teams",
                description:
                    "Remove teams from the Copilot subscription for an organization (DELETE /orgs/{org}/copilot/billing/selected_teams). selected_teams required. Returns seats_cancelled. See [Remove teams from the Copilot subscription for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#remove-teams-from-the-copilot-subscription-for-an-organization).",
                kind: "copilotDelete",
                octokit: "cancelCopilotSeatAssignmentForTeams",
                params: ["org"],
                body: [{ key: "selected_teams", zod: "z.array(z.string().min(1)).min(1)", required: true }],
                resultKey: "result"
            },
            {
                name: "github_add_org_copilot_seats_for_users",
                description:
                    "Add users to the Copilot subscription for an organization (POST /orgs/{org}/copilot/billing/selected_users). selected_usernames required. Returns HTTP 201 with seats_created. See [Add users to the Copilot subscription for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#add-users-to-the-copilot-subscription-for-an-organization).",
                kind: "copilotPost",
                octokit: "addCopilotSeatsForUsers",
                params: ["org"],
                body: [{ key: "selected_usernames", zod: "z.array(z.string().min(1)).min(1)", required: true }],
                resultKey: "result"
            },
            {
                name: "github_remove_org_copilot_seats_for_users",
                description:
                    "Remove users from the Copilot subscription for an organization (DELETE /orgs/{org}/copilot/billing/selected_users). selected_usernames required. Returns seats_cancelled. See [Remove users from the Copilot subscription for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#remove-users-from-the-copilot-subscription-for-an-organization).",
                kind: "copilotDelete",
                octokit: "cancelCopilotSeatAssignmentForUsers",
                params: ["org"],
                body: [{ key: "selected_usernames", zod: "z.array(z.string().min(1)).min(1)", required: true }],
                resultKey: "result"
            },
            {
                name: "github_get_org_copilot_seat_details_for_user",
                description:
                    "Get Copilot seat assignment details for a user (GET /orgs/{org}/members/{username}/copilot). Public preview. See [Get Copilot seat assignment details for a user](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#get-copilot-seat-assignment-details-for-a-user).",
                kind: "copilotGet",
                octokit: "getCopilotSeatDetailsForUser",
                params: ["org", "username"],
                resultKey: "seat"
            }
        ]
    }
};

function zodParam(p) {
    if (p === "owner")
        return `owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)")`;
    if (p === "name")
        return `name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")`;
    if (p === "org")
        return `org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")`;
    if (p === "enterprise")
        return `enterprise: z.string().min(1).max(39).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)")`;
    if (p === "repository_id") return `repository_id: z.number().int().positive()`;
    if (p === "username") return `username: z.string().min(1).max(39)`;
    return `${p}: z.string()`;
}

function successTypeName(tool) {
    return `${pascalFromTool(tool.name)}Success`;
}

function failureTypeName(tool) {
    return `${pascalFromTool(tool.name)}Failure`;
}

function generateTypes(tool) {
    const s = successTypeName(tool);
    const f = failureTypeName(tool);
    let fields = `    success: true;\n    message: string;\n    http_status: number;\n    request_id: string | null;`;
    const ctx = [...(tool.params || [])];
    for (const p of ctx) {
        if (p === "name") fields += `\n    name: string;`;
        else if (p === "owner") fields += `\n    owner: string;`;
        else if (p === "org") fields += `\n    org: string;`;
        else if (p === "enterprise") fields += `\n    enterprise: string;`;
        else if (p === "repository_id") fields += `\n    repository_id: number;`;
        else if (p === "username") fields += `\n    username: string;`;
    }
    if (tool.query?.includes("day")) fields += `\n    day: string;`;
    if (tool.body) {
        for (const b of tool.body) {
            if (b.key === "rules") continue;
            if (b.key === "policy_state") fields += `\n    policy_state: string;`;
            else if (b.key === "enabled_repositories") fields += `\n    enabled_repositories: string;`;
            else if (b.key === "selected_repository_ids") fields += `\n    selected_repository_ids: number[];`;
            else if (b.key === "selected_teams") fields += `\n    selected_teams: string[];`;
            else if (b.key === "selected_usernames") fields += `\n    selected_usernames: string[];`;
            else if (b.key === "organizations") fields += `\n    organizations?: string[];`;
            else if (b.key === "custom_properties") fields += `\n    custom_properties?: Record<string, unknown>[];`;
            else if (b.key === "organization_id") fields += `\n    organization_id: number;`;
            else if (b.key === "create_ruleset") fields += `\n    create_ruleset?: boolean;`;
        }
    }
    if (tool.kind === "get" || tool.kind === "copilotGet") {
        fields += `\n    ${tool.resultKey}: Record<string, unknown>;`;
        fields = fields.replace("http_status: number;\n    ", "");
    }
    if (tool.kind === "put" || tool.kind === "putRules") {
        fields += `\n    ${tool.resultKey ?? "result"}: Record<string, unknown>;`;
    }
    if (tool.kind === "put204" || tool.kind === "post204" || tool.kind === "delete204" || tool.kind === "delete204body") {
        fields = fields.replace("http_status: number;\n    ", "");
    }
    if (tool.kind === "copilotListSeats") {
        fields += `\n    total_seats: number;\n    seats: Record<string, unknown>[];\n    pagination: GitHubPageLinkPagination | null;\n    page: number;\n    per_page: number;\n    pages_fetched: number;\n    truncated?: boolean;`;
        fields = fields.replace("http_status: number;\n    ", "");
    }
    if (tool.kind === "list" || tool.kind === "listCustomAgents") {
        fields += `\n    total_count: number;\n    ${tool.listKey}: Record<string, unknown>[];\n    pagination: GitHubPageLinkPagination | null;\n    page: number;\n    per_page: number;\n    pages_fetched: number;\n    truncated?: boolean;`;
        fields = fields.replace("http_status: number;\n    ", "");
    }
    if (tool.kind === "listCustomAgents") {
        fields += `\n    custom_agents: Record<string, unknown>[] | null;\n    pagination: GitHubPageLinkPagination | null;\n    page: number;\n    per_page: number;\n    pages_fetched: number;\n    truncated?: boolean;`;
        fields = fields.replace("http_status: number;\n    ", "");
    }
    if (tool.kind === "metrics") {
        fields += `\n    report: Record<string, unknown>;`;
    }
    if (tool.kind === "copilotPost" || tool.kind === "copilotDelete") {
        fields += `\n    ${tool.resultKey}: Record<string, unknown>;`;
    }
    if (tool.kind === "putRules") {
        fields += `\n    rules: Record<string, string[]>;\n    result?: Record<string, unknown>;`;
    }
    return `/** MCP tool: \`${tool.name}\`. */\nexport type ${s} = {\n${fields}\n};\nexport type ${f} = CreateRepoFailure;\n`;
}

function buildRequestArgs(tool, { paginate = false } = {}) {
    const lines = [];
    for (const p of tool.params || []) {
        if (p === "name" && tool.mapRepo) lines.push("repo: input.name");
        else lines.push(`${p}: input.${p}`);
    }
    if (tool.query) {
        for (const q of tool.query) {
            if (q === "day") lines.push("day: input.day");
        }
    }
    if (tool.body) {
        for (const b of tool.body) {
            if (b.key === "rules") continue;
            if (b.required) lines.push(`${b.key}: input.${b.key}`);
            else lines.push(`...(input.${b.key} !== undefined ? { ${b.key}: input.${b.key} } : {})`);
        }
    }
    if (paginate) {
        lines.push("per_page: pp", "page");
    }
    return lines.join(",\n                    ");
}

function generateToolFile(section, tool) {
    const depth = "../../../";
    const s = successTypeName(tool);
    const f = failureTypeName(tool);
    const imports = [
        'import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";',
        'import type { Octokit } from "@octokit/rest";',
        'import { z } from "zod";',
        "",
        `import type { ${s}, ${f} } from "${depth}types.js";`,
        `import { getRequestId, mapGitHubError } from "${depth}utils/errors.js";`,
        'import { textAndData } from "../../../utils/mcp-response.js";'
    ];
    const needsPaginate =
        tool.kind === "list" || tool.kind === "listCustomAgents" || tool.kind === "copilotListSeats";
    if (needsPaginate) {
        imports.push(`import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "${depth}utils/github-paginate-all.js";`);
        imports.push(
            `import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "${depth}utils/parse-github-link-header.js";`
        );
    }

    const zodFields = (tool.params || []).map(zodParam);
    if (tool.query?.includes("day")) {
        zodFields.push(`day: z.string().regex(${COMMON.dayRegex}, "day must be YYYY-MM-DD")`);
    }
    if (tool.body) {
        for (const b of tool.body) zodFields.push(`${b.key}: ${b.zod}${b.required ? "" : ".optional()"}`);
    }
    if (needsPaginate) {
        zodFields.push(
            "per_page: z.number().int().min(1).max(100).optional()",
            "page: z.number().int().min(1).optional()",
            "all_pages: z.boolean().optional()",
            "max_pages: z.number().int().min(1).max(500).optional()"
        );
    }

    const regexDecl = [];
    if ((tool.params || []).some((p) => p === "owner")) regexDecl.push(`const ownerLoginRegex = ${COMMON.ownerLoginRegex};`);
    if ((tool.params || []).some((p) => p === "name")) regexDecl.push(`const repoNameRegex = ${COMMON.repoNameRegex};`);
    if ((tool.params || []).some((p) => p === "org")) regexDecl.push(`const orgLoginRegex = ${COMMON.orgLoginRegex};`);
    if ((tool.params || []).some((p) => p === "enterprise"))
        regexDecl.push(`const enterpriseSlugRegex = ${COMMON.enterpriseSlugRegex};`);

    let handler = "";
    const ctxFields = (tool.params || [])
        .map((p) => {
            if (p === "name") return "name: input.name";
            return `${p}: input.${p}`;
        })
        .join(",\n                    ");
    const bodyEcho = (tool.body || [])
        .filter((b) => b.key !== "rules")
        .map((b) => `${b.key}: input.${b.key}`)
        .join(",\n                    ");

    if (tool.kind === "get") {
        handler = `
            try {
                const response = await octokit.request(
                    "${tool.method}",
                    {
                        ${buildRequestArgs(tool)}
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${s} = {
                    success: true,
                    message: "Request completed successfully.",
                    ${ctxFields}${tool.query?.includes("day") ? ",\n                    day: input.day" : ""},
                    ${tool.resultKey}: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ${f} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }`;
    } else if (tool.kind === "put204" || tool.kind === "post204" || tool.kind === "delete204" || tool.kind === "delete204body") {
        handler = `
            try {
                const response = await octokit.request(
                    "${tool.method}",
                    {
                        ${buildRequestArgs(tool)}
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${s} = {
                    success: true,
                    message: "Request completed successfully.",
                    ${ctxFields}${bodyEcho ? `,\n                    ${bodyEcho}` : ""},
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ${f} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }`;
    } else if (tool.kind === "put") {
        handler = `
            try {
                const response = await octokit.request(
                    "${tool.method}",
                    {
                        ${buildRequestArgs(tool)}
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${s} = {
                    success: true,
                    message: "Request completed successfully.",
                    http_status: response.status as number,
                    ${ctxFields},
                    ${tool.resultKey ?? "result"}: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ${f} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }`;
    } else if (tool.kind === "putRules") {
        handler = `
            try {
                const response = await octokit.request(
                    "${tool.method}",
                    {
                        org: input.org,
                        ...input.rules
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = response.data && typeof response.data === "object" ? toPlain(response.data) : undefined;
                const successPayload: ${s} = {
                    success: true,
                    message: "Copilot content exclusion rules updated successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    rules: input.rules,
                    ...(data ? { result: data } : {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ${f} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }`;
    } else if (tool.kind === "list") {
        handler = generateListHandler(tool, s, f, false);
    } else if (tool.kind === "listCustomAgents") {
        handler = generateListHandler(tool, s, f, true);
    } else if (tool.kind === "metrics") {
        handler = `
            try {
                const response = await octokit.request(
                    "${tool.method}",
                    {
                        ${buildRequestArgs(tool)}
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${s} = {
                    success: true,
                    message: "Copilot metrics report links retrieved successfully.",
                    http_status: response.status as number,
                    ${ctxFields}${tool.query?.includes("day") ? ",\n                    day: input.day" : ""},
                    report: JSON.parse(JSON.stringify(response.data ?? {})) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ${f} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }`;
    } else if (tool.kind === "copilotGet") {
        const args = buildRequestArgs(tool);
        handler = `
            try {
                const response = await octokit.rest.copilot.${tool.octokit}({ ${args} });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${s} = {
                    success: true,
                    message: "Request completed successfully.",
                    ${ctxFields},
                    ${tool.resultKey}: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ${f} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }`;
    } else if (tool.kind === "copilotPost" || tool.kind === "copilotDelete") {
        handler = `
            try {
                const response = await octokit.rest.copilot.${tool.octokit}({ ${buildRequestArgs(tool)} });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ${s} = {
                    success: true,
                    message: "Request completed successfully.",
                    http_status: response.status as number,
                    ${ctxFields}${bodyEcho ? `,\n                    ${bodyEcho}` : ""},
                    ${tool.resultKey}: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ${f} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }`;
    } else if (tool.kind === "copilotListSeats") {
        handler = generateCopilotListHandler(tool, s, f);
    }

    const toPlainFn = needsPaginate || tool.kind === "copilotListSeats"
        ? `
function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}
`
        : `
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}
`;

    const defaultPerPage = needsPaginate || tool.kind === "copilotListSeats" ? "\nconst DEFAULT_PER_PAGE = 100 as const;\n" : "";

    return `${imports.join("\n")}

${regexDecl.join("\n")}
${defaultPerPage}${toPlainFn}
export function ${registerFn(tool.name)}(server: McpServer, octokit: Octokit): void {
    server.tool(
        "${tool.name}",
        "${tool.description.replace(/"/g, '\\"')}",
        {
            ${zodFields.join(",\n            ")}
        },
        async (input) => {${needsPaginate ? "\n            const perPage = input.per_page ?? DEFAULT_PER_PAGE;" : ""}${handler}
        }
    );
}
`;
}

function generateListHandler(tool, s, f, customAgents) {
    const listKey = customAgents ? "custom_agents" : tool.listKey;
    const countKey = tool.countKey ?? "total_count";
    const parseFn = customAgents
        ? `function parseBody(data: unknown): { rows: unknown[] | null } {
    if (data && typeof data === "object" && "custom_agents" in data) {
        const o = data as Record<string, unknown>;
        const rows = o.custom_agents === null ? null : Array.isArray(o.custom_agents) ? o.custom_agents : [];
        return { rows };
    }
    return { rows: null };
}`
        : `function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "${listKey}" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.${listKey}) ? o.${listKey} : [];
        const total_count = typeof o.${countKey} === "number" ? o.${countKey} : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}`;

    const successAll = customAgents
        ? `custom_agents: parsed.rows === null ? null : toPlain(parsed.rows),
                        pagination: result.responsePagination,`
        : `${listKey}: toPlain(result.rows),
                        total_count: firstTotalCount ?? result.rows.length,
                        pagination: result.responsePagination,`;

    const successSingle = customAgents
        ? `custom_agents: parsed.rows === null ? null : toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),`
        : `${listKey}: toPlain(parsed.rows),
                    total_count: parsed.total_count,
                    pagination: parseGitHubPageLinkPagination(linkHeader),`;

    return `
${parseFn}
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "${tool.method}",
                                {
                                    ${buildRequestArgs(tool, { paginate: true }).replace("pp", "pp").replace("page", "page")}
                                } as never
                            );
                            const parsed = parseBody(response.data);
                            ${customAgents ? "" : "if (firstTotalCount === undefined) { firstTotalCount = parsed.total_count; }"}
                            return {
                                rows: ${customAgents ? "(parsed.rows ?? [])" : "parsed.rows"},
                                linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const parsed = { rows: result.rows };
                    const successPayload: ${s} = {
                        success: true,
                        message: result.truncated ? "Partially listed; more pages exist." : "Listed successfully.",
                        ${tool.params.includes("org") ? "org: input.org," : ""}
                        ${tool.params.includes("enterprise") ? "enterprise: input.enterprise," : ""}
                        ${successAll}
                        request_id: result.lastRequestId,
                        page: result.lastPage,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }
                const page = input.page ?? 1;
                const response = await octokit.request(
                    "${tool.method}",
                    {
                        ${tool.params.includes("org") ? "org: input.org," : ""}
                        ${tool.params.includes("enterprise") ? "enterprise: input.enterprise," : ""}
                        per_page: perPage,
                        page
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ${s} = {
                    success: true,
                    message: "Listed successfully.",
                    ${tool.params.includes("org") ? "org: input.org," : ""}
                    ${tool.params.includes("enterprise") ? "enterprise: input.enterprise," : ""}
                    ${successSingle}
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ${f} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }`;
}

function generateCopilotListHandler(tool, s, f) {
    return `
function parseBody(data: unknown): { total_seats: number; rows: unknown[] } {
    if (data && typeof data === "object" && "seats" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.seats) ? o.seats : [];
        const total_seats = typeof o.total_seats === "number" ? o.total_seats : rows.length;
        return { total_seats, rows };
    }
    return { total_seats: 0, rows: [] };
}
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalSeats: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.copilot.${tool.octokit}({ org: input.org, per_page: pp, page });
                            const parsed = parseBody(response.data);
                            if (firstTotalSeats === undefined) firstTotalSeats = parsed.total_seats;
                            return {
                                rows: parsed.rows,
                                linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const seats = toPlain(result.rows);
                    const successPayload: ${s} = {
                        success: true,
                        message: result.truncated ? "Partially listed; more pages exist." : "Listed successfully.",
                        org: input.org,
                        total_seats: firstTotalSeats ?? seats.length,
                        seats,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        page: result.lastPage,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }
                const page = input.page ?? 1;
                const response = await octokit.rest.copilot.${tool.octokit}({ org: input.org, per_page: perPage, page });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ${s} = {
                    success: true,
                    message: "Listed successfully.",
                    org: input.org,
                    total_seats: parsed.total_seats,
                    seats: toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ${f} = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }`;
}

function generateMcpJson(tool) {
    const props = {};
    const required = [];
    for (const p of tool.params || []) {
        if (p === "owner" || p === "org" || p === "enterprise" || p === "username") {
            props[p] = { type: "string", minLength: 1, maxLength: 39 };
        } else if (p === "name") {
            props.name = { type: "string", minLength: 1, maxLength: 100 };
        } else if (p === "repository_id") {
            props.repository_id = { type: "integer", minimum: 1 };
        }
        required.push(p);
    }
    if (tool.query?.includes("day")) {
        props.day = { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" };
        required.push("day");
    }
    if (tool.body) {
        for (const b of tool.body) {
            if (b.key === "policy_state") {
                props.policy_state = {
                    type: "string",
                    enum: ["enabled_for_all_orgs", "disabled_for_all_orgs", "enabled_for_selected_orgs", "configured_by_org_admins"]
                };
            } else if (b.key === "enabled_repositories") {
                props.enabled_repositories = { type: "string", enum: ["all", "selected", "none"] };
            } else if (b.key === "selected_repository_ids") {
                props.selected_repository_ids = { type: "array", items: { type: "integer", minimum: 1 }, minItems: 1 };
            } else if (b.key === "selected_teams" || b.key === "selected_usernames" || b.key === "organizations") {
                props[b.key] = { type: "array", items: { type: "string", minLength: 1 }, minItems: b.required ? 1 : undefined };
            } else if (b.key === "custom_properties") {
                props.custom_properties = {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            property_name: { type: "string", minLength: 1 },
                            values: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1 }
                        },
                        required: ["property_name", "values"]
                    }
                };
            } else if (b.key === "organization_id") {
                props.organization_id = { type: "integer", minimum: 1 };
            } else if (b.key === "create_ruleset") {
                props.create_ruleset = { type: "boolean" };
            } else if (b.key === "rules") {
                props.rules = { type: "object", additionalProperties: { type: "array", items: { type: "string" } } };
            }
            if (b.required) required.push(b.key);
        }
    }
    if (["list", "listCustomAgents", "copilotListSeats"].includes(tool.kind)) {
        props.per_page = { type: "integer", minimum: 1, maximum: 100 };
        props.page = { type: "integer", minimum: 1 };
        props.all_pages = { type: "boolean" };
        props.max_pages = { type: "integer", minimum: 1, maximum: 500 };
    }
    return JSON.stringify(
        {
            name: tool.name,
            description: tool.description.split(".")[0] + ".",
            arguments: {
                type: "object",
                properties: props,
                required,
                $schema: "http://json-schema.org/draft-07/schema#"
            }
        },
        null,
        2
    );
}

function generateReadme(section) {
    const rows = section.tools.map((t) => `| \`${t.name}\` | ${t.description.split(".")[0]}. |`).join("\n");
    return `# ${section.readmeTitle} MCP tools

Tool implementations wrap [${section.readmeTitle}](${section.docsUrl}). They are registered from \`src/index.ts\`.

Success payloads follow the shared MCP shape; failures use the structured **error** envelope (\`CreateRepoFailure\`).

## Tools

| Tool | Notes |
| --- | --- |
${rows}
`;
}

function patchIndex(section, mode) {
    const indexPath = path.join(ROOT, "src/index.ts");
    let content = fs.readFileSync(indexPath, "utf8");
    const anchor = "registerGithubCreateCommitStatusTool(server, octokit);";
    for (const tool of section.tools) {
        const imp = `import { ${registerFn(tool.name)} } from "./tools/copilot/${section.folder}/${kebabFromTool(tool.name)}.js";`;
        const reg = `${registerFn(tool.name)}(server, octokit);`;
        if (mode === "add") {
            if (!content.includes(imp)) {
                content = content.replace(
                    'import { registerGithubCreateCommitStatusTool } from "./tools/commits/statuses/github-create-commit-status.js";',
                    `import { registerGithubCreateCommitStatusTool } from "./tools/commits/statuses/github-create-commit-status.js";\n${imp}`
                );
            }
            if (!content.includes(reg)) {
                content = content.replace(anchor, `${anchor}\n${reg}`);
            }
        }
    }
    fs.writeFileSync(indexPath, content);
}

function patchTypes(section) {
    const typesPath = path.join(ROOT, "src/types.ts");
    let content = fs.readFileSync(typesPath, "utf8");
    const anchor = "export type CreateCommitStatusFailure = CreateRepoFailure;";
    const block = section.tools.map(generateTypes).join("\n");
    if (!content.includes(successTypeName(section.tools[0]))) {
        content = content.replace(anchor, `${anchor}\n\n${block}`);
        fs.writeFileSync(typesPath, content);
    }
}

function patchMcpResponse(section) {
    const filePath = path.join(ROOT, "src/utils/mcp-response.ts");
    let content = fs.readFileSync(filePath, "utf8");
    for (const tool of section.tools) {
        const s = successTypeName(tool);
        const f = failureTypeName(tool);
        if (!content.includes(s)) {
            content = content.replace(
                "    CreateCommitStatusSuccess,\n    CreateCommitStatusFailure,",
                `    CreateCommitStatusSuccess,\n    CreateCommitStatusFailure,\n    ${s},\n    ${f},`
            );
            content = content.replace(
                /(\| [A-Za-z0-9]+Failure)\) \{\n    \/\/ Provide both human-readable text/,
                `$1\n        | ${s}\n        | ${f}) {\n    // Provide both human-readable text`
            );
        }
    }
    fs.writeFileSync(filePath, content);
}

function patchRootReadme(sectionNum, section) {
    const readmePath = path.join(ROOT, "README.md");
    let content = fs.readFileSync(readmePath, "utf8");
    const bullet = `- **[${section.readmeTitle}](src/tools/copilot/${section.folder}/README.md)**`;
    if (sectionNum === 1) {
        if (!content.includes("### Copilot")) {
            content = content.replace(
                "### Commits\n\n- **[Commits]",
                `### Commits\n\n- **[Commits]`
            );
            content = content.replace(
                "- **[Statuses](src/tools/commits/statuses/README.md)**\n\nStatic MCP",
                `- **[Statuses](src/tools/commits/statuses/README.md)**\n\n### Copilot\n\n${bullet}\n\nStatic MCP`
            );
        } else if (!content.includes(bullet)) {
            content = content.replace("### Copilot\n\n", `### Copilot\n\n${bullet}\n`);
        }
    } else if (!content.includes(bullet)) {
        content = content.replace(
            /(- \*\*\[Copilot[^\n]+\n)(?=- \*\*\[Copilot|\n\nStatic MCP)/,
            `$1${bullet}\n`
        );
        if (!content.includes(bullet)) {
            content = content.replace("### Copilot\n\n", `### Copilot\n\n${bullet}\n`);
        }
    }
    fs.writeFileSync(readmePath, content);
}

function generateSection(sectionNum) {
    const section = SECTIONS[sectionNum];
    if (!section) throw new Error(`Unknown section ${sectionNum}`);
    const toolDir = path.join(ROOT, "src/tools/copilot", section.folder);
    const mcpDir = path.join(ROOT, "mcps/user-github-mcp/tools/copilot", section.folder);
    fs.mkdirSync(toolDir, { recursive: true });
    fs.mkdirSync(mcpDir, { recursive: true });
    for (const tool of section.tools) {
        const base = kebabFromTool(tool.name);
        fs.writeFileSync(path.join(toolDir, `${base}.ts`), generateToolFile(section, tool));
        fs.writeFileSync(path.join(mcpDir, `${base}.json`), generateMcpJson(tool));
    }
    fs.writeFileSync(path.join(toolDir, "README.md"), generateReadme(section));
    patchTypes(section);
    patchMcpResponse(section);
    patchIndex(section, "add");
    patchRootReadme(sectionNum, section);
    console.log(`Generated section ${sectionNum}: ${section.tools.length} tools in ${section.folder}`);
}

const sectionNum = Number(process.argv[2]);
if (!sectionNum || !SECTIONS[sectionNum]) {
    console.error("Usage: node scripts/generate-copilot-section.mjs <1-6>");
    process.exit(1);
}
generateSection(sectionNum);
