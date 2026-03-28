import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import { HTTP_STATUS } from "../config/constants.js";

// Add review
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Product and rating required" });
    const review = new Review({
      product: productId,
      user: req.user.id,
      rating,
      comment
    });
    await review.save();
    res.status(HTTP_STATUS.CREATED).json({ review });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "phone");
    res.json({ reviews });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

export default {
  addReview,
  getProductReviews
};
