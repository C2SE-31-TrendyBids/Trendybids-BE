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

    async postAuctionProduct(req, res) {
        try {
            const {error} = validateAuctionProduct(req.body)
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            if (req.files.length <= 0) {
                return res.status(400).json({
                    message: '\"prdImageURL\" is required',
                });
            }
            return userServices.postAuctionProduct(req?.user?.id, req.body, req.files, res);
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async updateAuctionProduct(req, res) {
        try {
            const productId = req.params.productId
            const {error} = validateUpdateProduct(req.body)
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            if (!productId) {
                return res.status(400).json({
                    message: '\"productId\" is required',
                });
            }
            return userServices.updateAuctionProduct(productId, req?.user?.id, req.body, req.files, res);
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async deleteAuctionProduct(req, res) {
        try {
            const productId = req.params.productId
            if (!productId) {
                return res.status(400).json({
                    message: '\"productId\" is required',
                });
            }
            return userServices.deleteAuctionProduct(productId, req?.user?.id, res);
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new UserController;