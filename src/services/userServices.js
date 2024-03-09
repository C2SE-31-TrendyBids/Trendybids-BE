const Product = require('../models/product')
const {uploadFile, uploadMultipleFile} = require("../util/firebase.config");
const prdImage = require('../models/prdImage')
class UserServices {
    getCurrentUser(user, res) {
        return res.status(200).json({
            ...user
        })
    }

    async postAuctionProduct(userId, body, fileImages, res) {
        try {
            const [product, imageURLs] = await Promise.all([
                Product.create({
                    ...body,
                    ownerProductId: userId
                }),
                uploadMultipleFile(fileImages, 'product')
            ])

            // Save image url into database
            const prdImageModels = imageURLs.map(item => {
                return {
                    prdImageURL: item,
                    productId: product.id
                };
            });
            const image = await prdImage.bulkCreate(prdImageModels)

            return res.status(200).json({
                message: "Post product successfully",
            });

        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = new UserServices