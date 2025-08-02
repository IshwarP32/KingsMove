import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { IdCard } from "lucide-react";
import { useContext } from "react";
import socket from "../src/Socket";

export const ArenaContext = createContext();
let roughBoard = [
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
];

const ArenaContextProvider = (props) => {
  socket.on("updateBoard",(board)=>{
    setBoard(board);
    roughBoard=board;
    
    loadGame();
  })
  const [winner,setWinner] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [gameId, setGameId] = useState(null);
  const [player, setPlayer] = useState("w");
  const [canGo, setCanGo] = useState([]);
    const [canEat, setCanEat] = useState([]);
    const [activeCell, setActiveCell] = useState([-1, -1]);
    const [isCheck,setIsCheck] = useState(false);
    const [checkCSS,setCheckCSS] = useState([]);

  const [board, setBoard] = useState(roughBoard);
  const addToQueue = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/arena/init",{withCredentials:true});
      //   console.log(data);
      // console.log(data);
      if (data.success) {
        checkActiveGame();
        toast.success("Added to queue");
      } else {
        toast.error("Something went wrong while adding to queue");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const removeFromQueue = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/arena/stop-waiting",{},{withCredentials:true});
      //   console.log(data);
      console.log(data);
      if (data.success) {
        // checkActiveGame();
        toast.success("Removed from queue");
      } else {
        toast.error("Something went wrong removing queue");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadGame = async (id = gameId) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/arena/load", {
        gameId:id,
      },{withCredentials:true});
      roughBoard = data.board;
      setBoard(data.board);
      getStatus(id);
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const get_moves = async ()=>{
    setCanEat([]);
    setCanGo([]);
    const {data} = await axios.post(backendUrl+"/api/arena/get-moves",{gameId,x:activeCell[0],y:activeCell[1]},{withCredentials:true})
    if(data.success){
      // console.log(data);
      setCanEat(data.tempCanEat);
      setCanGo(data.tempCanGo);
    }
  }

  const getStatus = async (id)=>{
    const {data} = await axios.post(backendUrl+"/api/arena/get-status",{gameId:id},{withCredentials:true});
    // console.log(data.winner);
    if(!data.success) return;
    if(data.winner!==""){
        setWinner(data.winner);
    }
    // console.log(data);
    if(data.result===""){
      setIsCheck(false);
    }
    else if(data.result == "check"){
      if(data.player === player){
        setIsCheck(data.player);
        setCheckCSS(data.kingPosition)
        toast.warn("You have been checked");
      }
      else{
        setIsCheck(data.player);
        setCheckCSS(data.kingPosition)
        toast.warn("Enemy is checked");
      }
    }else if(data.result == "checkmate"){
      if(data.player === player){
        setIsCheck(data.player);
        setCheckCSS(data.kingPosition)
      }
      else{
        setIsCheck(data.player);
        setCheckCSS(data.kingPosition)
      }
    }else{
      if(data.player === player){
        toast.warn("You have been stalemate");
      }
      else{
        toast.warn("You have stalemate enemy");
      }
    }
  }

  const updateBoard = async ()=>{
    try {
      const {data} = await axios.post(backendUrl+"/api/arena/update",{gameId,board},{withCredentials:true});
      // console.log(data);
      if(data.success){
        setBoard(roughBoard);
      }
      else{
        toast.error("Unable to update in database");
        roughBoard=board;
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkActiveGame = async ()=>{
    try {
      const {data} = await axios.post(backendUrl+"/api/arena/findActive",{},{withCredentials:true});
      if(data.success){
        setPlayer(data.player);
        setGameId(data.gameId);
        return true;
      }
      else{
        // toast.error("No Active Game");
        return false;
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  }

 useEffect(() => {
  if (!gameId) {
    checkActiveGame();
  }else{
    loadGame();
  }
}, [gameId]);


  const value = {
    checkCSS,
    removeFromQueue,
    backendUrl,
    addToQueue,
    roughBoard,
    gameId,
    loadGame,
    board,
    setBoard,
    canEat,canGo,setCanEat,setCanGo,activeCell,setActiveCell,get_moves,updateBoard,player,checkActiveGame,isCheck,winner
  };
  return (
    <ArenaContext.Provider value={value}>
      {props.children}
    </ArenaContext.Provider>
  );
};

export default ArenaContextProvider;
