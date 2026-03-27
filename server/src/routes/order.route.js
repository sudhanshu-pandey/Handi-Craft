import express from "express";
import orderController from "../controllers/order.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", authMiddleware, orderController.placeOrder);
router.get("/", authMiddleware, orderController.getOrders);
router.get("/:id", authMiddleware, orderController.getOrderDetails);

export default router;