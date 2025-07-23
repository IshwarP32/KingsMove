import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";

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
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [gameId, setGameId] = useState(localStorage.getItem("gameId"));
  const player = "w";
  const [canGo, setCanGo] = useState([]);
    const [canEat, setCanEat] = useState([]);
    const [activeCell, setActiveCell] = useState([-1, -1]);

  const [board, setBoard] = useState(roughBoard);
  const newGame = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/arena/init");
      //   console.log(data);
      console.log(data);
      if (data.success) {
        localStorage.setItem("gameId", data.gameId);
        roughBoard = data.board;
        setBoard(roughBoard);
        toast.success("New Game Created");
      } else {
        toast.error("Something went wrong while creating new game");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const loadGame = async () => {
    const { data } = await axios.post(backendUrl + "/api/arena/load", {
      gameId,
    });
    // console.log(data);
    roughBoard = data.board;
    setBoard(data.board);
    getStatus();
  };

  const get_moves = async ()=>{
    const {data} = await axios.post(backendUrl+"/api/arena/get-moves",{gameId,x:activeCell[0],y:activeCell[1]})
    // console.log(data);
    setCanEat(data.tempCanEat);
    setCanGo(data.tempCanGo);
  }

  const getStatus = async ()=>{
    const {data} = await axios.post(backendUrl+"/api/arena/get-status",{gameId,player});
    if(data.result == "check"){
      toast.warn("You have been checked")
    }
  }

  const updateBoard = async ()=>{
    try {
      const {data} = await axios.post(backendUrl+"/api/arena/update",{gameId,board});
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

  useEffect(() => {
    if (!gameId) {
      newGame();
    } else {
      loadGame();
    }
  }, [gameId]);

  const value = {
    backendUrl,
    newGame,
    roughBoard,
    gameId,
    loadGame,
    board,
    setBoard,
    canEat,canGo,setCanEat,setCanGo,activeCell,setActiveCell,get_moves,updateBoard,player
  };
  return (
    <ArenaContext.Provider value={value}>
      {props.children}
    </ArenaContext.Provider>
  );
};

export default ArenaContextProvider;
