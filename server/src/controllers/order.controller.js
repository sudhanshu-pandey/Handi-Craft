import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { HTTP_STATUS } from "../config/constants.js";

// Place order
const placeOrder = async (req, res) => {
  try {
    const { items, address } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Order items required" });
    }
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: `Product not found: ${item.product}` });
      total += product.price * item.quantity;
    }
    const order = new Order({
      user: req.user.id,
      items,
      total,
      address
    });
    await order.save();
    res.status(HTTP_STATUS.CREATED).json({ order });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Get all orders for user
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("items.product");
    res.json({ orders });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id }).populate("items.product");
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Order not found" });
    res.json({ order });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

export default {
  placeOrder,
  getOrders,
  getOrderDetails
};
