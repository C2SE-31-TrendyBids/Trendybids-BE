const userServices = require('../services/userServices')
class UserController {
    getCurrentUser(req, res) {
        try {
            return userServices.getCurrentUser(req.user.dataValues, res);
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new UserController;