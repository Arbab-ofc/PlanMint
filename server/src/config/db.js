import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGO_URI (or MONGODB_URI) is not set in environment");
  }

  try {
    await mongoose.connect(uri);

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  process.on("SIGINT", async () => {
    try {
      await mongoose.disconnect();
      console.log("MongoDB disconnected through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Error during MongoDB disconnect:", err);
      process.exit(1);
    }
  });

  return mongoose.connection;
}

export default connectDB;