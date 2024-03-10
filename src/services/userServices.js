const Product = require('../models/product')
const {uploadFile, uploadMultipleFile, deleteMultipleFile} = require("../util/firebase.config");
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
                    id: item.id,
                    prdImageURL: item.url,
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

    async updateAuctionProduct(productId, userId, body, fileImages, res) {
        try {
            const product = await Product.findOne({
                where: {id: productId, ownerProductId: userId}
            })

            if (!product) {
                res.status(404).json({
                    message: "Product is not found",
                });
            }

            // Upload image into Firebase and save url in database
            if (product && fileImages.length > 0) {
                const imageURLs = await uploadMultipleFile(fileImages, 'product')
                const prdImageModels = imageURLs.map(item => {
                    return {
                        id: item.id,
                        prdImageURL: item.url,
                        productId: product.id
                    };
                });
                await prdImage.bulkCreate(prdImageModels)
            }

            await product.update({
                ...body
            })

            return res.status(200).json({
                message: "Update successfully",
            });
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteAuctionProduct(productId, userId, res) {
        try {
            const prdImages = await prdImage.findAll({
                where: {productId}
            })
            const listImageId = prdImages.map((prdImages) => prdImages.id)

            const [product, image, imgs] = await Promise.all([
                Product.destroy({
                    where: { id: productId, ownerProductId: userId },
                }),
                prdImage.destroy({
                    where: { productId },
                }),
                deleteMultipleFile(listImageId, "product")
            ])

            if (product < 0 || image < 0) {
                return res.status(400).json({
                    message: "Has error when delete product",
                });
            }

            return res.status(200).json({
                message: "Delete successfully",
            });
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = new UserServices