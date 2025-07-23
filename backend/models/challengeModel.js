import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    status: {
        type: String,
        enum: ["accepted", "rejected", "pending", "offline"], //if any user goes offline
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        }
    }
});

challengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const challengeModel = mongoose.model.challenges || mongoose.model("challenges", challengeSchema);
export default challengeModel;
