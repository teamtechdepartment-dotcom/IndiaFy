import mongoose, { Schema } from "mongoose";
import { passwordEncryption } from "../../utils/bcrypt.js";

const {ObjectId} = mongoose.Schema.Types;

const adminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String
    },
    role: {
        type: String,
        required: true
    },
    securityKeyId:{
        type: ObjectId,
        required: true
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    refreshToken: {
        type: String
    }
},
    { timestamps: true }
);

adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    
    // Hash password using the utility but ensure we don't double hash
    const result = await passwordEncryption(this.password);
    this.password = result;
});

const adminModel = mongoose.model("admin", adminSchema);

export default adminModel
