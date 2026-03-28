
import express from "express";
import cartController from "../controllers/cart.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Get user's cart
router.get('/', authMiddleware, cartController.getCart);

// Add product to cart
router.post('/add', authMiddleware, cartController.addToCart);

// Update cart item quantity
router.put('/update', authMiddleware, cartController.updateCartQuantity);

// Remove product from cart
router.delete('/remove/:productId', authMiddleware, cartController.removeFromCart);

// Clear cart
router.delete('/clear', authMiddleware, cartController.clearCart);

export default router;
