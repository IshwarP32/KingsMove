import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets.js";
import { ArenaContext } from "../../context/ArenaContext.jsx";
import socket from "../Socket.js";
import axios from "axios";
import { toast } from "react-toastify";

const Square = React.memo(({ rowIndex, colIndex, box, isActive, isCanGo, isEatable, isChecked, onClick }) => {
  let bgClass = "";
  if (isActive) bgClass = "bg-green-700";
  else if (isChecked) bgClass = "bg-yellow-400/70 border-4 border-red-500 animate-pulse";
  else if (isCanGo) bgClass = "bg-blue-700/80 border-blue-900";
  else if (isEatable) bgClass = "bg-red-500/80";
  else bgClass = (rowIndex + colIndex) % 2 ? "bg-gray-700" : "bg-gray-100";

  return (
    <div
      className={`chess-square border ${bgClass}`}
      onClick={onClick}
    >
      {box && (
        <img
          src={assets[box].icon}
          alt={box}
          className={`w-full h-full object-contain ${isActive ? "scale-115 transition-all duration-1000" : ""}`}
        />
      )}
    </div>
  );
});

const Arena = () => {
  const {
    finding,setFinding,
    backendUrl,
    roughBoard,
    board,
    setBoard,
    get_moves,
    isCheck,
    checkCSS, // array or object with checked king position
    canEat,
    canGo,
    activeCell,
    setActiveCell,
    updateBoard,
    player,
    checkActiveGame,
    gameId,
    addToQueue,
    removeFromQueue,
    winner, // "" | "w" | "b" | "draw"
    enemyUsername
  } = useContext(ArenaContext);


  useEffect(() => {
    checkActiveGame();
  }, []);

  // Socket listeners (mount once)
  useEffect(() => {
    const onGameStarted = () => window.location.reload();
    const onEnemyLeft = () => {
      toast.info("Opponent left the game");
      setTimeout(()=>{
        window.location.reload();
      },2000);
    };
    socket.on("game_started", onGameStarted);
    socket.on("EnemyLeft", onEnemyLeft);
    return () => {
      socket.off("game_started", onGameStarted);
      socket.off("EnemyLeft", onEnemyLeft);
    };
  }, []);

  
  const handleFindGame = async () => {
    if (!finding) {
      setFinding(true);
      await addToQueue();
    } else {
      setFinding(false);
      await removeFromQueue();
    }
  };

  useEffect(() => {
    get_moves();
  }, [activeCell]);

  const clickHandler = (rowIndex, colIndex) => {
    // Block clicks if game is over
    if (winner !== "") return;

    if (isEatable(rowIndex, colIndex)) {
      roughBoard[rowIndex][colIndex] = roughBoard[activeCell[0]][activeCell[1]];
      roughBoard[activeCell[0]][activeCell[1]] = "";
      setBoard(roughBoard);
      updateBoard();
      setActiveCell([-1, -1]);
      return;
    }
    if (isCanGo(rowIndex, colIndex)) {
      roughBoard[rowIndex][colIndex] = roughBoard[activeCell[0]][activeCell[1]];
      roughBoard[activeCell[0]][activeCell[1]] = "";
      updateBoard();
      setActiveCell([-1, -1]);
      return;
    }
    if (board[rowIndex][colIndex] === "") {
      setActiveCell([-1, -1]);
      return;
    } else if (board[rowIndex][colIndex][0] == player) {
      setActiveCell([rowIndex, colIndex]);
      return;
    }
  };

  // Quit with confirmation
  const handleQuit = async () => {
    const ok = window.confirm("Are you sure you want to quit? You will be marked as Lost!");
    if (!ok) return;
    try {
      const { data } = await axios.post(
        backendUrl + "/api/arena/quit",
        { gameId },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("You quit the game");
        setTimeout(()=>{
          window.location.reload();
        },2000);
      } else {
        toast.error(data.message || "Failed to quit");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to quit");
    }
  };

  const isActive = (r, c) => activeCell[0] === r && activeCell[1] === c;
  const isCanGo = (r, c) => canGo.some(([x, y]) => x === r && y === c);
  const isEatable = (r, c) => canEat.some(([x, y]) => x === r && y === c);
  const isCheckedSquare = (r, c) => checkCSS && checkCSS.i === r && checkCSS.j === c;

  // Determine result message
  let resultMessage = "";
  if (winner !== "") {
    // console.log(winner);
    if (winner === "draw") resultMessage = "It's a Draw!";
    else if (winner === player) resultMessage = "You Won!";
    else resultMessage = "You Lost!";
  }

  return gameId ? (
    <div className="min-h-[calc(100vh-64px)] relative">
      {/* Side Info Card + Quit - Desktop Only */}
      <div className="ml-10 hidden lg:flex absolute left-4 top-4 z-20 flex-col gap-3 items-stretch">
        <div className="bg-white/90 backdrop-blur rounded-xl border border-blue-100 shadow-lg p-3 sm:p-4 w-56 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="min-w-0">
              <div className="text-[11px] tracking-wide text-blue-500">Opponent Username : @{enemyUsername || "unknown"}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-center gap-2">
            <span className="text-[11px] tracking-wide text-gray-500">You</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${
              player === 'w'
                ? 'bg-white text-gray-800 border-gray-300'
                : 'bg-gray-900 text-white border-gray-700'
            }`}>
              {player === 'w' ? 'White' : 'Black'}
            </span>
          </div>
        </div>
        {winner === "" && (
          <button
            onClick={handleQuit}
            className="w-56 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Quit
          </button>
        )}
      </div>
      {winner !== "" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="bg-white text-black rounded-xl shadow-xl p-6 text-center space-y-4">
            <h2 className="text-3xl font-bold">{resultMessage}</h2>
            <button
              onClick={() => window.location.reload()} // Simple refresh to reset
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      {/* Game Over Overlay */}

  {/* Chess Board */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className="chessboard-responsive">
          <style jsx>{`
            .chessboard-responsive {
              display: grid;
              grid-template-rows: repeat(8, 1fr);
              width: min(90vw, 90vh - 120px, 480px);
              height: min(90vw, 90vh - 120px, 480px);
              max-width: 480px;
              max-height: 480px;
              margin: 0 auto;
            }
            
            .chess-square {
              aspect-ratio: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
            }
            
            .chess-row {
              display: grid;
              grid-template-columns: repeat(8, 1fr);
              width: 100%;
              height: 100%;
            }
            
            @media (max-width: 640px) {
              .chessboard-responsive {
                width: min(95vw, 85vh - 100px);
                height: min(95vw, 85vh - 100px);
              }
            }
            
            @media (orientation: landscape) and (max-height: 640px) {
              .chessboard-responsive {
                width: min(70vh, 90vw);
                height: min(70vh, 90vw);
              }
            }
          `}</style>
          {board && (player === "b" ? [...board].map(row => [...row].reverse()).reverse() : board).map(
            (row, rowIndexOrig) => {
              const rowIndex = player === "b" ? 7 - rowIndexOrig : rowIndexOrig;
              return (
                <div key={rowIndexOrig} className="chess-row">
                  {row.map((box, colIndexOrig) => {
                    const colIndex = player === "b" ? 7 - colIndexOrig : colIndexOrig;
                    return (
                      <Square
                        key={rowIndex + "-" + colIndex}
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        box={box}
                        isActive={isActive(rowIndex, colIndex)}
                        isCanGo={isCanGo(rowIndex, colIndex)}
                        isEatable={isEatable(rowIndex, colIndex)}
                        isChecked={isCheckedSquare(rowIndex, colIndex)}
                        onClick={() => clickHandler(rowIndex, colIndex)}
                      />
                    );
                  })}
                </div>
              );
            }
          )}
        </div>
        
        {/* Mobile Info Card + Quit - Only visible on mobile */}
        <div className="lg:hidden mt-6 w-full max-w-sm px-4">
          <div className="bg-white/90 backdrop-blur rounded-xl border border-blue-100 shadow-lg p-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="min-w-0">
                <div className="text-[11px] tracking-wide text-blue-500">Opponent Username : @{enemyUsername || "unknown"}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-center gap-2">
              <span className="text-[11px] tracking-wide text-gray-500">You</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${
                player === 'w'
                  ? 'bg-white text-gray-800 border-gray-300'
                  : 'bg-gray-900 text-white border-gray-700'
              }`}>
                {player === 'w' ? 'White' : 'Black'}
              </span>
            </div>
          </div>
          {winner === "" && (
            <button
              onClick={handleQuit}
              className="w-full mt-3 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Quit
            </button>
          )}
        </div>
      </div>
      </div>
     ) : (
      <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-blue-900/10 text-white px-4">
        <div
          className={`bg-blue-800 rounded-3xl p-10 w-full max-w-md text-center shadow-2xl transition-all duration-300 ${finding ? "opacity-80 cursor-pointer" : "hover:scale-105 cursor-pointer"
            }`}
          onClick={handleFindGame}
        >
          {!finding ? (
            <>
              <h2 className="text-3xl font-bold">Find Game</h2>
              <p className="text-sm text-blue-200 mt-2">Click to start matchmaking</p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-2xl font-semibold">Finding Game...</p>
              <p className="text-sm text-blue-200 mt-2">Click To Cancel</p>
            </div>
          )}
        </div>
      </div>
      ) 
};

      export default Arena;
