const authServices = require("../services/authService")
const {validateRegister, validateVerify, validateLogin} = require('../helpers/joiSchema')

class AuthController {
    async register(req, res) {
        try {
            const {error} = validateRegister.validate(req.body);
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
            const {error} = validateVerify.validate(req.body);
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
            const {error} = validateLogin.validate(req.body);
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
}

module.exports = new AuthController;