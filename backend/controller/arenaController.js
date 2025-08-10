import { Socket } from "socket.io";
import gameModel from "../models/gameModel.js";
// In-memory board store (for demo; use Redis or similar for production)
import {initGame,applyResultAndUpdateStats} from "./gameLogic.js"
import { io } from "../server.js";
import userModel from "../models/userModel.js";
const queue = [];
const options = { // for cookie
      httpOnly : true,
      secure : process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 //1 day
    }

// Unified king safety check: always pass the board explicitly

const allotGame = async (req,res)=>{
  try {
    const userId = req.userId;
    if(queue.length == 0){
      queue.push(userId);
      return res.json({success:true, message:"Waiting for opponent"});
    }
    else{
      await initGame(userId, queue.shift());
      return res.json({ success: true, message:"Game Created"});
    }
  } catch (error) {
    return res.json({success:false, message:error.message});
  }
}

const stopWaiting = async (req,res)=>{
  const userId = req.userId;
  const index = queue.indexOf(userId);
  if (index !== -1) {
    queue.splice(index, 1);
    return res.json({ success: true, message: "Player removed from queue" });
  }
  return res.json({success:false, message:"Player not in queue"})
}

const findActiveGame = async (req, res) => {
  try {
    const userId = req.userId;
    let player = "w";
    let game = await gameModel.findOne({white:userId});
    if(!game){
      player = "b";
      game = await gameModel.findOne({black:userId});
    }

    if (!game) {
      return res.json({success:false, message: "No active game found" });
    }
    // find enemy and return username
    const enemyId = player === "w" ? game.black : game.white;
    let enemyUsername = "";
    if (enemyId) {
      const enemy = await userModel.findById(enemyId).select("username");
      enemyUsername = enemy?.username || "";
    }

    res.json({success:true, message:"Game found",gameId:game._id,player, enemyUsername});
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