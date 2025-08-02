import express from "express";
import { changePassword, createUser, deleteSocketId, deleteUser, loginuser, logout, saveSocketId, updateUser, userInfo } from "../controller/userController.js";
import upload from "../middlewares/multer.js";
import { authUser } from "../middlewares/authUser.js";
import { changeFriendStatus, getFriendships, newFriendship } from "../controller/friendshipController.js";
import { changeChallengeStatus, createChallenge, getChallenges } from "../controller/challenegeController.js";
const userRouter = express.Router();

//unsecure Routes
userRouter.post("/create",upload.none(),createUser);
userRouter.post("/login",upload.none(),loginuser);

//secure Routes
userRouter.post("/delete",upload.none(),authUser,deleteUser);
userRouter.post("/info",upload.none(),authUser,userInfo);
userRouter.post("/logout",upload.none(),authUser,logout);
userRouter.post("/change-pass",upload.none(),authUser,changePassword);
userRouter.post("/update",upload.single("image"),authUser,updateUser);
userRouter.post("/socket/update",upload.none(),authUser,saveSocketId);
// userRouter.post("/socket/delete",upload.none(),authUser,deleteSocketId);

//FriendshipRoutes
userRouter.post("/friend/new",upload.none(),authUser,newFriendship);
userRouter.post("/friend/get-all",upload.none(),authUser,getFriendships);
userRouter.post("/friend/changeStatus",upload.none(),authUser,changeFriendStatus);

//ChallengeRoutes
userRouter.post("/challenge/new", upload.none(), authUser, createChallenge);
userRouter.post("/challenge/change-status", upload.none(), authUser, changeChallengeStatus);
userRouter.post("/challenge/get-all", upload.none(), authUser, getChallenges);

export default userRouter;