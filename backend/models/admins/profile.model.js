import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const profileSchema = new Schema({
    adminId: {
        type: ObjectId,
        required: true,
        ref: "admin"
    },
    profileImage:{
        type: String
    },
    contact: {
        type: Number,
        required: true,
        unique: true
    },
    address: {
        street: {
            type: String,
            required: true
        },
        nearBy: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required
        }
    }
},
    { timestamps: true }
)

const adminsProfile = mongoose.model("admins_Profile", profileSchema);

export default adminsProfile;