import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRouter);

export default app;
