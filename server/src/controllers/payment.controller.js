import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";

// Initialize payment (create payment record)
const initializePayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Order ID, amount, and payment method required" });
    }
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    
    const payment = new Payment({
      order: orderId,
      user: req.user.id,
      amount,
      paymentMethod,
      status: "pending"
    });
    await payment.save();
    
    // TODO: Integrate with Razorpay/Stripe to create payment intent
    
    res.status(201).json({
      message: "Payment initialized",
      payment: {
        _id: payment._id,
        amount,
        paymentMethod,
        status: "pending"
        // Add Razorpay order ID or Stripe payment intent ID here
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify payment (webhook from payment gateway)
const verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    
    // TODO: Verify signature with Razorpay/Stripe
    // For now, mark as success
    
    payment.status = "success";
    payment.razorpayOrderId = razorpayOrderId;
    payment.razorpayPaymentId = razorpayPaymentId;
    await payment.save();
    
    // Update order status
    await Order.findByIdAndUpdate(payment.order, { paymentStatus: "success", status: "packed" });
    
    res.json({ message: "Payment verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate("order user");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.user._id.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    
    res.json({ payment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default {
  initializePayment,
  verifyPayment,
  getPaymentDetails
};
