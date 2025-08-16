import { Socket } from "socket.io";
import gameModel from "../models/gameModel.js";
// In-memory board store (for demo; use Redis or similar for production)
import {initGame,applyResultAndUpdateStats} from "./gameLogic.js"
import { io } from "../server.js";
import userModel from "../models/userModel.js";
const queue = [];
// Keep cookie behavior centralized in authUser/login/logout

// Unified king safety check: always pass the board explicitly

const allotGame = async (req,res)=>{
  try {
    const uid = req.userId ? String(req.userId) : null;
    if (!uid) return res.json({ success: false, message: "Unauthorized" });

    // If already waiting, don't create a self-match or re-enqueue
    if (queue[0] === uid) {
      return res.json({ success: true, message: "Waiting for opponent" });
    }

    if (queue.length === 0) {
      queue.push(uid);
      return res.json({ success: true, message: "Waiting for opponent" });
    } else {
      // Prevent self-match if somehow same uid reappears
      const opponent = queue.shift();
      if (opponent === uid) {
        // Put back and return waiting
        queue.unshift(opponent);
        return res.json({ success: true, message: "Waiting for opponent" });
      }
      const result = await initGame(uid, opponent);
      return res.json(result || { success: false, message: "Something went wrong while initialising game" });
    }
  } catch (error) {
    return res.json({success:false, message:error.message});
  }
}

const stopWaiting = async (req,res)=>{
  const uid = req.userId ? String(req.userId) : null;
  if (!uid) return res.json({ success: false, message: "Unauthorized" });
  const index = queue.findIndex((x) => x === uid);
  if (index !== -1) {
    queue.splice(index, 1);
    return res.json({ success: true, message: "Player removed from queue" });
  }
  return res.json({success:false, message:"Player not in queue"})
}

const findActiveGame = async (req, res) => {
  try {
  const userId = req.userId;
  if((queue[0] === String(userId))){
    return res.json({success:false,message:"Already in queue",waiting:true});
  }
    let player = "w";
    let game = await gameModel.findOne({white:userId,winner:""});
    if(!game){
      player = "b";
      game = await gameModel.findOne({black:userId,winner:""});
    }

    if (!game) {
      return res.json({success:false, message: "No active game found",waiting:false});
    }
    // find enemy and return username
    const enemyId = player === "w" ? game.black : game.white;
    let enemyUsername = "";
    if (enemyId) {
      const enemy = await userModel.findById(enemyId).select("username");
      enemyUsername = enemy?.username || "";
    }
    

    res.json({success:true, message:"Game found",gameId:game._id,player, enemyUsername,waiting:false});
  } catch (error) {
    console.error(error);
    res.json({success:false,message:error.message});
  }
};

const QuitGame = async (req, res) => {
  try {
    const userId = req.userId;
    let player = "w";
    let game = await gameModel.findOne({ white: userId });
    let enemyId = game?.black;
    if (!game) {
      player = "b";
      game = await gameModel.findOne({ black: userId });
      enemyId = game?.white;
    }
    if (!game) {
      return res.json({ success: false, message: "No game to delete" });
    }
    const enemy = player === "w" ? "b" : "w";
    await applyResultAndUpdateStats(game._id, enemy);
    await gameModel.findByIdAndDelete(game._id);

    if (enemyId) {
      const enemyDB = await userModel.findById(enemyId).select("socketId");
      if (enemyDB?.socketId) {
        io.to(enemyDB.socketId).emit("EnemyLeft");
      }
    }
    return res.json({ success: true, message: "Game Deleted" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
}

export { allotGame, stopWaiting, findActiveGame, QuitGame };