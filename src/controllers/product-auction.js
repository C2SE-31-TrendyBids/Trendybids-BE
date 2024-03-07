const productAuctionServices = require("../services/product-auction")


class ProductAuctionController {

    async  getAll(req,res){
        const response = await productAuctionServices.getAll(req.query)
        return res.status(200).json(response);
    }
}


module.exports = new ProductAuctionController()