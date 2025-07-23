import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Routes, Route } from "react-router-dom";
import Arena from "./pages/Arena";
import Navbar from "./components/Navbar";
import ArenaContextProvider from "../context/ArenaContext";
import Home from "./pages/Home";
import UserContextProvider from "../context/userContext";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./pages/ProtectedRoutes";
import Friends from "./pages/Friends";
import Challenges from "./pages/Challenges";
function App() {
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
