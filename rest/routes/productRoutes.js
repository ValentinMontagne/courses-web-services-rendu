const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Route POST pour créer un produit
router.post("/", productController.createProduct);

// Route GET pour obtenir tous les produits
router.get("/", productController.getAllProducts);

// Route GET pour obtenir un produit par son ID
router.get("/:id", productController.getProductById);

// Route DELETE pour supprimer un produit par son ID
router.delete("/:id", productController.deleteProductById);

module.exports = router;