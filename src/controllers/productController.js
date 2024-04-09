const productServices = require("../services/productService")
const { validateAuctionProduct, validateUpdateProduct } = require("../helpers/joiSchema");


class ProductController {
    async getProductByQuery(req, res) {
        try {

            return await productServices.getAll(req?.user?.id, req?.user?.role, req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async postAuctionProduct(req, res) {
        try {
            const { error } = validateAuctionProduct(req.body)
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            if (req.files.length <= 0) {
                return res.status(400).json({
                    message: '\"prdImageURL\" is required',
                });
            }
            return productServices.postAuctionProduct(req?.user?.id, req.body, req.files, res);
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
    async deleteImage (req, res){
        const { imageId } = req.params;
        if(!imageId)  { 
            return res.status(400).json({
            message: '\"imageId\" is required',
        })}

        try {
           return await productServices.deleteImageProduct(imageId, res);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    };
    async updateAuctionProduct(req, res) {
        try {
            const productId = req.params.productId
            const { error } = validateUpdateProduct(req.body)
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            if (!productId) {
                return res.status(400).json({
                    message: '\"productId\" is required',
                });
            }
            return productServices.updateAuctionProduct(productId, req?.user?.id, req.body, req.files, res);
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
            return productServices.deleteAuctionProduct(productId, req?.user?.id, res);
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}


module.exports = new ProductController()