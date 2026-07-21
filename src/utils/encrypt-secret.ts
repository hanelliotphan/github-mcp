import _sodium from "libsodium-wrappers";

/**
 * Encrypt a plaintext secret value with a GitHub Actions public key using
 * LibSodium sealed boxes, as required by the create/update secret endpoints.
 * Returns the base64-encoded ciphertext suitable for the `encrypted_value` body field.
 *
 * See "Encrypting secrets for the REST API"
 * (https://docs.github.com/en/rest/guides/encrypting-secrets-for-the-rest-api).
 */
export async function encryptSecretValue(plaintext: string, base64PublicKey: string): Promise<string> {
    await _sodium.ready;
    const sodium = _sodium;
    const keyBytes = sodium.from_base64(base64PublicKey, sodium.base64_variants.ORIGINAL);
    const messageBytes = sodium.from_string(plaintext);
    const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);
    return sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);
}
