import express from "express";
import reviewController from "../controllers/review.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Add review
router.post("/", authMiddleware, reviewController.addReview);
// Get reviews for a product
router.get("/:productId", reviewController.getProductReviews);

export default router;
