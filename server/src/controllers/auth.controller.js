import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOTP.js";
import { sendSMSOtp, sendWhatsAppOtp } from "../utils/sendOTP.js";
import { JWT_CONFIG, AUTH_MESSAGES, HTTP_STATUS, OTP_CONFIG } from "../config/constants.js";

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, phone: user.phone }, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, JWT_CONFIG.REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
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
    user.otpExpires = Date.now() + OTP_CONFIG.EXPIRY_TIME;

    await user.save();

    await sendSMSOtp(phone, otp);
    await sendWhatsAppOtp(phone, otp);

    console.log("OTP:", otp);

    res.json({ message: AUTH_MESSAGES.OTP_SENT });
  } catch (error) {
    console.log(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: AUTH_MESSAGES.USER_NOT_FOUND });
    }

    if (user.otp !== otp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: AUTH_MESSAGES.INVALID_OTP });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: AUTH_MESSAGES.OTP_EXPIRED });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({
      refreshTokens: refreshToken,
    });

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: AUTH_MESSAGES.INVALID_TOKEN });
    }

    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );

    await user.save();

    res.json({ message: AUTH_MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
