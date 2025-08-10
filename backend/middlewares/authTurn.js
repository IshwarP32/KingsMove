import gameModel from "../models/gameModel.js";
import mongoose from "mongoose";

const authTurn = async (req, res, next) => {
  try {
    const { gameId } = req.body;
    // console.log(gameId,req.body.player || "");

    // Validate format before converting
    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
      return res.json({ success: false, message: "Invalid or missing Game ID" });
    }

    const objectId = new mongoose.Types.ObjectId(gameId);

    // Check if game exists
    const game = await gameModel.findById(objectId);
    if (!game) {
        return res.json({ success: false, message: "Game expired or does not exist" });
    }
    const userId = req.userId;
    // console.log(game.turn, game.white, userId);
    if(game.turn == "w" && game.white.toString() !== userId.toString()){
      console.log("returned")
        return res.json({success:false, message:"Its not you turn bro !"})
    }
    else if(game.turn == "b" && game.black.toString() !== userId.toString()){
        return res.json({success:false, message:"Its not you turn bro !"})
    }
    next();
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

export { authTurn };
