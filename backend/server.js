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

io.on('connection',(socket)=>{
  // changeIsOnline(true,socket.id);
  socket.on("disconnect", (reason) => {
    changeIsOnline(false,socket.id);
  });
})
export { io };

//middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',  // <-- use your frontend URL exactly
  credentials: true,                // <-- allow cookies to be sent
}));
app.use(cookieParser());

//Api endpoints
app.use("/api/arena",authUser,arenaRouter);
app.use("/api/user",userRouter);

app.get("/test",(req,res)=>{
    res.json({success:true});
})

server.listen(port, ()=>{console.log(`Server started at port: ${port}`);});