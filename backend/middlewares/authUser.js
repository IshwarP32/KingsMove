import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { generateAccessAndRefreshToken } from "../controller/userController.js";

const authUser = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken) throw new Error("No access token");

    try {
      const decodedAToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await userModel.findById(decodedAToken._id).select("-password -refreshToken");
      if (!user) return res.json({ success: false, message: "User does not exist" });
      req.userId = user._id;
      return next();
    } catch (err) {
      // Only handle expiration errors here
      if (err.name !== "TokenExpiredError") {
        return res.json({ success: false, message: "Invalid token" });
      }
    }

    // Try refreshing token
    if (!refreshToken) return res.json({ success: false, message: "No Refresh Token" });
    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: "Session expired, Login Again" });
    }


    const user = await userModel.findOne({ refreshToken });
    if (!user) return res.json({ success: false, message: "Invalid refresh token" });

    req.userId = user._id;

  // Correctly destructure both returned tokens
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.COOKIE_SAMESITE || "None",
      maxAge: 24 * 60 * 60 * 1000, // 1 day - same as login
      // Don't set domain for cross-site cookies between different Render services
      // domain: process.env.COOKIE_DOMAIN,
      path: "/",
    };

    res.cookie("accessToken", newAccessToken, options);
    res.cookie("refreshToken", newRefreshToken, options);

    return next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export { authUser };
