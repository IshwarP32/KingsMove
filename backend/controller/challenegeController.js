import friendshipModel from "../models/friendshipModel.js";
import challengeModel from "../models/challengeModel.js";
import userModel from "../models/userModel.js";
import { initGame } from "./gameLogic.js";
import { io } from "../server.js";

const createChallenge = async (req, res) => {
  try {
    const from = req.userId;
    const to = req.body.userId;

    if (!from || !to) {
      return res.json({ success: false, message: "Both sender and recipient required" });
    }

    if (from === to) {
      return res.json({ success: false, message: "You cannot challenge yourself" });
    }

    const recipient = await userModel.findById(to);
    if (!recipient) {
      return res.json({ success: false, message: "User not found!" });
    }

    // Check if a challenge already exists between the users and is not deleted or completed
    const existingChallenge = await challengeModel.findOne({
      $or: [
        { from, to },
        { from: to, to: from }
      ],
      status: { $in: ["pending", "accepted"] }
    });

    if (existingChallenge) {
      return res.json({ success: false, message: "Challenge already exists" });
    }

    const newChallenge = new challengeModel({
      from,
      to
    });

    await newChallenge.save();

    const expiresAt = newChallenge.expiresAt;
    const formattedTime = `${expiresAt.getHours().toString().padStart(2, '0')}:${expiresAt.getMinutes().toString().padStart(2, '0')}`;

    challengeSocket(recipient.socketId);

    return res.json({
      success: true,
      message: `Challenge sent! It will expire at ${formattedTime}`
    });

  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

const challengeSocket = async (socketId)=>{
  io.to(socketId).emit("challengeRefresh");
  // toast.message("You have an update on your challenge");
}

const changeChallengeStatus = async (req, res) => {
    try {
        const { challengeId, action } = req.body;
        if (!action) return res.json({ success: false, message: "action field is required" })

        const challenge = await challengeModel.findById(challengeId);
        if (!challenge) {
            return res.json({ success: false, message: "Challenge Expired or Do not exit" });
        }

        
        challenge.status = action;
        await challenge.save();
        
        if (action === "accepted") {
          initGame(challenge.from, challenge.to);
        }
        const fromUser = await userModel.findById(challenge.from).select("socketId");
        const toUser = await userModel.findById(challenge.to).select("socketId");
              
        const from = fromUser?.socketId;
        const to= toUser?.socketId;

        // console.log(from)
        challengeSocket(from);
        challengeSocket(to);
        return res.json({ success: true, message: "Challenge status changed" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

const getChallenges = async (req, res) => {
    try {
        const userId = req.userId;
        const sentPipeline = [
            { $match: { from: userId } },
            {
                $lookup: {
                    from: "users",
                    localField: "to",
                    foreignField: "_id",
                    as: "toUser"
                }
            },
            { $unwind: "$toUser" },
            {
                $project: {     
                    status: 1,
                    expiresAt: 1,
                    _id: 1,
                    username: "$toUser.username",
                    avatar: "$toUser.avatar"
                }
            }
        ];

        const receivedPipeline = [
            { $match: { to: userId } },
            {
                $lookup: {
                    from: "users",
                    localField: "from",
                    foreignField: "_id",
                    as: "fromUser"
                }
            },
            { $unwind: "$fromUser" },
            {
                $project: {
                    status: 1,
                    expiresAt: 1,
                    _id: 1,
                    username: "$fromUser.username",
                    avatar: "$fromUser.avatar"
                }
            }
        ];


        const sent = await challengeModel.aggregate(sentPipeline);
        const received = await challengeModel.aggregate(receivedPipeline);

        res.json({ success: true, message: "Ok", content:{sent, received} });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
export { createChallenge, changeChallengeStatus, getChallenges };