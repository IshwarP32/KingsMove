import { ToastContainer } from "react-toastify";
import { Routes, Route } from "react-router-dom";
import Arena from "./pages/Arena";
import Navbar from "./components/Navbar";
import ArenaContextProvider from "../context/ArenaContext";
import Home from "./pages/Home";
import UserContextProvider from "../context/UserContext";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./pages/ProtectedRoutes";
import Friends from "./pages/Friends";
import Challenges from "./pages/Challenges";
import { useEffect } from "react";
import socket from "./Socket";
import axios from "axios";

function App() {
  const backendurl = import.meta.env.VITE_BACKEND_URL;
  const saveSocket = async (socketId)=>{
    try {
      const {data} = await axios.post(backendurl+"/api/user/socket/update",{socketId},{withCredentials:true});
      if(!data.success){
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    socket.on("connect", () => {
      // Save socket ID on database
      saveSocket(socket.id);
    });

    // Example listener
    socket.on("message", (data) => {
      console.log("Received message:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [saveSocket]);
  
  return (
    <div>
      <ToastContainer />
      <UserContextProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/arena" element={<ProtectedRoute><ArenaContextProvider><Arena /></ArenaContextProvider></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
        </Routes>
      </UserContextProvider>
    </div>
  );
}

export default App;
