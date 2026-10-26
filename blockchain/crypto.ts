/**
 * crypto.ts
 *
 * Tiny hashing helper for this educational blockchain.
 *
 * A hash is a fingerprint of data:
 * - The same input always produces the same output.
 * - Changing even one character produces a completely different hash.
 * - You cannot reverse a hash to get the original data.
 *
 * Blockchains use SHA-256 to "seal" blocks and transaction IDs.
 *
 * We use Node.js's built-in `crypto` library. That is not an extra npm package.
 */

import { createHash } from "crypto";

/**
 * Create a SHA-256 hash of a string.
 *
 * @param data - Any text you want to fingerprint (for example a block's contents).
 * @returns A 64-character hexadecimal string (256 bits written in hex).
 *
 * Example:
 *   sha256("hello") → "2cf24dba5fb0a30e..."
 */
export function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}
