import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors"
import arenaRouter from "./routes/arenaRoutes.js"
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import { startCloudinary } from "./config/cloudinary.js";
import { authUser } from "./middlewares/authUser.js";


startCloudinary();
connectDB();

const app = express();
const port = process.env.PORT || 4000;

// If behind a proxy (Render, Railway, Nginx), trust it so secure cookies work
app.set("trust proxy", 1);

//Socket.io
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io"; 
import { changeIsOnline } from "./controller/userController.js";
// Allow single or comma-separated list of frontend origins via env
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  },
});

io.on('connection',(socket)=>{
  // changeIsOnline(true,socket.id);
  socket.on("disconnect", (reason) => {
    changeIsOnline(false,socket.id);
  });
})
export { io };

//middleware
// CORS at the top
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// The global CORS middleware above already handles all preflights automatically
// No need for explicit app.options() with Express 5

app.use(express.json());
app.use(cookieParser());


//Api endpoints
app.use("/api/arena",authUser,arenaRouter);
app.use("/api/user",userRouter);

app.get("/test",(req,res)=>{
    res.json({success:true});
})

server.listen(port, ()=>{console.log(`Server started at port: ${port}`);});