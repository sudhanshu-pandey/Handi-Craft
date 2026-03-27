import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOTP.js";
import { sendSMSOtp, sendWhatsAppOtp } from "../utils/sendOTP.js";

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendSMSOtp(phone, otp);
    await sendWhatsAppOtp(phone, otp);

    console.log("OTP:", otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({
      refreshTokens: refreshToken,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );

    await user.save();

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
