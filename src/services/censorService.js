const { uploadFile, uploadMultipleFile } = require("../util/firebase.config");
const { Op } = require("sequelize");
const Censor = require("../models/censor");
const ProductAuction = require("../models/productAuction");
const Product = require('../models/product')
const MemberOrganization = require('../models/memberOrganization')
const User = require("../models/user");
const PrdImage = require("../models/prdImage");
const Category = require("../models/category");
const Wallet = require("../models/wallet");
const moment = require('moment');

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


    async getCensors({ page, limit, order, ...query }, res) {
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
            // order of product
            const censorQuery = {
                ...query
            };

            const { count, rows } = await Censor.findAndCountAll({
                where: censorQuery,
                ...queries,
                attributes: { exclude: ['walletId', 'roleId', 'createdAt', 'updatedAt', 'userId'] },
                distinct: true,
            })

            const totalPages = Math.ceil(count / limitNumber)
            return res.status(200).json({
                message: "Get products successfully!",
                totalItem: count,
                totalPages: totalPages,
                censors: rows
            });
        } catch (err) {
            console.log(err);
            throw new Error(err)
        }
    }


    async getAuctions({ page, limit, order, productName, orderProduct, categoryId, priceFrom, priceTo, ...query }, res) {
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
            // Order product by startingPrice if specified
            const queriesProduct = { raw: false, nest: true }
            if (orderProduct === 'price_ASC') {
                queries.order = [[{ model: Product, as: 'product' }, 'startingPrice', 'ASC']];
            } else if (orderProduct === 'price_DESC') {
                queries.order = [[{ model: Product, as: 'product' }, 'startingPrice', 'DESC']];
            }
            // Add a sort condition by product name if specified
            if (orderProduct === 'productName_ASC') {
                queries.order = [[{ model: Product, as: 'product' }, 'productName', 'ASC']];
            } else if (orderProduct === 'productName_DESC') {
                queries.order = [[{ model: Product, as: 'product' }, 'productName', 'DESC']];
            }
            // Commented out categoryId query as it's already handled in productQuery
            if (categoryId) {
                query['$product.category.id$'] = categoryId;
            }
            const productQuery = {
                ...(productName !== undefined ? { productName: { [Op.substring]: productName } } : {}),
                ...(priceFrom !== undefined ? { startingPrice: { [Op.gte]: priceFrom } } : {}),
                ...(priceTo !== undefined ? { startingPrice: { [Op.lte]: priceTo } } : {}),
            };

            const { count, rows } = await ProductAuction.findAndCountAll({
                where: query,
                ...queries,
                attributes: { exclude: ['productId', 'censorId'] },
                subQuery: false,
                include: [
                    {
                        model: Product,
                        as: 'product',
                        required: true,
                        where: productQuery,
                        attributes: { exclude: ['censorId', 'updatedAt', 'ownerProductId', "categoryId"] },
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

    async getAuctionsByToken( userId,{ page, limit, order, productName, orderProduct, categoryId, priceFrom, priceTo, ...query }, res) {
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
            // Order product by startingPrice if specified
            const queriesProduct = { raw: false, nest: true }
            if (orderProduct === 'price_ASC') {
                queries.order = [[{ model: Product, as: 'product' }, 'startingPrice', 'ASC']];
            } else if (orderProduct === 'price_DESC') {
                queries.order = [[{ model: Product, as: 'product' }, 'startingPrice', 'DESC']];
            }
            // Add a sort condition by product name if specified
            if (orderProduct === 'productName_ASC') {
                queries.order = [[{ model: Product, as: 'product' }, 'productName', 'ASC']];
            } else if (orderProduct === 'productName_DESC') {
                queries.order = [[{ model: Product, as: 'product' }, 'productName', 'DESC']];
            }
            // Commented out categoryId query as it's already handled in productQuery
            if (categoryId) {
                query['$product.category.id$'] = categoryId;
            }

            const censorId = await this.getCensorIdByUserId(userId)

            if (censorId) {
                query.censorId = censorId;
            }

            const productQuery = {
                ...(productName !== undefined ? { productName: { [Op.substring]: productName } } : {}),
                ...(priceFrom !== undefined ? { startingPrice: { [Op.gte]: priceFrom } } : {}),
                ...(priceTo !== undefined ? { startingPrice: { [Op.lte]: priceTo } } : {}),
            };

            const { count, rows } = await ProductAuction.findAndCountAll({
                where: query,
                ...queries,
                attributes: { exclude: ['productId', 'censorId'] },
                subQuery: false,
                include: [
                    {
                        model: Product,
                        as: 'product',
                        required: true,
                        where: productQuery,
                        attributes: { exclude: ['censorId', 'updatedAt', 'ownerProductId', "categoryId"] },
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
                    }
                ],
                distinct: true
            });

            const totalPages = Math.ceil(count / limitNumber)
            return res.status(200).json({
                message: "Get my product auctions successfully!",
                totalItem: count,
                totalPages: totalPages,
                productAuctions: rows
            });
        } catch (err) {
            console.log(err);
            throw new Error(err)
        }
    }

    async getCurrentCensor(userId, { page, limit, order, ...query }, res) {
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
            // query of product
            const queryCensor = {
                userId,
                ...query
            };
            const response = await Censor.findAll({
                where: queryCensor,
                ...queries,
                attributes: { exclude: ['roleId', 'createdAt', 'updatedAt', "userId", "walletId"] },
                include: [
                    {
                        model: Wallet,
                        as: 'wallet',
                        required: true,
                    }
                ],
            });

            return res.status(200).json({
                message: "Get current censor successfully!",
                censors: response
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
    async rejecteAuctionProduct(userId, productId, res) {
        try {

            const product = await Product.findOne({
                where: { id: productId }
            })
            if (!product) {
                return res.status(404).json({
                    message: "Product is not found"
                })
            } else if (product.status === "Rejected") {
                return res.status(400).json({ message: "Product is rejected" });
            }

            // Check whether the user belongs to the specified organization
            const memberCensor = await MemberOrganization.findOne({
                where: { userId }
            })
            if (!memberCensor || (product.censorId !== memberCensor.censorId)) {
                return res.status(400).json({ message: "The user does not belong to the specified organization" });
            }

            // Update status of Product
            product.status = "Rejected"
            await product.save()

            return res.status(200).json({
                message: "Rejected auction product successfully"
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async getCensorIdByUserId(userId) {
        try {
            const memberOrg = await MemberOrganization.findOne({
                where: {
                    userId: userId
                }
            });

            if (!memberOrg || !memberOrg.censorId) {
                return null;
            }

            return memberOrg.censorId;
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error('Error getting censorId by userId:', error);
            throw error;
        }
    }

    async postAuctionSession(censor, body, res) {
        try {
            const startTime = moment(body.startTime, "DD-MM-YYYY HH:mm").toDate()
            const endTime = moment(body.endTime, "DD-MM-YYYY HH:mm").toDate()

            const auctionSession = await ProductAuction.create({
                title: body.title,
                description: body.description,
                startTime,
                endTime,
                productId: body.productId,
                censorId: censor.censorId,
            })

            return res.status(200).json({
                message: "Post auction successfully",
                data: auctionSession
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async updateAuctionSession(sessionId, body, res) {
        try {
            if (body.startTime) body.startTime = moment(body.startTime, "DD-MM-YYYY HH:mm").toDate()
            if (body.endTime) body.endTime = moment(body.endTime, "DD-MM-YYYY HH:mm").toDate()

            const auctionSession = await ProductAuction.update({
                ...body
            }, {
                where: { id: sessionId }
            })

            const status = auctionSession[0] === 1 ? 200 : 404;
            return res.status(status).json({
                message: auctionSession[0] === 1 ? "Post auction successfully" : "Has error when post auction",
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async deleteAuctionSession(sessionId, res) {
        try {
            const auctionSession = await ProductAuction.destroy({
                where: { id: sessionId }
            })
            const status = auctionSession > 0 ? 200 : 404;
            return res.status(status).json({
                message: auctionSession > 0 ? "Auction session is deleted" : "Has error when delete auction session",
            })
        } catch (error) {
            throw new Error(error)
        }
    }

}

module.exports = new CensorService()
