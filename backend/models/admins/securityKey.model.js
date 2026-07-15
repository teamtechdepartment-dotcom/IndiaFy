import mongoose, { Schema } from "mongoose";

const securityKeySchema = new Schema({
    role: {
        type: String,
        required: true,
        unique: true
    },
    key: {
        type: String,
        required: true,
        unique: true
    }
},
    { timestamps: true }
)

const securityKeyModel = mongoose.model("security_Key", securityKeySchema);

export default securityKeyModel;