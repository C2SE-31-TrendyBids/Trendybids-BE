const authServices = require("../services/auth")
const register = async (req, res) => {
    try {
        const res = await this.register()
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

const login = async (req, res) => {

};

const forgotPassword = async (req, res) => {

};

const resetPassword = async (req, res) => {

};

module.exports = {
    login,
    register,
    forgotPassword,
    resetPassword
};