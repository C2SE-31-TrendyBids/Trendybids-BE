const express = require("express");
const router = express.Router();
const passport = require('passport');
const authController = require("../controllers/authController");

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
    passport.authenticate('google', { session: false }),
    (req, res) => {
        res.redirect(`${process.env.CLIENT_URL}/login-success/${req.user?.id}`);
    }
);

router.post("/google/login-success", authController.loginSuccessGoogle);


module.exports = router;