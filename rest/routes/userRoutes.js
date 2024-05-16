const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Route POST pour créer un user
router.post("/", userController.createUser);

// Route GET pour obtenir tous les users
router.put("/:id", userController.updateUser);

// Route GET pour obtenir un user par son ID
router.patch("/:id", userController.partialUpdateUser);

module.exports = router;
