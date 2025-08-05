import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "KingsMove",
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    throw error;
  }
};

export default connectDB;