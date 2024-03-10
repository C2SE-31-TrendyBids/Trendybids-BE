const productServices = require("../services/productService")


class ProductController {

    async getProductByQuery(req, res) {
        try {
            return await productServices.getAll(req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}


module.exports = new ProductController()