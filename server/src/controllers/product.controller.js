
import Product from "../models/product.model.js";


// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Search products by name or description
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query parameter is required" });
    const regex = new RegExp(query, "i");
    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex }
      ]
    });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export default {
  getAllProducts,
  getProductById,
  searchProducts
};
