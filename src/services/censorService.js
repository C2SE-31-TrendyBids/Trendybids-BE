const { uploadFile, uploadMultipleFile } = require("../util/firebase.config");
const { Op } = require("sequelize");
const Censor = require("../models/censor");
const ProductAuction = require("../models/productAuction");
const Product = require('../models/product')
const MemberOrganization = require('../models/memberOrganization')
const User = require("../models/user");
const PrdImage = require("../models/prdImage");
const Category = require("../models/category");

class CensorService {
    async register({
        name,
        phoneNumber,
        founding,
        address,
        companyTaxCode,
        taxCodeIssuanceDate,
        position,
        placeTaxCode
    }, avatar, res) {
        try {
            const uploadAvatar = await uploadFile(avatar, 'avatar')
            const avatarUrl = uploadAvatar.url
            const [censor, created] = await Censor.findOrCreate({
                where: { phoneNumber },
                defaults: {
                    name,
                    phoneNumber,
                    founding,
                    address,
                    avatarUrl,
                    companyTaxCode,
                    taxCodeIssuanceDate,
                    position,
                    placeTaxCode
                }
            })
            const status = created ? 201 : 409;
            return res.status(status).json({
                message: created ? "Submitted registration request successfully" : "Phone number has already registered",
                censor: censor.toJSON()
            });
        } catch (error) {
            throw new Error(error)
        }
    }

    async getCensors({ page, limit, order, censorName, ...query }, res) {
        try {
            const queries = { raw: false, nest: true };
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

            const censorQuery = {
                ...(censorName ? { productName: { [Op.substring]: censorName } } : {}),
                ...query
            };

            const response = await Censor.findAll({
                where: censorQuery,
                ...queries,
                attributes: { exclude: ['walletId', 'roleId', 'createdAt', 'updatedAt', 'userId'] },
                include: [
                    {
                        model: ProductAuction,
                        as: "productAuctions",
                        attributes: { exclude: ['productId', 'censorId'] },
                    }
                ]
            },
            );

            const totalPages = Math.ceil(response.length / limitNumber)
            return res.status(200).json({
                message: "Get products successfully!",
                totalItem: response.length,
                totalPages: totalPages,
                censors: response
            });
        } catch (err) {
            console.log(err);
            throw new Error(err)
        }


    }

    async getAuction({ page, limit, order, description, categoryId, priceFrom, priceTo, ...query }, res) {
        try {
            const queries = { raw: false, nest: true };
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
            // Commented out description query as it's not used
            if (description) query.description = { [Op.substring]: description };

            // Commented out categoryId query as it's already handled in productQuery
            if (categoryId) {
                query['$product.category.id$'] = categoryId;
            }

            const productQuery = {
                ...(priceFrom !== undefined ? { startingPrice: { [Op.gte]: priceFrom } } : {}),
                ...(priceTo !== undefined ? { startingPrice: { [Op.lte]: priceTo } } : {})
            };

            const { count, rows } = await ProductAuction.findAndCountAll({
                where: query,
                ...queries,
                attributes: { exclude: ['productId', 'censorId'] },
                include: [
                    {
                        model: Product,
                        as: 'product',
                        required: true,
                        where: productQuery,
                        attributes: { exclude: ['censorId', 'createdAt', 'updatedAt', 'ownerProductId', "categoryId"] },
                        include: [
                            {
                                model: User,
                                as: 'owner',
                                required: true,
                                attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'walletId', 'roleId', 'refreshToken'] }
                            }, {
                                model: PrdImage,
                                as: 'prdImages',
                                attributes: { exclude: ['productId'] }
                            },
                            {
                                model: Category,
                                as: 'category',
                                required: true,
                            }
                        ],
                    },
                    {
                        model: Censor,
                        as: 'censor',
                        required: true,
                        attributes: { exclude: ['walletId', 'roleId', 'createdAt', 'updatedAt', 'userId'] },

                    }
                ],
                distinct: true
            });

            const totalPages = Math.ceil(count / limitNumber)
            return res.status(200).json({
                message: "Get product auction successfully!",
                totalItem: count,
                totalPages: totalPages,
                productAuctions: rows
            });
        } catch (err) {
            console.log(err);
            throw new Error(err)
        }


    }

    async approveAuctionProduct(userId, productId, res) {
        try {

            const product = await Product.findOne({
                where: { id: productId }
            })
            if (!product) {
                return res.status(404).json({
                    message: "Product is not found"
                })
            } else if (product.status === "Verified") {
                return res.status(400).json({ message: "Product is Verified" });
            }

            // Check whether the user belongs to the specified organization
            const memberCensor = await MemberOrganization.findOne({
                where: { userId }
            })
            if (!memberCensor || (product.censorId !== memberCensor.censorId)) {
                return res.status(400).json({ message: "The user does not belong to the specified organization" });
            }

            // Update status of Product
            product.status = "Verified"
            await product.save()

            return res.status(200).json({
                message: "Approve auction product successfully"
            })
        } catch (error) {
            throw new Error(error)
        }
    }

}

module.exports = new CensorService()
