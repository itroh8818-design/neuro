/**
 * Encryption / hashing utilities for patient data.
 *
 * NOTE: This does NOT implement real AES-256, despite the original comment
 * claiming so. It is an XOR stream cipher derived from a SHA-256 key hash.
 * That is fine for obfuscating locally-stored demo data, but it is not
 * cryptographically strong (no authentication, deterministic per key/data
 * pair, no IV). Before storing real patient health data, replace
 * encryptData/decryptData with a vetted library (e.g. AES-256-GCM via
 * react-native-aes-gcm-crypto or similar).
 */
import * as Crypto from 'expo-crypto';

const ALGORITHM = Crypto.CryptoDigestAlgorithm.SHA256;

/**
 * Generate a unique ID using cryptographically secure random bytes.
 */
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomBytes = Crypto.getRandomBytes(8);
  const random = Array.from(randomBytes)
    .map((b) => b.toString(36))
    .join('');
  return `${timestamp}-${random}`;
};

/**
 * Generate a UUID (v4), using cryptographically secure random bytes.
 * Previously used Math.random(), which is predictable and unsuitable
 * for anything that needs to be unguessable (e.g. sync/document IDs).
 */
export const generateUUID = (): string => {
  const bytes = Crypto.getRandomBytes(16);
  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join('-');
};

/**
 * UTF-8 safe string <-> byte helpers.
 * The previous implementation ran charCodeAt() directly on the input string
 * and fed the result straight into btoa(). That only works for text made up
 * of Latin1 characters (code points 0-255). Any Assamese, Hindi, or other
 * non-Latin1 text — which this app explicitly supports — would produce XOR
 * output outside that range and throw "InvalidCharacterError" from btoa().
 */
const utf8ToBytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

const bytesToUtf8 = (bytes: Uint8Array): string => {
  return new TextDecoder().decode(bytes);
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

/**
 * Create a SHA-256 hash of data (for integrity verification)
 */
export const hashData = async (data: string): Promise<string> => {
  return await Crypto.digestStringAsync(ALGORITHM, data);
};

/**
 * Encrypt sensitive data before storing
 * Uses a simple XOR-based approach with a derived key for demo purposes
 * In production, use a proper AES-256 library
 */
export const encryptData = async (
  data: string,
  secretKey: string
): Promise<string> => {
  // Create a key hash from the secret
  const keyHash = await Crypto.digestStringAsync(
    ALGORITHM,
    secretKey + 'cognicare-salt-2024'
  );
  const keyBytes = utf8ToBytes(keyHash);
  const dataBytes = utf8ToBytes(data); // UTF-8 encode BEFORE XOR-ing

  const encryptedBytes = new Uint8Array(dataBytes.length);
  for (let i = 0; i < dataBytes.length; i++) {
    encryptedBytes[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return bytesToBase64(encryptedBytes);
};

/**
 * Decrypt data encrypted with encryptData
 */
export const decryptData = async (
  encryptedData: string,
  secretKey: string
): Promise<string> => {
  const keyHash = await Crypto.digestStringAsync(
    ALGORITHM,
    secretKey + 'cognicare-salt-2024'
  );
  const keyBytes = utf8ToBytes(keyHash);
  const encryptedBytes = base64ToBytes(encryptedData);

  const decryptedBytes = new Uint8Array(encryptedBytes.length);
  for (let i = 0; i < encryptedBytes.length; i++) {
    decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return bytesToUtf8(decryptedBytes); // UTF-8 decode AFTER XOR-ing
};

/**
 * Hash a password for user authentication.
 *
 * Previously this used ONE hardcoded static salt ('cognicare-password-salt')
 * for every user. That means:
 *  - two users with the same password get the identical stored hash, and
 *  - an attacker who obtains the hash list only needs to build one rainbow
 *    table for the whole app, not one per user.
 * Fixed to generate a random salt per password and store it alongside the
 * hash (format: "<salt>:<hash>"), which is the minimum expected practice.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltBytes = Crypto.getRandomBytes(16);
  const salt = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hash = await Crypto.digestStringAsync(ALGORITHM, password + salt);
  return `${salt}:${hash}`;
};

/**
 * Verify a password against its salted hash (format: "<salt>:<hash>").
 */
export const verifyPassword = async (
  password: string,
  storedValue: string
): Promise<boolean> => {
  const [salt, hash] = storedValue.split(':');
  if (!salt || !hash) return false;
  const computed = await Crypto.digestStringAsync(ALGORITHM, password + salt);
  return computed === hash;
};

/**
 * Generate a secure random token using expo-crypto instead of Math.random(),
 * which is not cryptographically secure and unsuitable for anything used
 * as an auth/reset token.
 */
export const generateToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = Crypto.getRandomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  return result;
};
