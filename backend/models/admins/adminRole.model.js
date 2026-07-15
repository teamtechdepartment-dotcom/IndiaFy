import mongoose, { Schema } from "mongoose";

const adminRoleSchema = new Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const AdminRole = mongoose.model("admin_Role", adminRoleSchema);

export default AdminRole;
