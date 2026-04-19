import Category from "../models/category.model.js";
import { HTTP_STATUS } from "../config/constants.js";

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ createdAt: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, active: true });
    
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Category not found" });
    }
    
    res.json({ category });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Create category (admin only)
const createCategory = async (req, res) => {
  try {
    const { name, slug, image, description } = req.body;
    
    // Validate required fields
    if (!name || !slug || !image) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Name, slug, and image are required" });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existingCategory) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Category with this name or slug already exists" });
    }
    
    const category = new Category({ name, slug: slug.toLowerCase(), image, description });
    await category.save();
    
    res.status(HTTP_STATUS.CREATED).json({ message: "Category created successfully", category });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Update category (admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, image, description, active } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug: slug?.toLowerCase(), image, description, active, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Category not found" });
    }
    
    res.json({ message: "Category updated successfully", category });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

// Delete category (admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Category not found" });
    }
    
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: err.message });
  }
};

export default {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
