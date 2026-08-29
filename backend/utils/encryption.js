import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.KYC_ENCRYPTION_KEY; 
const IV_LENGTH = 16; 

const getKeyBuffer = () => {
    if (!ENCRYPTION_KEY) {
        throw new Error("CRITICAL SECURITY ERROR: KYC_ENCRYPTION_KEY is not defined in environment.");
    }
    return Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32), "utf8");
};

/**
 * Encrypts a plain text string using AES-256-CBC.
 * Returns formatted string "ivHex:encryptedHex"
 */
export const encrypt = (text) => {
    if (!text) return "";
    try {
        const textStr = String(text);
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, getKeyBuffer(), iv);
        let encrypted = cipher.update(textStr, "utf8", "hex");
        encrypted += cipher.final("hex");
        return iv.toString("hex") + ":" + encrypted;
    } catch (error) {
        console.error("Encryption error:", error);
        return "";
    }
};

/**
 * Decrypts a cipher text formatted as "ivHex:encryptedHex" back to plain text.
 */
export const decrypt = (cipherText) => {
    if (!cipherText) return "";
    try {
        const parts = String(cipherText).split(":");
        if (parts.length !== 2) {
            return cipherText; // Return as is if not encrypted format
        }
        const iv = Buffer.from(parts[0], "hex");
        const encryptedText = Buffer.from(parts[1], "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, getKeyBuffer(), iv);
        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error);
        return cipherText; // Return as is on failure
    }
};

/**
 * Standard SHA-256 hashing for blind indexes (to prevent duplicate entries of encrypted fields).
 */
export const hashValue = (value) => {
    if (!value) return "";
    // Trim, remove whitespace, and convert to uppercase for case/spacing-insensitive uniqueness
    const normalized = String(value).replace(/\s/g, "").toUpperCase();
    return crypto.createHash("sha256").update(normalized).digest("hex");
};
