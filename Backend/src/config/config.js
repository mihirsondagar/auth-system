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

if (!process.env.SALT_ROUNDS) {
  throw new Error("SALT_ROUNDS doesn't exist in environment variables");
}

if (!process.env.SMTP_USER) {
  throw new Error("SMTP_USER doesn't exist in environment variables");
}

if (!process.env.SMTP_PASS) {
  throw new Error("SMTP_PASS doesn't exist in environment variables");
}

if (!process.env.SENDER_EMAIL) {
  throw new Error("SENDER_EMAIL doesn't exist in environment variables");
}

const config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  SALT_ROUNDS: Number(process.env.SALT_ROUNDS),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
};

export default config;
