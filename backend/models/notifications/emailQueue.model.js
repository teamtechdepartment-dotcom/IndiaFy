import mongoose, { Schema } from "mongoose";

const emailQueueSchema = new Schema(
  {
    to: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true
    },
    html: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 5
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "retry"],
      default: "pending"
    },
    lastError: {
      type: String,
      default: ""
    },
    nextAttemptAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

emailQueueSchema.index({ status: 1, nextAttemptAt: 1 });

const EmailQueue = mongoose.model("EmailQueue", emailQueueSchema);

export default EmailQueue;
