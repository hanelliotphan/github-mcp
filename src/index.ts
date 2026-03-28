import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Octokit } from "@octokit/rest";
import { getRequiredEnv } from "./config/env.js";
import { registerGithubCheckDependabotSecurityUpdatesTool } from "./tools/repositories/github-check-dependabot-security-updates.js";
import { registerGithubDisableDependabotSecurityUpdatesTool } from "./tools/repositories/github-disable-dependabot-security-updates.js";
import { registerGithubEnableDependabotSecurityUpdatesTool } from "./tools/repositories/github-enable-dependabot-security-updates.js";
import { registerGithubEnableVulnerabilityAlertsTool } from "./tools/repositories/github-enable-vulnerability-alerts.js";
import { registerGithubCreateOrgRepoTool } from "./tools/repositories/github-create-org-repo.js";
import { registerGithubCreatePersonalRepoTool } from "./tools/repositories/github-create-personal-repo.js";
import { registerGithubCreateRepoDispatchTool } from "./tools/repositories/github-create-repo-dispatch.js";
import { registerGithubDeleteRepoTool } from "./tools/repositories/github-delete-repo.js";
import { registerGithubGetRepoTool } from "./tools/repositories/github-get-repo.js";
import { registerGithubListCodeownersErrorsTool } from "./tools/repositories/github-list-codeowners-errors.js";
import { registerGithubListRepoContributorsTool } from "./tools/repositories/github-list-repo-contributors.js";
import { registerGithubListRepoActivitiesTool } from "./tools/repositories/github-list-repo-activities.js";
import { registerGithubUpdateRepoTool } from "./tools/repositories/github-update-repo.js";

const token = getRequiredEnv("GITHUB_TOKEN");
const octokit = new Octokit({ auth: token });
const server = new McpServer({ name: "github-mcp", version: "1.0.0" });

// Register all MCP tools here; each tool implementation lives in its own file.
registerGithubCreatePersonalRepoTool(server, octokit);
registerGithubCreateOrgRepoTool(server, octokit);
registerGithubDeleteRepoTool(server, octokit);
registerGithubCheckDependabotSecurityUpdatesTool(server, octokit);
registerGithubEnableVulnerabilityAlertsTool(server, octokit);
registerGithubEnableDependabotSecurityUpdatesTool(server, octokit);
registerGithubDisableDependabotSecurityUpdatesTool(server, octokit);
registerGithubGetRepoTool(server, octokit);
registerGithubListCodeownersErrorsTool(server, octokit);
registerGithubListRepoContributorsTool(server, octokit);
registerGithubListRepoActivitiesTool(server, octokit);
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
