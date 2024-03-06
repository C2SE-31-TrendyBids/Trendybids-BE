const authServices = require("../services/authService")
const { validateRegister, validateVerify, validateLogin, validateForgotPassword, validateResetPassword } = require('../helpers/joiSchema')

class AuthController {
    async register(req, res) {
        try {
            const { error } = validateRegister.validate(req.body);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            return authServices.register(req.body, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async verifyOTP(req, res) {
        try {
            const { error } = validateVerify.validate(req.body);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            return authServices.verifyOTP(req.body, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async login(req, res) {
        try {
            const { error } = validateLogin.validate(req.body);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            return authServices.login(req.body, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { error } = validateForgotPassword.validate(req.body);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            return authServices.forgotPassword(req.body, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const { error } = validateResetPassword.validate(req.body);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            return authServices.resetPassword(req.body, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
    async getUserByToken(req, res) {
        try {
            const accessToken = req.headers.authorization;

            if (!accessToken) {
                return res.status(400).json({
                    message: "Access token is required",
                });
            }

            const user = await authServices.getUserByToken({ accessToken }, res);
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            return user
        } catch (error) {
            console.error("Error getting user by token:", error.message);
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new AuthController;