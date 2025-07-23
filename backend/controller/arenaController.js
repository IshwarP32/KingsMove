import gameModel from "../models/gameModel.js";
// In-memory board store (for demo; use Redis or similar for production)
import {initGame} from "./gameLogic.js"
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
      const {gameId, newGame, err}= await initGame(userId, queue.shift());
      if(!gameId){
        return res.json({ success: false, message: err.message });
      }
      // need to notify user1
      return res.json({ success: true, message:"Game Created"});
    }
  } catch (error) {
    return res.json({success:false, message:err.message});
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


export {allotGame, stopWaiting };