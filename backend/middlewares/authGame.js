import gameModel from "../models/gameModel.js";
import mongoose from "mongoose";

const authGame = async (req, res, next) => {
  try {
    const { gameId } = req.body;
    // console.log(gameId,req.body.player || "");

    // Validate format before converting
    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
      return res.json({ success: false, message: "Invalid or missing Game ID" });
    }

    const objectId = new mongoose.Types.ObjectId(gameId);

    // Check if game exists
    const exists = await gameModel.exists({ _id: objectId });
    if (!exists) {
      return res.json({ success: false, message: "Game expired or does not exist" });
    }

    // Attach validated ObjectId for downstream middleware/controllers
    req.body.gameId = objectId;

    next();
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

export { authGame };
