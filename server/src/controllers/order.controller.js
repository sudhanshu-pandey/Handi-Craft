import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { HTTP_STATUS } from "../config/constants.js";

// Create new order
const createOrder = async (req, res) => {
  try {
    const { items, total, subtotal, discount, deliveryFee, paymentMethod, paymentStatus, estimatedDelivery, address, couponCode } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Items array is required' });
    }
    
    if (!total || total <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Valid total is required' });
    }
    
    // Convert productIds to product references and quantities
    const orderItems = [];
    for (const item of items) {
      const { productId, quantity } = item;
      
      if (!productId || !quantity) {
        continue;
      }
      
      // Find product by id or _id
      let product = null;
      try {
        product = await Product.findById(productId);
      } catch (err) {
        // ObjectId parse failed, will try numeric id
      }
      
      if (!product) {
        product = await Product.findOne({ id: productId });
      }
      
      if (!product) {
        continue;
      }
      
      orderItems.push({
        product: product._id,
        quantity
      });
    }
    
    if (orderItems.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'No valid items in order' });
    }
    
    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      total,
      subtotal: subtotal || total,
      discount: discount || 0,
      deliveryFee: deliveryFee || 0,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentStatus || 'pending',
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      address: address || {},
      couponCode: couponCode || null,
      status: 'ordered'
    });
    
    await order.save();
    
    // Populate product details before returning
    await order.populate('items.product', 'name price image');
    
    res.status(HTTP_STATUS.CREATED).json({ 
      message: 'Order created successfully',
      order
    });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to create order',
      error: err.message 
    });
  }
};

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
      { returnDocument: 'after' }
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
  createOrder,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder
};
