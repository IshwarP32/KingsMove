import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import arenaRouter from "./routes/arenaRoutes.js";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import { startCloudinary } from "./config/cloudinary.js";
import { authUser } from "./middlewares/authUser.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { requestLogger } from "./middlewares/logger.js";
import { validateEnvironment } from "./config/env.js";
import { generalLimiter, apiLimiter } from "./middlewares/rateLimiter.js";

// Validate environment variables before starting
validateEnvironment();


startCloudinary();
connectDB();

const app = express();
const port = process.env.PORT || 4000;

//Socket.io
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io"; 
import { changeIsOnline } from "./controller/userController.js";
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,               // if using cookies/auth
  },
});

io.on("connection",(socket)=>{
  // changeIsOnline(true,socket.id);
  socket.on("disconnect", (reason) => {
    changeIsOnline(false,socket.id);
  });
});
export { io };

//middleware
app.use(requestLogger);
app.use(generalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(cors({
  origin: "http://localhost:5173",  // <-- use your frontend URL exactly
  credentials: true,                // <-- allow cookies to be sent
}));
app.use(cookieParser());

//Api endpoints
app.use("/api/arena", apiLimiter, authUser, arenaRouter);
app.use("/api/user", apiLimiter, userRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/test",(req,res)=>{
  res.json({success:true});
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

server.listen(port, ()=>{console.log(`Server started at port: ${port}`);});