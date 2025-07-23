import friendshipModel from "../models/friendshipModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose";

const newFriendship = async (req, res) => {
  try {
    const user1 = req.userId;
    const { username } = req.body;

    const user2 = await userModel.findOne({ username });
    if (!user2 || user1.toString() === user2._id.toString()) {
      return res.json({
        success: false,
        message: "Invalid friend request",
      });
    }

    const users = [user1, user2._id].sort(); // always sorted

    // Check if friendship already exists
    const exists = await friendshipModel.findOne({ users });
    if (exists) {
      return res.json({
        success: false,
        message: "Friendship already exists",
      });
    }

    const frndshp = new friendshipModel({ users,sentBy:user1 });
    await frndshp.save();

    return res.json({ success: true, message: "Request sent" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};



const changeFriendStatus = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.json({ success: false, message: "UserId is required" });

    const { action, friendshipId } = req.body;

    const frndshp = await friendshipModel.findById(friendshipId).select("users status sentBy");
    if (!frndshp) return res.json({ success: false, message: "Friendship not found" });

    // If already deleted
    if (frndshp.status === "deleted") {
      return res.json({ success: false, message: "Friendship is already deleted" });
    }

    // Handle pending
    if (frndshp.status === "pending") {
      if (action === "deleted") {
        if (userId.toString() !== frndshp.sentBy.toString()) {
          return res.json({ success: false, message: "Deletion not allowed" });
        } else {
          frndshp.status = "deleted";
          await frndshp.save();
          return res.json({ success: true, message: "Friendship deleted" });
        }
      }

      // Only receiver can accept/reject
      if (userId.toString() === frndshp.sentBy.toString()) {
        return res.json({ success: false, message: "Sender cannot accept or reject" });
      }

      if (["accepted", "rejected"].includes(action)) {
        frndshp.status = action;
        await frndshp.save();
        return res.json({ success: true, message: `Status changed to ${action}` });
      }

      return res.json({ success: false, message: "Invalid action" });
    }

    // Already accepted/rejected => only allow delete
    if (action === "deleted") {
      frndshp.status = "deleted";
      await frndshp.save();
      return res.json({ success: true, message: "Friendship deleted" });
    }

    return res.json({ success: false, message: "This friendship can only be deleted" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


const getFriendships = async (req, res) => {
  const userId = req.userId;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const pipeline = [
    {
      $match: {
        users: userObjectId
      }
    },
    {
        $addFields: {
            friendId: {
            $first: {
                $filter: {
                input: "$users",
                as: "uid",
                cond: { $ne: ["$$uid", userObjectId] }
                }
            }
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
        sentBy:1,
        username: "$friend.username",
        fId: "$friend._id",
        fullName : "$friend.fullName",
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