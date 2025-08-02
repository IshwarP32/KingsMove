import mongoose from "mongoose";
import gameModel from "../models/gameModel.js";
import { io } from "../server.js";
import userModel from "../models/userModel.js";

const gameBoards = {};
const assets = {
    wPawn: { axis: [4] },
    wRook: { axis: [0,1] },
    wKnight: { axis: [3] },
    wBishop: { axis: [2] },
    wQueen: {  axis: [0,1,2] },
    wKing: { axis: [5] },
    bPawn: { axis: [4] },
    bRook: { axis: [0,1] },
    bKnight: { axis: [3] },
    bBishop: { axis: [2] } ,
    bQueen: {  axis: [0,1,2] },
    bKing: { axis: [5] },
};

const isSafeForKing = (player, rowIndex, colIndex, board) => {
  const directions = {
    straight: [ [1, 0], [-1, 0], [0, 1], [0, -1] ],
    diagonal: [ [1, 1], [1, -1], [-1, 1], [-1, -1] ],
    knight: [ [2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2] ]
  };
  const opponent = player === "w" ? "b" : "w";
  const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const pawnDir = player === "w" ? -1 : 1;
  for (const dc of [-1, 1]) {
    const r = rowIndex + pawnDir, c = colIndex + dc;
    if (inBounds(r, c) && board[r][c] === `${opponent}Pawn`) return false;
  }
  for (const [dr, dc] of directions.knight) {
    const r = rowIndex + dr, c = colIndex + dc;
    if (inBounds(r, c) && board[r][c] === `${opponent}Knight`) return false;
  }
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = rowIndex + dr, c = colIndex + dc;
      if (inBounds(r, c) && board[r][c] === `${opponent}King`) return false;
    }
  }
  const checkLine = (dirs, pieces) => {
    for (const [dr, dc] of dirs) {
      let r = rowIndex + dr, c = colIndex + dc;
      while (inBounds(r, c)) {
        const cell = board[r][c];
        if (cell !== "") {
          if (cell[0] === opponent && pieces.includes(cell.slice(1))) return true;
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return false;
  };
  if (checkLine(directions.straight, ["Rook", "Queen"])) return false;
  if (checkLine(directions.diagonal, ["Bishop", "Queen"])) return false;
  return true;
};

// Check status of game: returns { check, stalemate, checkmate }
const statusCheck = async (req, res) => {
  const { gameId } = req.body;
  const board = gameBoards[gameId];

  if (!board) return res.json({ success: false, message: "Board Not Found" });

  const players = ["w", "b"]; // Check both players
  let result = ""; // "check", "checkmate", "stalemate", or ""
  let affectedPlayer = null; // "w" or "b"
  let kingPosition = null; // { row, col } of affected king

  for (const player of players) {
    const enemy = player === "w" ? "b" : "w";
    let check = false;
    let stalemate = true;
    let currentKingPos = null;

    // Find player's king position
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] === `${player}King`) {
          currentKingPos = { row: i, col: j };
          break;
        }
      }
      if (currentKingPos) break;
    }

    if (!currentKingPos) continue; // King missing (shouldn't happen)

    // 1. Check if any enemy piece can attack the king
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] && board[i][j][0] === enemy) {
          const { tempCanEat } = get_moves({ body: { x: i, y: j, gameId } });
          if (tempCanEat.some(([ei, ej]) => ei === currentKingPos.row && ej === currentKingPos.col)) {
            check = true;
          }
        }
      }
    }

    // 2. Check if player has *any legal moves* (for stalemate/checkmate)
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] && board[i][j][0] === player) {
          const { tempCanGo, tempCanEat } = get_moves({ body: { x: i, y: j, gameId } });
          if (tempCanGo.length > 0 || tempCanEat.length > 0) {
            stalemate = false;
            break;
          }
        }
      }
      if (!stalemate) break;
    }

    if (check && stalemate) {
      result = "checkmate";
      await gameModel.findByIdAndUpdate(gameId, { winner: enemy });
      affectedPlayer = player;
      kingPosition = currentKingPos;
      break; // Game over, no need to check other player
    } else if (check) {
      result = "check";
      affectedPlayer = player;
      kingPosition = currentKingPos;
      // Don't break — the other player *might* also be in check (rare)
    } else if (stalemate) {
      await gameModel.findByIdAndUpdate(gameId, { winner: draw });
      result = "stalemate";
      affectedPlayer = player;
      kingPosition = currentKingPos;
      // Don't break — check both sides for stalemate
    }
  }
  const game = await gameModel.findById(gameId);
  res.json({ success: true, result, player: affectedPlayer, kingPosition,winner:game.winner });
};



