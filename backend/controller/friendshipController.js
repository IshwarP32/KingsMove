import friendshipModel from "../models/friendshipModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import { io } from "../server.js";

const newFriendship = async (req, res) => {
  try {
    const user1 = req.userId; // sender
    const { username } = req.body;

    const user2 = await userModel.findOne({ username });
    if (!user2 || user1.toString() === user2._id.toString()) {
      return res.json({
        success: false,
        message: "Invalid friend request",
      });
    }

    // 🔍 Check if friendship already exists
    const exists = await friendshipModel.findOne({
      $or: [
        { sentBy: user1, sentTo: user2._id },
        { sentBy: user2._id, sentTo: user1 },
      ],
    });

    if (exists) {
      return res.json({
        success: false,
        message: "Friendship already exists",
      });
    }

    // ✅ Create new friendship document
    const frndshp = new friendshipModel({
      sentBy: user1,
      sentTo: user2._id,
    });

    await frndshp.save();

    // 🎯 Notify recipient via socket
    if (user2.socketId) {
      friendshipSocket(user2.socketId); // assumed function to emit
    }

    return res.json({ success: true, message: "Request sent" });
  } catch (error) {
    console.error("Error in newFriendship:", error);
    return res.json({ success: false, message: error.message });
  }
};


const friendshipSocket = async(socketId) =>{
  io.to(socketId).emit("refreshFriends");
};


const changeFriendStatus = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.json({ success: false, message: "UserId is required" });

    const { action, friendshipId } = req.body;

    const frndshp = await friendshipModel.findById(friendshipId).select("sentBy sentTo status");
    if (!frndshp) return res.json({ success: false, message: "Friendship not found" });

    const { sentBy, sentTo, status } = frndshp;

    const isSender = userId.toString() === sentBy.toString();
    const isReceiver = userId.toString() === sentTo.toString();

    // Already deleted
    if (status === "deleted") {
      return res.json({ success: false, message: "Friendship is already deleted" });
    }

    // Pending status
    if (status === "pending") {
      if (action === "deleted") {
        if (!isSender) {
          return res.json({ success: false, message: "Only sender can delete pending request" });
        }

        frndshp.status = "deleted";
        await frndshp.save();

        const receiver = await userModel.findById(sentTo).select("socketId");
        if (receiver?.socketId) {
          friendshipSocket(receiver.socketId, "deleted");
        }

        return res.json({ success: true, message: "Friendship deleted" });
      }

      if (!isReceiver) {
        return res.json({ success: false, message: "Only receiver can accept or reject" });
      }

      if (["accepted", "rejected"].includes(action)) {
        frndshp.status = action;
        await frndshp.save();

        const sender = await userModel.findById(sentBy).select("socketId");
        if (sender?.socketId) {
          friendshipSocket(sender.socketId, action); // emit to sender
        }

        return res.json({ success: true, message: `Status changed to ${action}` });
      }

      return res.json({ success: false, message: "Invalid action" });
    }

    // Already accepted or rejected
    if (action === "deleted") {
      frndshp.status = "deleted";
      await frndshp.save();

      const otherUserId = isSender ? sentTo : sentBy;
      const otherUser = await userModel.findById(otherUserId).select("socketId");
      if (otherUser?.socketId) {
        friendshipSocket(otherUser.socketId);
      }

      return res.json({ success: true, message: "Friendship deleted" });
    }

    return res.json({ success: false, message: "This friendship can only be deleted" });
  } catch (error) {
    console.error("Error in changeFriendStatus:", error);
    return res.json({ success: false, message: error.message });
  }
};



const getFriendships = async (req, res) => {
  const userId = req.userId;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const pipeline = [
    {
      $match: {
        $or: [
          { sentBy: userObjectId },
          { sentTo: userObjectId }
        ]
      }
    },
    {
      $addFields: {
        friendId: {
          $cond: [
            { $eq: ["$sentBy", userObjectId] },
            "$sentTo",
            "$sentBy"
          ]
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "friendId",
        foreignField: "_id",
        as: "friend"
      }
    },
    { $unwind: "$friend" },
    {
      $project: {
        status: 1,
        sentBy: 1,
        sentTo: 1,
        username: "$friend.username",
        fId: "$friend._id",
        fullName: "$friend.fullName",
        avatar: "$friend.avatar",
        isOnline: "$friend.isOnline",
        statistics: "$friend.statistics"
      }
    }
  ];

  try {
    const friends = await friendshipModel.aggregate(pipeline);
    res.json({ success: true, message: "OK", content: friends });
  } catch (err) {
    res.json({ success: false, message: "Failed to get friends", error: err.message });
  }
};




export {newFriendship,changeFriendStatus,getFriendships};