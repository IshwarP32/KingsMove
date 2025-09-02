// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend socket server using env var
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const socket = io(SOCKET_URL, {
  withCredentials: true,
  // Allow fallback to polling if pure websocket fails (common on some hosts / proxies)
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  reconnectionDelayMax: 4000,
  timeout: 10000,
});

export default socket;
