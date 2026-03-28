import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import { HTTP_STATUS, PAYMENT_MESSAGES } from "../config/constants.js";

// Initialize payment (create payment record)
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
    
    // TODO: Integrate with Razorpay/Stripe to create payment intent
    
    res.status(HTTP_STATUS.CREATED).json({
      message: PAYMENT_MESSAGES.PAYMENT_INITIALIZED,
      payment: {
        _id: payment._id,
        amount,
        paymentMethod,
        status: "pending"
        // Add Razorpay order ID or Stripe payment intent ID here
      }
    });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Verify payment (webhook from payment gateway)
const verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: PAYMENT_MESSAGES.PAYMENT_NOT_FOUND });
    
    // TODO: Verify signature with Razorpay/Stripe
    // For now, mark as success
    
    payment.status = "success";
    payment.razorpayOrderId = razorpayOrderId;
    payment.razorpayPaymentId = razorpayPaymentId;
    await payment.save();
    
    // Update order status
    await Order.findByIdAndUpdate(payment.order, { paymentStatus: "success", status: "packed" });
    
    res.json({ message: PAYMENT_MESSAGES.PAYMENT_VERIFIED });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate("order user");
    if (!payment) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: PAYMENT_MESSAGES.PAYMENT_NOT_FOUND });
    if (payment.user._id.toString() !== req.user.id) return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Unauthorized" });
    
    res.json({ payment });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

export default {
  initializePayment,
  verifyPayment,
  getPaymentDetails
};
