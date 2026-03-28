
import Product from "../models/product.model.js";

// Get all products (with pagination & sorting)
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order === 'desc' ? -1 : 1;
    
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments();
    
    const products = await Product.find()
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit);
    
    res.json({ 
      products, 
      total, 
      page, 
      pages: Math.ceil(total / limit),
      limit 
    });
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
    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const total = await Product.countDocuments({ category });
    const products = await Product.find({ category })
      .skip(skip)
      .limit(limit);
    
    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Filter products (advanced)
const filterProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, rating, inStock, sortBy, order } = req.body;
    
    let query = {};
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }
    if (rating) query.rating = { $gte: rating };
    if (inStock !== undefined) query.stock = { $gt: inStock ? 0 : undefined };
    
    const sort = sortBy || 'createdAt';
    const sortOrder = order === 'desc' ? -1 : 1;
    
    const products = await Product.find(query).sort({ [sort]: sortOrder });
    
    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create product (admin only)
const createProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, category, description, image, stock } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    
    const product = new Product({
      name,
      price,
      originalPrice,
      category,
      description,
      image,
      stock: stock || 0
    });
    await product.save();
    
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete product (admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export default {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  filterProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
