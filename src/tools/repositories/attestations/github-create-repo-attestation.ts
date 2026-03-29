import { existsSync, readFileSync, statSync } from "node:fs";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoAttestationFailure, CreateRepoAttestationSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Sigstore bundle body per GitHub / OpenAPI (nested structure varies). */
const sigstoreBundleSchema = z
    .object({
        mediaType: z.string().optional(),
        verificationMaterial: z.record(z.string(), z.unknown()).optional(),
        dsseEnvelope: z.record(z.string(), z.unknown()).optional()
    })
    .passthrough();

const bundleInputSchema = z.union([
    sigstoreBundleSchema,
    z
        .string()
        .min(1)
        .describe(
            "Sigstore bundle as a JSON string, or an absolute/relative path to a .json file containing the bundle (read on the machine running the MCP server)."
        )
]);

/**
 * Resolves `bundle` from an object, inline JSON string, or filesystem path to a JSON file.
 */
function resolveSigstoreBundle(bundle: unknown): Record<string, unknown> {
    if (bundle !== null && typeof bundle === "object" && !Array.isArray(bundle)) {
        return bundle as Record<string, unknown>;
    }
    if (typeof bundle !== "string") {
        throw new Error(
            "bundle must be a Sigstore bundle object, a JSON string of the bundle, or a filesystem path to a .json file"
        );
    }
    const trimmed = bundle.trim();
    let jsonText: string;
    if (existsSync(trimmed) && statSync(trimmed).isFile()) {
        jsonText = readFileSync(trimmed, "utf8");
    } else {
        jsonText = trimmed;
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonText);
    } catch (e) {
        const hint =
            existsSync(trimmed) && statSync(trimmed).isFile()
                ? "invalid JSON in bundle file"
                : "not valid JSON and not a readable file path";
        throw new Error(`bundle: ${hint}: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("bundle JSON must be a non-null object (Sigstore bundle)");
    }
    return parsed as Record<string, unknown>;
}

export function registerGithubCreateRepoAttestationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_attestation",
        "Create an artifact attestation for a repository (POST /repos/{owner}/{repo}/attestations). " +
            "Sends a Sigstore bundle as JSON. `bundle` may be an object, a JSON string of the bundle, or a path to a JSON file (read locally by the server). " +
            "Requires repo write access; fine-grained tokens need attestations:write. " +
            "Attestations are normally produced by the GitHub attest action or compatible tooling—see GitHub docs.",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            bundle: bundleInputSchema.describe(
                "Sigstore bundle: object, JSON string, or path to a .json file containing mediaType, verificationMaterial, dsseEnvelope, …"
            )
        },
        async (input) => {
            let resolvedBundle: Record<string, unknown>;
            try {
                resolvedBundle = resolveSigstoreBundle(input.bundle);
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                const failurePayload: CreateRepoAttestationFailure = {
                    success: false,
                    error: {
                        status_code: 422,
                        error_type: "validation_error",
                        message,
                        hint: "Use bundle as a JSON object, a JSON string of the Sigstore bundle, or a path to a .json file on the server.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }

            try {
                const response = await octokit.rest.repos.createAttestation({
                    owner: input.owner,
                    repo: input.name,
                    bundle: resolvedBundle
                });
                const data = response.data as { id?: number } | undefined;
                const successPayload: CreateRepoAttestationSuccess = {
                    success: true,
                    message: "Repository attestation created successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name: `${input.owner}/${input.name}`,
                    attestation_id: typeof data?.id === "number" ? data.id : null,
                    request_id: getRequestId(response.headers["x-github-request-id"])
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoAttestationFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
