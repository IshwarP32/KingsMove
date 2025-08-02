import express from "express";
import { allotGame, stopWaiting ,findActiveGame} from "../controller/arenaController.js";
// import { authUser } from "../middlewares/authUser.js";
import {statusCheck,updateBoard,get_moves, getBoard} from "../controller/gameLogic.js"
import { authGame } from "../middlewares/authGame.js";
import { authUser } from "../middlewares/authUser.js";
import { authTurn } from "../middlewares/authTurn.js";
const arenaRouter = express.Router();

//unsecure Routes
arenaRouter.get("/init",allotGame);
arenaRouter.post("/stop-waiting",stopWaiting);
arenaRouter.post("/findActive",findActiveGame);

//secure Routes
arenaRouter.post("/update",authGame,authTurn,updateBoard);
arenaRouter.post("/load",authGame,getBoard);
arenaRouter.post("/get-moves",authGame,authTurn,get_moves);
arenaRouter.post("/get-status",authGame,statusCheck);


export default arenaRouter;