import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Octokit } from "@octokit/rest";
import { getRequiredEnv } from "./config/env.js";
import { registerGithubCheckDependabotSecurityUpdatesTool } from "./tools/repositories/github-check-dependabot-security-updates.js";
import { registerGithubCheckPrivateVulnerabilityReportingTool } from "./tools/repositories/github-check-private-vulnerability-reporting.js";
import { registerGithubCheckImmutableReleasesTool } from "./tools/repositories/github-check-immutable-releases.js";
import { registerGithubEnableImmutableReleasesTool } from "./tools/repositories/github-enable-immutable-releases.js";
import { registerGithubDisableImmutableReleasesTool } from "./tools/repositories/github-disable-immutable-releases.js";
import { registerGithubDisableDependabotSecurityUpdatesTool } from "./tools/repositories/github-disable-dependabot-security-updates.js";
import { registerGithubEnableDependabotSecurityUpdatesTool } from "./tools/repositories/github-enable-dependabot-security-updates.js";
import { registerGithubDisablePrivateVulnerabilityReportingTool } from "./tools/repositories/github-disable-private-vulnerability-reporting.js";
import { registerGithubEnablePrivateVulnerabilityReportingTool } from "./tools/repositories/github-enable-private-vulnerability-reporting.js";
import { registerGithubEnableVulnerabilityAlertsTool } from "./tools/repositories/github-enable-vulnerability-alerts.js";
import { registerGithubCreateOrgRepoTool } from "./tools/repositories/github-create-org-repo.js";
import { registerGithubCreatePersonalRepoTool } from "./tools/repositories/github-create-personal-repo.js";
import { registerGithubCreateRepoDispatchTool } from "./tools/repositories/github-create-repo-dispatch.js";
import { registerGithubDeleteRepoTool } from "./tools/repositories/github-delete-repo.js";
import { registerGithubGetRepoTool } from "./tools/repositories/github-get-repo.js";
import { registerGithubListCodeownersErrorsTool } from "./tools/repositories/github-list-codeowners-errors.js";
import { registerGithubListRepoContributorsTool } from "./tools/repositories/github-list-repo-contributors.js";
import { registerGithubListRepoActivitiesTool } from "./tools/repositories/github-list-repo-activities.js";
import { registerGithubListRepoLanguagesTool } from "./tools/repositories/github-list-repo-languages.js";
import { registerGithubListRepoTagsTool } from "./tools/repositories/github-list-repo-tags.js";
import { registerGithubListRepoTeamsTool } from "./tools/repositories/github-list-repo-teams.js";
import { registerGithubUpdateRepoTool } from "./tools/repositories/github-update-repo.js";

const token = getRequiredEnv("GITHUB_TOKEN");
const octokit = new Octokit({ auth: token });
const server = new McpServer({ name: "github-mcp", version: "1.0.0" });

// Register all MCP tools here; each tool implementation lives in its own file.
registerGithubCreatePersonalRepoTool(server, octokit);
registerGithubCreateOrgRepoTool(server, octokit);
registerGithubDeleteRepoTool(server, octokit);
registerGithubCheckDependabotSecurityUpdatesTool(server, octokit);
registerGithubCheckPrivateVulnerabilityReportingTool(server, octokit);
registerGithubCheckImmutableReleasesTool(server, octokit);
registerGithubEnableImmutableReleasesTool(server, octokit);
registerGithubDisableImmutableReleasesTool(server, octokit);
registerGithubEnableVulnerabilityAlertsTool(server, octokit);
registerGithubEnablePrivateVulnerabilityReportingTool(server, octokit);
registerGithubDisablePrivateVulnerabilityReportingTool(server, octokit);
registerGithubEnableDependabotSecurityUpdatesTool(server, octokit);
registerGithubDisableDependabotSecurityUpdatesTool(server, octokit);
registerGithubGetRepoTool(server, octokit);
registerGithubListCodeownersErrorsTool(server, octokit);
registerGithubListRepoContributorsTool(server, octokit);
registerGithubListRepoActivitiesTool(server, octokit);
registerGithubListRepoLanguagesTool(server, octokit);
registerGithubListRepoTagsTool(server, octokit);
registerGithubListRepoTeamsTool(server, octokit);
registerGithubUpdateRepoTool(server, octokit);
registerGithubCreateRepoDispatchTool(server, octokit);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    // Keep startup failures explicit for MCP client logs.
    console.error("Failed to start github-mcp server:", error);
    process.exit(1);
});
