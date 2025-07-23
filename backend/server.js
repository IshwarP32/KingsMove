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

app.listen(port, ()=>{console.log(`Server started at port: ${port}`);});