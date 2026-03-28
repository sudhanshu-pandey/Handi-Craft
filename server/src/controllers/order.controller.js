import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { HTTP_STATUS } from "../config/constants.js";

// Get all orders for user
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });
    res.json({ orders, total: orders.length });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Get single order details
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id })
      .populate("items.product");
    
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Order not found" });
    
    res.json({ order });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Status is required" });
    
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate("items.product");
    
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Order not found" });
    
    res.json({ order });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id });
    
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Order not found" });
    
    // Can only cancel if order is in ordered or packed status
    if (!['ordered', 'packed'].includes(order.status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Order cannot be cancelled at this stage" });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

export default {
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder
};
