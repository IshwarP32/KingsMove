import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // do indexing of this field so that it is easy to find
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dmdlr07x1/image/upload/v1752224803/Sample_User_Icon_jwu9z9.png"
    },
    refreshToken: {
        type: String
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    socketId: {
        type: String
    },
    statistics: {
        type: [Number], //[gamesWon, gamesLost, gamesDraw]
        default: [0, 0, 0]
    }
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10); //password is hashed 10 times
    }
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    // console.log("Verifying password");
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function (){
    return jwt.sign({
        _id: this._id,
        email : this.email,
        username : this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function (){
    return jwt.sign({
        _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const userModel = mongoose.model.users || mongoose.model("users", userSchema);
export default userModel;
