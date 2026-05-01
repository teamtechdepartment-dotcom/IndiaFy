import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const profileSchema = new Schema({
    customerId: {
        type: ObjectId,
        required: true,
        ref: "seller"
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
    profileImage:{
        type: String
    },
    contact: {
        type: Number,
        required: true,
        unique: true
    },
    address: [{
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
    }]
},
    { timestamps: true }
)

const customerProfile = mongoose.model("seller_Profile", profileSchema);

export default customerProfile;