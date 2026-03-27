import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Octokit } from "@octokit/rest";
import { getRequiredEnv } from "./config/env.js";
import { registerGithubCreatePersonalRepoTool } from "./tools/github-create-personal-repo.js";

const token = getRequiredEnv("GITHUB_TOKEN");
const octokit = new Octokit({ auth: token });
const server = new McpServer({ name: "github-mcp", version: "0.1.1" });

// Register all MCP tools here; each tool implementation lives in its own file.
registerGithubCreatePersonalRepoTool(server, octokit);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    // Keep startup failures explicit for MCP client logs.
    console.error("Failed to start github-mcp server:", error);
    process.exit(1);
});
