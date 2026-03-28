import express from "express";
import paymentController from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Validate coupon code
router.post("/validate-coupon", paymentController.validateCoupon);

// Process payment / Create order
router.post("/process", authMiddleware, paymentController.processPayment);

// Initialize payment for gateway
router.post("/initialize", authMiddleware, paymentController.initializePayment);

// Verify payment
router.post("/verify", authMiddleware, paymentController.verifyPayment);

export default router;
