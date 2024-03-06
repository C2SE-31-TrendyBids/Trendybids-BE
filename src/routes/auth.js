const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);

router.post("/verify-email", authController.verifyOTP);

router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

router.get("/get-user-by-token", authController.getUserByToken)

module.exports = router;