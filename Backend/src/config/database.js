import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  const mongoURI = config.MONGO_URI;

  try {
    await mongoose.connect(mongoURI);
    console.log("Successfully connected to DB:)");
  } catch (err) {
    throw new Error("Failed to connect with DB:(");
  }
}

export default connectDB;
