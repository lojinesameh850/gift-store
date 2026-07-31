const express = require("express");
const router = express.Router();
const {
	getProducts,
	getProductBySlug,
} = require("../controllers/customerProductController");

/* 
  GET /api/products
  Accepts Query Parameters: 
  - page (number)
  - limit (number)
  - category (ObjectId)
  - occasion (Comma-separated ObjectIds)
  - minPrice (number)
  - maxPrice (number)
  - search (string)
  - sort (popular, price_asc, price_desc, newest, oldest)
*/
router.get("/", getProducts);

/* 
  GET /api/products/:slug
  Get single product details by slug
*/
router.get("/:slug", getProductBySlug);

module.exports = router;
