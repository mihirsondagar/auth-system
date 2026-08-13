import nodemailer from "nodemailer";
import config from "./config.js";

const transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export default transpoter;
