const userServices = require('../services/userServices')
const {validateAuctionProduct, validateUpdateProduct} = require('../helpers/joiSchema')
const {uploadFile} = require('../util/firebase.config')
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