import mongoose, { Schema } from "mongoose";
import { passwordEncryption } from "../../utils/bcrypt.js";

const { ObjectId } = mongoose.Schema.Types;

const supportMemberSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["support_member", "support_lead", "support_agent"],
      default: "support_member",
    },
    status: {
      type: String,
      enum: ["invited", "active", "inactive"],
      default: "invited",
      index: true,
    },
    invitationToken: {
      type: String,
      default: null,
      index: true,
    },
    invitationTokenExpires: {
      type: Date,
      default: null,
    },
    assignedTicketsCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: ObjectId,
      ref: "admin",
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password on save if modified
supportMemberSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) return;
  this.password = await passwordEncryption(this.password);
});

const SupportMember = mongoose.model("support_Member", supportMemberSchema);

export default SupportMember;
