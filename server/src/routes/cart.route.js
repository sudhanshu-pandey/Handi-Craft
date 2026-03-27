
import express from "express";
import cartController from "../controllers/cart.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Add product to cart
router.post('/add', authMiddleware, cartController.addToCart);

// Get user's cart
router.get('/', authMiddleware, cartController.getCart);

// Remove product from cart
router.delete('/remove/:productId', authMiddleware, cartController.removeFromCart);

export default router;
