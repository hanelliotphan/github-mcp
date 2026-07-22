import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Load project .env explicitly so MCP launch context does not matter.
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);
const projectRootEnvPath = resolve(currentDir, "../../.env");
loadDotenv({ path: projectRootEnvPath, quiet: true });

export function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`ERROR: Missing required environment variable: ${name}`);
    }
    return value;
}
