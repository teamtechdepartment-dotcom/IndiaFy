import bcrypt from "bcryptjs";

const salt = 12; // Standard salt rounds

export const passwordEncryption = async (password) => {
    try {
        return await bcrypt.hash(password, salt);
    }
    catch (err) {
        throw new Error("Password encryption failed: " + err.message);
    }
}

export const passwordDecryption = async (password, hashPassword) => {
    try {
        return await bcrypt.compare(password, hashPassword);
    }
    catch (err) {
        throw new Error("Password verification failed: " + err.message);
    }
}