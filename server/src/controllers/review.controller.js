import Review from "../models/review.model.js";
import Product from "../models/product.model.js";

// Add review
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) return res.status(400).json({ message: "Product and rating required" });
    const review = new Review({
      product: productId,
      user: req.user.id,
      rating,
      comment
    });
    await review.save();
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "phone");
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default {
  addReview,
  getProductReviews
};
