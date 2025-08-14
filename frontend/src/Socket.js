// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend socket server using env var
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
