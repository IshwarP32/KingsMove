import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import userModel from "../models/userModel.js";

const createUser = async(req,res)=>{
  try {
    const {username, email, fullName, password} = req.body;
    if(!username || !email || !fullName || !password){
      return res.json({success:false,message:"All fields are required"});
    }
    //Verify uniqueness
    if(await userModel.findOne({email})){
      return res.json({success:false, message:"User with this mail already exist !"});
    }
    if(await userModel.findOne({username})){
      return res.json({success:false, message:"username already exist, try different one !"});
    }
    //verify strong password
    if(password.length <7){
      return res.json({success:false, message:"Password length shall be greater than 6"});
    }
    //save user
    const user = new userModel({
      fullName,
      email,
      username,
      password
    });
    await user.save();
    // Remove password from user object before sending response
    const userObj = user.toObject();
    delete userObj.password;
    return res.json({user: userObj,success:true, message: "New User Registered Successfully"});
  } catch (error) {
    res.json({success:false,message:error.message});
    throw error;
  }
};

const deleteUser = async(req,res)=>{
  try {
    const userId = req.userId; //from authUser middleware
    const {password}= req.body;
    const user = await userModel.findById(userId);
    if(await user.isPasswordCorrect(password)){
      if(user.avatar !== "https://res.cloudinary.com/dmdlr07x1/image/upload/v1752224803/Sample_User_Icon_jwu9z9.png"){
        //if not default avatar then delete it
        await deleteFromCloudinary(user.avatar);
      }
      await userModel.findByIdAndDelete(userId);
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,      // true if you're using HTTPS
        sameSite: "None",  // adjust as per frontend CORS setup
      }).clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,      // true if you're using HTTPS
        sameSite: "None",  // adjust as per frontend CORS setup
      });
      return res.json({success:true, message:"User deleted successfullly"});
    }
    else{
      return res.json({success:false, message:"Incorrect Password!"});
    }
  } catch (error) {
    return res.json({success:false,message:error.message});
    // throw error;
  }
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    if(!user){
      throw new Error ("User not found for id: ${userId}");
    }
    
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    // console.log("Saved refresh token:", refreshToken);
    return {accessToken,refreshToken};
  } catch (error) {
    console.log("Error generating tokens");
    throw error;
  }
};

const loginuser = async(req,res)=>{
  try {
    const {accessfield, password} = req.body; //accessfield is username or email
    if(!accessfield || !password) res.json({success:false, message:"All fields are required"});
    const user = await userModel.findOne({
      $or: [{ email: accessfield }, { username: accessfield }]
    });
    if(!user){
      return res.json({success:false, message:"User with this mail/username not found"});
    }
    //verify password
    if(await user.isPasswordCorrect(password)){
      const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
      const options = {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 //1 day
      };
      return res.cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
        .json({success:true, message:`user: ${accessfield} logged in successfully`});
    }
    else{
      return res.json({success:false, message:"Incorrect Password for this mail/username"});
    }
  } catch (error) {
    res.json({success:false, message:error.message});
    throw error;
  }
};

const userInfo = async(req,res)=>{
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId).select("-password -_id -refreshToken -socketId");
    return res.json({success:true, message:"Info fetched successfully", content:user});
  } catch (error) {
    return res.json({success:false, message:"Failed to load info"});
  }
};

const updateUser = async(req,res)=>{
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if(!user){
      return res.json({ success: false, message: "User not found" });
    }

    const {fullName, username}=req.body;
    const image=req.file;
    // console.log(image);
        
    
    if (image) {
      if(user.avatar !== "https://res.cloudinary.com/dmdlr07x1/image/upload/v1752224803/Sample_User_Icon_jwu9z9.png"){
        //if not default avatar then delete it
        await deleteFromCloudinary(user.avatar);
      }
      const result = await uploadToCloudinary(image.path);
      user.avatar = result.secure_url;
    }
        
    if(fullName) user.fullName = fullName;
    if(username) user.username = username;
    await user.save();

    res.json({success:true,message:"User Updated Successfully"});
  } catch (error) {
    res.json({success:false, message:error.message});
  }
};

const changePassword = async(req,res)=>{
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if(!user){
      return res.json({ success: false, message: "User not found" });
    }
    const {oldPassword,newPassword}=req.body;
    if(!oldPassword || !newPassword){
      return res.json({success:false,message:"All fields are required"});
    }
    if(!await user.isPasswordCorrect(oldPassword)){
      return res.json({success:false, message:"Old Password is incorrect"});
    }
    user.password = newPassword;
    await user.save();

    res.json({success:true,message:"Password Updated Successfully"});
  } catch (error) {
    res.json({success:false, message:error.message});
  }
};

const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,      // true if you're using HTTPS
    sameSite: "None",  // adjust as per frontend CORS setup
  }).clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,      // true if you're using HTTPS
    sameSite: "None",  // adjust as per frontend CORS setup
  });

  return res.json({ success: true, message: "Logged out successfully" });
};

const saveSocketId = async (req,res) =>{
  try {
    const {socketId} = req.body;
    const userId = req.userId;
    
    const user = await userModel.findById(userId);
    if(!user) return res.json({success:false,message:"User not found"});

    user.socketId = socketId;
    user.isOnline=true;
    await user.save();

    return res.json({success:true, message:"socketId saved"});
  } catch (error) {
    console.log(error);
    return res.json({success:false, message:error.message});
  }
};
const deleteSocketId = async (req,res) =>{
  try {
    const userId = req.userId;
    await userModel.findByIdAndUpdate(userId,{socketId:""});
    return res.json({success:true, message:"socketId cleared"});
  } catch (error) {
    console.log(error);
    return res.json({success:false, message:error.message});
  }
};

const changeIsOnline = async (value,socketId)=>{
  try {
    const user = await userModel.findOne({socketId});
    if (!user) return console.log("User not found for socketId:", socketId);
    user.isOnline = value;
    await user.save();
  } catch (error) {
    console.log(error);
  }
};

export {createUser,deleteUser,loginuser,generateAccessAndRefreshToken,userInfo,updateUser,logout,changePassword,
  saveSocketId,deleteSocketId, changeIsOnline
};