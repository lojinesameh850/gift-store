const express = require("express");
const router = express.Router();
const {
	getAllProducts,
	getProductBySlug,
} = require("../controllers/customerProductController");

/* 
  GET /api/products
  Accepts Query Parameters: 
  - page (number)
  - limit (number)
  - category (ObjectId)
  - tags (Comma-separated ObjectIds)
  - minPrice (number)
  - maxPrice (number)
  - search (string)
  - sort (lowest-price, highest-price, newest, oldest)
*/
router.get("/", getAllProducts);

/* 
  GET /api/products/:slug
  Get single product details by slug
*/
router.get("/:slug", getProductBySlug);

module.exports = router;
