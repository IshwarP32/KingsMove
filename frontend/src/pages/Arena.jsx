import React, { act, useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import axios from "axios";
import ArenaContextProvider, { ArenaContext } from "../../context/ArenaContext";
import { toast } from "react-toastify";


const Arena = () => {
  const [gameActive, setGameActive] = useState(false);
  const [finding, setFinding] = useState(false);
  const handleFindGame = async ()=>{
    setFinding(true);
  }

  const {backendUrl,roughBoard,board,setBoard,get_moves
      ,canEat,canGo,activeCell,setActiveCell,updateBoard,player
  } = useContext(ArenaContext);

  useEffect(() => {
    get_moves();
  }, [activeCell]);

  const clickHandler = (rowIndex, colIndex) => {
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
    } 
    else if(board[rowIndex][colIndex][0]==player) {
      setActiveCell([rowIndex, colIndex]);
      return;
    }
  };
  const isActive = (r, c) => activeCell[0] === r && activeCell[1] === c;
  const isCanGo = (r, c) => canGo.some(([x, y]) => x === r && y === c);
  const isEatable = (r, c) => canEat.some(([x, y]) => x === r && y === c);
  return (
    gameActive ?
    <div className="min-h-[calc(100vh-64px)]">
      {/* player eliminated section */}
      <div>

      </div>
      {/*chess board  */}
        <div className="flex flex-col items-center m-5 sm:m-10">
          {(player === "b" ? [...board].map(row => [...row].reverse()).reverse() : board).map((row, rowIndexOrig) => {
          // For black, reverse both rows and columns for 180-degree rotation
          const rowIndex = player === "b" ? 7 - rowIndexOrig : rowIndexOrig;
          return (
            <div key={rowIndexOrig} className="flex flex-row">
              {row.map((box, colIndexOrig) => {
                const colIndex = player === "b" ? 7 - colIndexOrig : colIndexOrig;
                return (
                  <div
                    key={rowIndex + "-" + colIndex}
                    className={`w-12 h-12 sm:w-18 sm:h-18 border
                      ${
                        isActive(rowIndex, colIndex)
                          ? "bg-green-700"
                          : isCanGo(rowIndex, colIndex)
                          ? "bg-blue-700/80 border-blue-900"
                          : isEatable(rowIndex, colIndex)
                          ? "bg-red-500/80"
                          : `${
                              (rowIndex + colIndex) % 2
                                ? "bg-gray-700"
                                : "bg-gray-100"
                            }`
                      }
                      `}
                    onClick={() => clickHandler(rowIndex, colIndex)}
                  >
                    {box && assets[box] && (
                      <img
                        src={assets[box].icon}
                        alt={box}
                        className={`${
                          isActive(rowIndex, colIndex)
                            ? "scale-115 transition-all duration-1000"
                            : ""
                        }}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {/* opponents eliminated section */}
      <div></div>
    </div>:
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-blue-900/10 text-white px-4">
      <div
        className={`bg-blue-800 rounded-3xl p-10 w-full max-w-md text-center shadow-2xl transition-all duration-300 ${
          finding ? "opacity-80 cursor-not-allowed" : "hover:scale-105 cursor-pointer"
        }`}
        onClick={!finding ? handleFindGame : undefined}
      >
        {!finding ? (
          <>
            <h2 className="text-3xl font-bold">Find Game</h2>
            <p className="text-sm text-blue-200 mt-2">Click to start matchmaking</p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-xl font-semibold">Finding Game...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Arena;
