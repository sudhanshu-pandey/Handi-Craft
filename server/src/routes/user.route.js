import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();


// Profile
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);

// Addresses
router.get("/addresses", authMiddleware, userController.listAddresses);
router.post("/addresses", authMiddleware, userController.addAddress);
router.put("/addresses/:addressId", authMiddleware, userController.updateAddress);
router.delete("/addresses/:addressId", authMiddleware, userController.deleteAddress);

export default router;