import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ArenaContext } from "../../context/ArenaContext";

const Arena = () => {
  const {
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
  } = useContext(ArenaContext);

  useEffect(() => {
    checkActiveGame();
  }, []);

  const [finding, setFinding] = useState(false);
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
      <div className="flex flex-col items-center m-5 sm:m-10">
        {board && (player === "b" ? [...board].map(row => [...row].reverse()).reverse() : board).map(
          (row, rowIndexOrig) => {
            const rowIndex = player === "b" ? 7 - rowIndexOrig : rowIndexOrig;
            return (
              <div key={rowIndexOrig} className="flex flex-row">
                {row.map((box, colIndexOrig) => {
                  const colIndex = player === "b" ? 7 - colIndexOrig : colIndexOrig;
                  const isChecked = isCheckedSquare(rowIndex, colIndex);
                  return (
                    <div
                      key={rowIndex + "-" + colIndex}
                      className={`w-12 h-12 sm:w-18 sm:h-18 border
                        ${
                          isActive(rowIndex, colIndex)
                            ? "bg-green-700"
                            : isChecked
                            ? "bg-yellow-400/70 border-4 border-red-500 animate-pulse"
                            : isCanGo(rowIndex, colIndex)
                            ? "bg-blue-700/80 border-blue-900"
                            : isEatable(rowIndex, colIndex)
                            ? "bg-red-500/80"
                            : (rowIndex + colIndex) % 2
                            ? "bg-gray-700"
                            : "bg-gray-100"
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
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }
        )}
      </div>
    </div>
  ) : (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-blue-900/10 text-white px-4">
      <div
        className={`bg-blue-800 rounded-3xl p-10 w-full max-w-md text-center shadow-2xl transition-all duration-300 ${
          finding ? "opacity-80 cursor-pointer" : "hover:scale-105 cursor-pointer"
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
  );
};

export default Arena;
