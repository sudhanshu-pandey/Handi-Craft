import express from "express";
import paymentController from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Initialize payment
router.post("/initialize", authMiddleware, paymentController.initializePayment);

// Verify payment
router.post("/verify", paymentController.verifyPayment);

// Get payment details
router.get("/:paymentId", authMiddleware, paymentController.getPaymentDetails);

export default router;
