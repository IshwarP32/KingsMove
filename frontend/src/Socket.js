// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend socket server
const socket = io("http://localhost:4000", {
  withCredentials: true,
});

export default socket;
