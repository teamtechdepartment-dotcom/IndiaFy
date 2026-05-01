import mongoose, { Schema } from "mongoose";
import {passwordEncryption} from "../../utils/bcrypt.js"

const authSchema = new Schema({
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
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
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
)

authSchema.pre("save", async function() {
    if(!this.isModified("password")) return;

    const result = await passwordEncryption(this.password);
    this.password = result;
});

const authModel = mongoose.model("customer", authSchema);

export default authModel;