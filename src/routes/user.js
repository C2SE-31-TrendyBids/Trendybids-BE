const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, isAdmin, isCensor } = require("../middlewares/verifyToken");

router.get("/me", verifyToken, userController.getCurrentUser);

module.exports = router;