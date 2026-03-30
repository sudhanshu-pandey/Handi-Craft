import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import CartItem from "../models/cartitem.model.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await CartItem.deleteMany({});
    console.log("✓ Cleared existing data");

    // Create sample products
    const products = [
      {
        id: 1,
        name: "Handcrafted Brass Idol",
        description: "Beautiful brass idol crafted by artisans. Perfect for home decoration.",
        price: 2499,
        originalPrice: 3499,
        category: "Idols & Figurines",
        image: "/images/products/brass-idol.svg",
        rating: 4.5,
        reviewCount: 24,
        stock: 50,
        artisanInfo: {
          name: "Mohan Sharma",
          region: "Rajasthan",
          craftType: "Brass Work"
        },
        tags: ["handmade", "brass", "decorative"]
      },
      {
        id: 2,
        name: "Wooden Storage Box",
        description: "Intricately designed wooden storage box with traditional patterns.",
        price: 1899,
        originalPrice: 2799,
        category: "Storage & Boxes",
        image: "/images/products/wooden-box.svg",
        rating: 4.3,
        reviewCount: 18,
        stock: 45,
        artisanInfo: {
          name: "Ram Prasad",
          region: "Odisha",
          craftType: "Wood Carving"
        },
        tags: ["handmade", "wooden", "storage"]
      },
      {
        id: 3,
        name: "Ceramic Decorative Lamp",
        description: "Hand-painted ceramic lamp with intricate details. Traditional design.",
        price: 3299,
        originalPrice: 4899,
        category: "Lighting",
        image: "/images/products/lamp.svg",
        rating: 4.7,
        reviewCount: 32,
        stock: 35,
        artisanInfo: {
          name: "Priya Desai",
          region: "Gujarat",
          craftType: "Ceramic Art"
        },
        tags: ["handmade", "ceramic", "lighting"]
      },
      {
        id: 4,
        name: "Marble Art Piece",
        description: "Fine marble sculpture with detailed artistic work. Statement piece.",
        price: 5999,
        originalPrice: 7999,
        category: "Sculptures",
        image: "/images/products/marble-art.svg",
        rating: 4.8,
        reviewCount: 15,
        stock: 20,
        artisanInfo: {
          name: "Vikram Singh",
          region: "Rajasthan",
          craftType: "Stone Sculpture"
        },
        tags: ["marble", "sculpture", "art"]
      },
      {
        id: 5,
        name: "Hand-Woven Textile",
        description: "Traditional hand-woven textile with intricate patterns. Wall hanging.",
        price: 2199,
        originalPrice: 3299,
        category: "Textiles",
        image: "/images/products/textile.svg",
        rating: 4.4,
        reviewCount: 21,
        stock: 40,
        artisanInfo: {
          name: "Savitri Devi",
          region: "Madhya Pradesh",
          craftType: "Weaving"
        },
        tags: ["handmade", "textile", "traditional"]
      },
      {
        id: 6,
        name: "Embroidered Cushion Cover",
        description: "Beautiful embroidered cushion cover with traditional designs.",
        price: 899,
        originalPrice: 1299,
        category: "Textiles",
        image: "/images/products/cushion.svg",
        rating: 4.6,
        reviewCount: 45,
        stock: 60,
        artisanInfo: {
          name: "Meera Patel",
          region: "West Bengal",
          craftType: "Embroidery"
        },
        tags: ["embroidered", "textile", "home decor"]
      },
      {
        id: 7,
        name: "Terracotta Vase",
        description: "Hand-molded terracotta vase with rustic appeal. Perfect for flowers.",
        price: 1299,
        originalPrice: 1899,
        category: "Pottery",
        image: "/images/products/vase.svg",
        rating: 4.2,
        reviewCount: 28,
        stock: 55,
        artisanInfo: {
          name: "Arjun Kumar",
          region: "Karnataka",
          craftType: "Pottery"
        },
        tags: ["terracotta", "pottery", "handmade"]
      },
      {
        id: 8,
        name: "Brass Wall Hanging",
        description: "Intricate brass wall hanging with traditional motifs.",
        price: 1699,
        originalPrice: 2499,
        category: "Wall Decor",
        image: "/images/products/wall-hanging.svg",
        rating: 4.5,
        reviewCount: 19,
        stock: 35,
        artisanInfo: {
          name: "Rajesh Nair",
          region: "Goa",
          craftType: "Brass Work"
        },
        tags: ["brass", "wall decor", "handmade"]
      }
    ];

    await Product.insertMany(products);
    console.log(`✓ Created ${products.length} products`);

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
