const Product = require('../models/product')
const Censor = require('../models/censor')
const User = require('../models/user')
const PrdImage = require('../models/prdImage')
const Category = require('../models/category')
const {Op} = require("sequelize");
const {uploadMultipleFile, deleteMultipleFile} = require("../util/firebase.config");
const prdImage = require("../models/prdImage");

class ProductServices {

    async getAll(userId, role, {page, limit, order, productName, categoryId, priceFrom, priceTo, ...query}, res) {
        try {
            const queries = {raw: false, nest: true};
            // Ensure page and limit are converted to numbers, default to 1 if not provided or invalid
            let pageNumber = isNaN(parseInt(page)) ? 1 : parseInt(page);
            const limitNumber = isNaN(parseInt(limit)) ? 4 : parseInt(limit);

            // If pageNumber is less than 1, set it to 1
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            // Calculate the offset
            const offset = (pageNumber - 1) * limitNumber;

            queries.offset = offset;
            queries.limit = limitNumber;

            // handle config query
            if (order) queries.order = [order];
            const roleCensor = "R02"
            const productQuery = {
                ...(role?.dataValues?.id === roleCensor ? {censorId: userId} : {ownerProductId: userId}),
                ...(productName ? {productName: {[Op.substring]: productName}} : {}),
                ...(categoryId ? {categoryId: categoryId} : {}),
                ...(priceFrom !== undefined ? {startingPrice: {[Op.gte]: priceFrom}} : {}),
                ...(priceTo !== undefined ? {startingPrice: {[Op.lte]: priceTo}} : {}),
                ...query
            };

            const {count, rows} = await Product.findAndCountAll({
                    where: productQuery,
                    ...queries,
                    attributes: {exclude: ['censorId', 'createdAt', 'updatedAt', 'ownerProductId', "categoryId"]},
                    include: [
                        {
                            model: User,
                            as: 'owner',
                            required: true,
                            attributes: {exclude: ['password', 'createdAt', 'updatedAt', 'walletId', 'roleId', 'refreshToken']}
                        }, {
                            model: PrdImage,
                            as: 'prdImages',
                            attributes: {exclude: ['productId']}
                        },
                        {
                            model: Category,
                            as: 'category',
                            required: true,
                        },
                        {
                            model: Censor,
                            as: 'censor',
                            required: true,
                            attributes: {exclude: ['walletId', 'roleId', 'createdAt', 'updatedAt', 'userId']},

                        }
                    ],
                    distinct: true
                },
            );

            const totalPages = Math.ceil(count / limitNumber)
            return res.status(200).json({
                message: "Get products successfully!",
                totalItem: count,
                totalPages: totalPages,
                products: rows
            });
        } catch (err) {
            console.log(err);
            throw new Error(err)
        }
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
                    where: {id: productId, ownerProductId: userId},
                }),
                prdImage.destroy({
                    where: {productId},
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


module.exports = new ProductServices()