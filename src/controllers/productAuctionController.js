const productAuctionServices = require("../services/productAuctionService")


class ProductAuctionController {

    async getAll(req, res) {
        try {
            return await productAuctionServices.getAll(req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}


module.exports = new ProductAuctionController()