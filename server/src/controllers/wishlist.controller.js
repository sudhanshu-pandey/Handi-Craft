import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id }).populate("product");
    res.json({ wishlist, total: wishlist.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID required" });
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    // Check if already in wishlist
    const existing = await Wishlist.findOne({ user: req.user.id, product: productId });
    if (existing) return res.status(409).json({ message: "Product already in wishlist" });
    
    const wishlistItem = new Wishlist({ user: req.user.id, product: productId });
    await wishlistItem.save();
    
    res.status(201).json({ message: "Product added to wishlist", wishlistItem });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const deleted = await Wishlist.deleteOne({ user: req.user.id, product: productId });
    
    if (deleted.deletedCount === 0) return res.status(404).json({ message: "Wishlist item not found" });
    
    res.json({ message: "Product removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
