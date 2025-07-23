import express from "express";
import { allotGame, stopWaiting } from "../controller/arenaController.js";
// import { authUser } from "../middlewares/authUser.js";
import {statusCheck,updateBoard,get_moves, getBoard} from "../controller/gameLogic.js"
const arenaRouter = express.Router();

//unsecure Routes
arenaRouter.get("/init",allotGame);
arenaRouter.post("/stop-waiting",stopWaiting);

//secure Routes
arenaRouter.post("/update",updateBoard);
arenaRouter.post("/load",getBoard);
arenaRouter.post("/get-moves",get_moves);
arenaRouter.post("/get-status",statusCheck);


export default arenaRouter;