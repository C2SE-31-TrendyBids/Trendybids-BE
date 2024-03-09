const censorServices = require('../services/censorService')
class CensorController {
    approveAuctionProduct(req, res) {
        try {
            const productId = req.body.productId
            if (!productId) {
                return res.status(400).json({
                    message: '\"productId\" is required',
                });
            }
            return censorServices.approveAuctionProduct(req.user.id, productId, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new CensorController()