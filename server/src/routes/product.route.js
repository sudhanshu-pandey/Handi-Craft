
import express from "express";
import productController from "../controllers/product.controller.js";
const router = express.Router();

// Get all products


// Search products
router.get('/search', productController.searchProducts);

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

export default router;
