import express from "express";
import orderController from "../controllers/order.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Create new order
router.post("/", authMiddleware, orderController.createOrder);

// Get all orders for user
router.get("/", authMiddleware, orderController.getOrders);

// Get single order details
router.get("/:orderId", authMiddleware, orderController.getOrderDetails);

// Update order status (admin)
router.put("/:orderId/status", authMiddleware, orderController.updateOrderStatus);

// Cancel order
router.post("/:orderId/cancel", authMiddleware, orderController.cancelOrder);

export default router;