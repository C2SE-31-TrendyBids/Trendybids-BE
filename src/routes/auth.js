const express = require("express");
const router = express.Router();
const passport = require('passport');
const authController = require("../controllers/authController");
const {verifyToken} = require("../middlewares/verifyToken");

router.post("/register", authController.register);

router.post("/verify-email", authController.verifyOTP);

router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

router.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

router.get('/google/callback',
    passport.authenticate('google', { session: false }), authController.loginSuccessGoogle
);

router.post("/refresh-token", authController.refreshToken);

router.post("/logout", verifyToken, authController.logout);

module.exports = router;