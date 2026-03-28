import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_CONFIG, AUTH_MESSAGES, HTTP_STATUS } from "../config/constants.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: AUTH_MESSAGES.NO_TOKEN });
    }

    const decoded = jwt.verify(token, JWT_CONFIG.SECRET);
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: AUTH_MESSAGES.INVALID_TOKEN });
  }
};

export default authMiddleware;
