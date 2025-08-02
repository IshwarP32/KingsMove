import mongoose, { Schema } from "mongoose";

const friendshipSchema = new mongoose.Schema({
  sentBy:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"users"
  },
  sentTo: {
    type:mongoose.Schema.Types.ObjectId, // user IDs
    required: true,
    ref: "users"
  },
  status: {
    type: String,
    enum: ["accepted", "rejected", "pending", "deleted"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  }
});

friendshipSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

friendshipSchema.index({ users: 1 });

// Ensure consistent order + override expiration for accepted/deleted
friendshipSchema.pre("save", function (next) {
  if (this.status === "accepted") {
    this.expiresAt = undefined; // disable TTL
  } else if (this.status === "deleted") {
    this.expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
  }
  next();
});

// Model export
const friendshipModel =
  mongoose.models.friendships || mongoose.model("friendships", friendshipSchema);
export default friendshipModel;