// Update the board after a move, and return check/checkmate/stalemate status
const updateBoard = async (req, res) => {
  const { gameId, board } = req.body;

  gameBoards[gameId] = board; // update in-memory

  try {
    const game = await gameModel.findById(gameId);
    
    
    if (!game) {
      return res.json({ success: false, message: "Game not found" });
    }
    game.board = board;
    game.turn = game.turn === "w" ? "b":"w";
    await game.save();
    // 3. Get both users’ socket IDs
    const users = await userModel.find({ _id: { $in: [game.white, game.black] } }).select("socketId");

    // 4. Emit updateBoard to both users
    for (const user of users) {
      if (user.socketId) {
        io.to(user.socketId).emit("updateBoard", board);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// Initialize a game (call this when a new game starts)
const initGame = async (white, black) => {
    try {
      // Create and save a new game in MongoDB
      // console.log(white, black);
      const newGame = new gameModel({
        white,
        black
      });
      await newGame.save();
    
      const gameId = newGame._id.toString();
    // Store the board in memory for fast access
      gameBoards[gameId] = newGame.board;
    // ---------------------------- Need to notify the users that game has started --------------------
} catch (err) {
    return err;
  }
};

// Get the current board for a game
const getBoard = async (req, res) => {
  let {gameId}  = req.body;
  
  const userId = req.userId;
  let winner = "";
  if(!gameId){
    //try finding game for that user
    const game = await gameModel.findOne({$or: [{ white: userId }, { black: userId }]});
    if(!game){
      return res.json({success:false,message:"No Active Game for User"});
    }
    res.cookie("gameId",game._id.toString(),options);
    gameId = game._id;
    winner=game.winner;
  }
  if (gameBoards[gameId]) {
    // If found in memory, return it immediately
    return res.json({ success: true, board: gameBoards[gameId],winner });
  }
  try {
    const game = await gameModel.findById(gameId);
    if (!game) {
      return res.json({ success: false, message: "Game not found in DB" });
    }
    gameBoards[gameId] = game.board;
    return res.json({ success: true, board: game.board,winner:game.winner });
  } catch (error) {
    return res.json({ success: false, message: "Something went wrong" });
  }
};

// Example: get moves for a piece (stub)
const get_moves = (req, res) => {
    const { x, y, gameId } = req.body;
        const tempCanGo = [];
        const tempCanEat = [];
        if (x == -1) {
          if (res) res.json({ success: true, tempCanEat, tempCanGo });
          return { tempCanGo, tempCanEat };
        }
      
        const board = gameBoards[gameId];
        // console.log(x,y);
        
        const piece = board[x]?.[y];
      
        if (!piece || !assets[piece]) {
          if (res) res.json({ success: true, tempCanEat, tempCanGo });
          return { tempCanGo, tempCanEat };
        }
      
        // Use .axis directly
        let { axis } = assets[piece];
        if (axis === undefined) axis = [];
        if (!Array.isArray(axis)) axis = [axis];
      
        const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
      
      
        // Helper to check if a move is legal (king is not in check after move)
        const isLegalMove = (fromX, fromY, toX, toY) => {
          const boardCopy = board.map(row => [...row]);
          const movingPiece = boardCopy[fromX][fromY];
          boardCopy[toX][toY] = movingPiece;
          boardCopy[fromX][fromY] = "";
          // Find king position after move
          let kingRow = -1, kingCol = -1;
          const kingName = piece[0] + "King";
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (boardCopy[r][c] === kingName) {
                kingRow = r;
                kingCol = c;
                break;
              }
            }
            if (kingRow !== -1) break;
          }
          if (kingRow === -1) return false;
          return isSafeForKing(piece[0], kingRow, kingCol, boardCopy);
        };
      
        // Now, collect only legal moves
        const legalCanGo = [];
        const legalCanEat = [];
      
        for (const ax of axis) {
          if (ax === 0) {
            // Vertical movement (down)
            let step = 1;
            while (inBounds(x + step, y)) {
              if (board[x + step][y] !== "") {
                if (board[x + step][y][0] !== piece[0] && isLegalMove(x, y, x + step, y)) legalCanEat.push([x + step, y]);
                break;
              } else {
                if (isLegalMove(x, y, x + step, y)) legalCanGo.push([x + step, y]);
              }
              step++;
            }
            // Vertical movement (up)
            step = 1;
            while (inBounds(x - step, y)) {
              if (board[x - step][y] !== "") {
                if (board[x - step][y][0] !== piece[0] && isLegalMove(x, y, x - step, y)) legalCanEat.push([x - step, y]);
                break;
              } else {
                if (isLegalMove(x, y, x - step, y)) legalCanGo.push([x - step, y]);
              }
              step++;
            }
          } else if (ax === 1) {
            // Horizontal movement (right)
            let step = 1;
            while (inBounds(x, y + step)) {
              if (board[x][y + step] !== "") {
                if (board[x][y + step][0] !== piece[0] && isLegalMove(x, y, x, y + step)) legalCanEat.push([x, y + step]);
                break;
              } else {
                if (isLegalMove(x, y, x, y + step)) legalCanGo.push([x, y + step]);
              }
              step++;
            }
            // Horizontal movement (left)
            step = 1;
            while (inBounds(x, y - step)) {
              if (board[x][y - step] !== "") {
                if (board[x][y - step][0] !== piece[0] && isLegalMove(x, y, x, y - step)) legalCanEat.push([x, y - step]);
                break;
              } else {
                if (isLegalMove(x, y, x, y - step)) legalCanGo.push([x, y - step]);
              }
              step++;
            }
          } else if (ax === 2) {
            // Diagonals
            let step = 1;
            // down-right
            while (inBounds(x + step, y + step)) {
              if (board[x + step][y + step] !== "") {
                if (board[x + step][y + step][0] != piece[0] && isLegalMove(x, y, x + step, y + step)) legalCanEat.push([x + step, y + step]);
                break;
              } else if (isLegalMove(x, y, x + step, y + step)) legalCanGo.push([x + step, y + step]);
              step++;
            }
            // up-left
            step = 1;
            while (inBounds(x - step, y - step)) {
              if (board[x - step][y - step] !== "") {
                if (board[x - step][y - step][0] != piece[0] && isLegalMove(x, y, x - step, y - step)) legalCanEat.push([x - step, y - step]);
                break;
              } else if (isLegalMove(x, y, x - step, y - step)) legalCanGo.push([x - step, y - step]);
              step++;
            }
            // down-left
            step = 1;
            while (inBounds(x + step, y - step)) {
              if (board[x + step][y - step] !== "") {
                if (board[x + step][y - step][0] != piece[0] && isLegalMove(x, y, x + step, y - step)) legalCanEat.push([x + step, y - step]);
                break;
              } else if (isLegalMove(x, y, x + step, y - step)) legalCanGo.push([x + step, y - step]);
              step++;
            }
            // up-right
            step = 1;
            while (inBounds(x - step, y + step)) {
              if (board[x - step][y + step] !== "") {
                if (board[x - step][y + step][0] != piece[0] && isLegalMove(x, y, x - step, y + step)) legalCanEat.push([x - step, y + step]);
                break;
              } else if (isLegalMove(x, y, x - step, y + step)) legalCanGo.push([x - step, y + step]);
              step++;
            }
          } else if (ax === 3) {
            // Knight moves (2 and a half)
            const knightMoves = [
              [x + 2, y + 1],
              [x + 2, y - 1],
              [x - 2, y + 1],
              [x - 2, y - 1],
              [x + 1, y + 2],
              [x + 1, y - 2],
              [x - 1, y + 2],
              [x - 1, y - 2],
            ];
            for (const [r, c] of knightMoves) {
              if (inBounds(r, c)) {
                if (board[r][c] !== "") {
                  if (board[r][c][0] !== piece[0] && isLegalMove(x, y, r, c)) legalCanEat.push([r, c]);
                } else if (isLegalMove(x, y, r, c)) legalCanGo.push([r, c]);
              }
            }
          } else if (ax === 4) {
            // Determine direction: -1 for white, +1 for black
            const dir = piece[0] === "w" ? -1 : 1;
            const startRow = piece[0] === "w" ? 6 : 1;
      
            // Move forward one place
            if (inBounds(x + dir, y) && board[x + dir][y] === "" && isLegalMove(x, y, x + dir, y)) {
              legalCanGo.push([x + dir, y]);
              // Move forward two places from starting row
              if (x === startRow && board[x + 2 * dir][y] === "" && isLegalMove(x, y, x + 2 * dir, y)) {
                legalCanGo.push([x + 2 * dir, y]);
              }
            }
      
            // Eat diagonally
            if (
              inBounds(x + dir, y + 1) &&
              board[x + dir][y + 1] !== "" &&
              piece[0] !== board[x + dir][y + 1][0] &&
              isLegalMove(x, y, x + dir, y + 1)
            )
              legalCanEat.push([x + dir, y + 1]);
            if (
              inBounds(x + dir, y - 1) &&
              board[x + dir][y - 1] !== "" &&
              piece[0] !== board[x + dir][y - 1][0] &&
              isLegalMove(x, y, x + dir, y - 1)
            )
              legalCanEat.push([x + dir, y - 1]);
          } else {
            // King - canMoveInAllDirection-oneStep-butIfSafe
            const directions = [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]];
            for(const [dr, dc] of directions){
              const nx = x + dr, ny = y + dc;
              if(inBounds(nx, ny) && isLegalMove(x, y, nx, ny)){
                if(board[nx][ny] === "") legalCanGo.push([nx, ny]);
                else if(board[nx][ny][0] !== piece[0]) legalCanEat.push([nx, ny]);
              }
            }
          }
        }
      
        if (res) res.json({ success: true, tempCanEat: legalCanEat, tempCanGo: legalCanGo });
        return { tempCanGo: legalCanGo, tempCanEat: legalCanEat };
};

export {statusCheck,updateBoard,get_moves,initGame,getBoard};