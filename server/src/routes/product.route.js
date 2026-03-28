
import express from "express";
import productController from "../controllers/product.controller.js";
const router = express.Router();

// Search products
router.get('/search', productController.searchProducts);

// Filter products
router.post('/filter', productController.filterProducts);

// Get products by category
router.get('/category/:category', productController.getProductsByCategory);

// Get all products
router.get('/', productController.getAllProducts);

// Create product (admin only)
router.post('/', productController.createProduct);

// Get product by ID
router.get('/:id', productController.getProductById);

// Update product (admin only)
router.put('/:id', productController.updateProduct);

// Delete product (admin only)
router.delete('/:id', productController.deleteProduct);

export default router;
