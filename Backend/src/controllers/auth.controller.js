import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import userModel from "../models/user.model.js";
import config from "../config/config.js";
import tokenModel from "../models/tokn.model.js";
import transporter from "../config/nodemailer.js";

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, config.SALT_ROUNDS);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    await tokenModel.create({
      userId: user._id,
      tokenHash: await bcrypt.hash(refreshToken, config.SALT_ROUNDS),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const info = await transporter.sendMail({
      from: config.SENDER_EMAIL,
      to: email,
      subject: "Welcome!",
      text: `Welcome ${name}, You are successfully registered.`,
    });

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    await tokenModel.create({
      userId: user._id,
      tokenHash: await bcrypt.hash(refreshToken, config.SALT_ROUNDS),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

      const tokens = await tokenModel.find({ userId: decoded.id });

      let matchedToken = null;

      for (const token of tokens) {
        const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);

        if (isMatch) {
          matchedToken = token;
          break;
        }
      }

      if (!matchedToken) {
        return res.status(400).json({
          success: false,
          message: "Failed to log out",
        });
      }

      await tokenModel.findByIdAndDelete(matchedToken._id);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function sendVerifyOtp(req, res) {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.status(400).json({
        status: false,
        message: "Account already verified",
      });
    }

    const otp = String(100000 + Math.floor() * 900000);

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const info = await transporter.sendMail({
      from: config.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP to verify the account is ${otp}`,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Otp or User not found",
      });
    }

    const user = await userModel.findById(userId);

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Otp is expired",
      });
    }

    if ((user.verifyOtp = "" || user.verifyOtp !== otp)) {
      return res.status(400).json({
        success: false,
        message: "Otp doesn't match",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.status(400).json({
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}
