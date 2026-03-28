import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { HTTP_STATUS, PAYMENT_MESSAGES } from "../config/constants.js";

// Validate coupon code
const validateCoupon = async (req, res) => {
  try {
    const { couponCode, cartTotal } = req.body;
    if (!couponCode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Coupon code required" });
    }
    
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Invalid coupon code" });
    }
    
    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Coupon has expired" });
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Coupon usage limit exceeded" });
    }
    
    // Check minimum order amount
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        message: `Minimum order amount ${coupon.minOrderAmount} required for this coupon` 
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
    
    // Apply max discount cap
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
    
    res.json({
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: Math.round(discount * 100) / 100
      }
    });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Process payment / Create order
const processPayment = async (req, res) => {
  try {
    const { items, total, paymentMethod, paymentStatus, couponCode, addressId, estimatedDelivery } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Order items required" });
    }
    
    if (!total || !paymentMethod || !addressId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Total, payment method, and address required" });
    }
    
    // Verify user exists and get address
    const user = await User.findById(req.user.id);
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
    
    const address = user.addresses.find(a => a._id.toString() === addressId);
    if (!address) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Address not found" });
    
    // Verify all products exist and have stock
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: `Product not found: ${item.productId}` });
      
      if (product.stock < item.quantity) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      orderItems.push({
        product: item.productId,
        quantity: item.quantity
      });
      
      subtotal += product.price * item.quantity;
    }
    
    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
      } else if (coupon) {
        discount = coupon.discountValue;
      }
      if (coupon && coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    }
    
    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      subtotal,
      discount: Math.round(discount * 100) / 100,
      total,
      couponCode,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      address: {
        label: address.label,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
        fullName: user.name || 'Customer',
        phone: user.phone
      },
      estimatedDelivery: estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });
    
    await order.save();
    
    // Update coupon usage if applied
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usageCount: 1 } }
      );
    }
    
    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    // Clear user cart
    user.cart = [];
    await user.save();
    
    res.status(HTTP_STATUS.CREATED).json({
      message: "Order placed successfully",
      order: {
        id: order._id,
        items: order.items,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Initialize payment (for Razorpay/Stripe integration)
const initializePayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    if (!orderId || !amount || !paymentMethod) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Order ID, amount, and payment method required" });
    }
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: PAYMENT_MESSAGES.PAYMENT_NOT_FOUND });
    if (order.user.toString() !== req.user.id) return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Unauthorized" });
    
    const payment = new Payment({
      order: orderId,
      user: req.user.id,
      amount,
      paymentMethod,
      status: "pending"
    });
    await payment.save();
    
    res.status(HTTP_STATUS.CREATED).json({
      message: PAYMENT_MESSAGES.PAYMENT_INITIALIZED,
      payment: {
        _id: payment._id,
        amount,
        paymentMethod,
        status: "pending"
      }
    });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: PAYMENT_MESSAGES.PAYMENT_NOT_FOUND });
    
    payment.status = "success";
    await payment.save();
    
    // Update order status
    await Order.findByIdAndUpdate(payment.order, { paymentStatus: "success", status: "packed" });
    
    res.json({ message: PAYMENT_MESSAGES.PAYMENT_VERIFIED });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

export default {
  validateCoupon,
  processPayment,
  initializePayment,
  verifyPayment
};
