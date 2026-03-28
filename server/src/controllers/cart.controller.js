
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { HTTP_STATUS } from "../config/constants.js";

// Add product to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Product ID and quantity are required.' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found.' });
    const product = await Product.findById(productId);
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found.' });
    const cartItem = user.cart.find(item => item.product.toString() === productId);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }
    await user.save();
    const populatedCart = await user.populate('cart.product');
    res.status(HTTP_STATUS.CREATED).json({ message: 'Product added to cart.', cart: populatedCart.cart });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: err.message });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found.' });
    const total = user.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    res.json({ cart: user.cart, total, itemCount: user.cart.length });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: err.message });
  }
};

// Update cart item quantity
const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Product ID and quantity are required.' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found.' });
    
    const cartItem = user.cart.find(item => item.product.toString() === productId);
    if (!cartItem) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not in cart.' });
    
    if (quantity <= 0) {
      user.cart = user.cart.filter(item => item.product.toString() !== productId);
    } else {
      cartItem.quantity = quantity;
    }
    await user.save();
    const populatedCart = await user.populate('cart.product');
    res.json({ message: 'Cart updated.', cart: populatedCart.cart });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: err.message });
  }
};

// Remove product from cart
const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found.' });
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
    await user.save();
    const populatedCart = await user.populate('cart.product');
    res.json({ message: 'Product removed from cart.', cart: populatedCart.cart });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: err.message });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found.' });
    user.cart = [];
    await user.save();
    res.json({ message: 'Cart cleared.', cart: [] });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error: err.message });
  }
};

export default {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
};
