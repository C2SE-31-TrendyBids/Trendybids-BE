const authServices = require("../services/authService")
const { validateRegister, validateVerify, validateLogin, validateForgotPassword, validateResetPassword } = require('../helpers/joiSchema')

class AuthController {
    async register(req, res) {
        try {
            const { error } = validateRegister(req.body);
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
            const { error } = validateVerify(req.body);
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
            const { error } = validateLogin(req.body);
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
            const { error } = validateForgotPassword(req.body);
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
    async verifyFogotPass(req, res) {
        try {
            const { error } = validateVerify(req.body);
            console.log(req.body);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            return authServices.verifyOTPResetPass(req.body, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
    async resetPassword(req, res) {
        try {
            const { error } = validateResetPassword(req.body);
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

    async loginSuccessGoogle(req, res) {
        try {
            const { accessToken, refreshToken } = req.user
            res.redirect(`${process.env.CLIENT_URL}/login-success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async refreshToken(req, res) {
        try {
            if (!req.body.refreshToken) {
                return res.status(400).json({
                    message: '\"refreshToken\" is required',
                });
            }
            return authServices.refreshToken(req.body.refreshToken, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async logout(req, res) {
        try {
            return authServices.logout(req.user?.id, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new AuthController;