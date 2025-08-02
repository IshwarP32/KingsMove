import mongoose, { Schema } from "mongoose";
import { type } from "os";

const gameSchema = new mongoose.Schema({
  white: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  black: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  turn:{
    type: String,
    default: "w"
  },
  board: {
    type: [[String]],
    default: [
      [
        "bRook",
        "bKnight",
        "bBishop",
        "bQueen",
        "bKing",
        "bBishop",
        "bKnight",
        "bRook",
      ],
      ["bPawn", "bPawn", "bPawn", "bPawn", "bPawn", "bPawn", "bPawn", "bPawn"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["wPawn", "wPawn", "wPawn", "wPawn", "wPawn", "wPawn", "wPawn", "wPawn"],
      [
        "wRook",
        "wKnight",
        "wBishop",
        "wQueen",
        "wKing",
        "wBishop",
        "wKnight",
        "wRook",
      ],
    ],
  },
  winner: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 86400 seconds = 1 day
  },
});

const gameModel = mongoose.models.games || mongoose.model("games", gameSchema);
export default gameModel;
