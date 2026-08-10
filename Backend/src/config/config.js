import dotenv from "dotenv";

dotenv.config();

if (!process.env.PORT) {
  throw new Error("PORT doesn't exist in environment variables");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI doesn't exist in environment variables");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET doesn't exist in environment variables");
}

const config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default config;
