import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const id = new mongoose.Types.ObjectId();
const user = { _id: id, role: "Customer", email: "test@test.com" };

try {
    const token = jwt.sign(user, "secret", { expiresIn: "15m" });
    console.log("Success:", token);
} catch (e) {
    console.error("Error signing:", e.message);
}
