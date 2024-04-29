const {uploadFile, uploadMultipleFile} = require("../config/firebase.config");
const {Op} = require("sequelize");
const Censor = require("../models/censor");
const Product = require('../models/product')
const ProductAuction = require("../models/productAuction");
const MemberOrganization = require('../models/memberOrganization')
const User = require("../models/user");
const PrdImage = require("../models/prdImage");
const Category = require("../models/category");
const Wallet = require("../models/wallet");

class CensorService {
    async register(user, {
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
            const userId = user.id;
            const userMember = await MemberOrganization.findOne({where: {userId: userId}})
            if (userMember) {
                return res.status(200).json({
                    message: "Your account is already a member of the organization",
                });
            }
            let avatarUrl = '';
            if (avatar === 1) {
                avatarUrl = 'https://firebasestorage.googleapis.com/v0/b/beautyboutique-7ebb3.appspot.com/o/Avatar%2Flogo.png?alt=media&token=440531f8-2369-4dce-8cf3-86913dfc4a27'
            } else {
                const uploadAvatar = await uploadFile(avatar, 'avatar')
                avatarUrl = uploadAvatar.url
            }
            const [censor, created] = await Censor.findOrCreate({
                where: {phoneNumber},
                defaults: {
                    name,
                    phoneNumber,
                    founding,
                    address,
                    avatarUrl,
                    companyTaxCode,
                    taxCodeIssuanceDate,
                    position,
                    placeTaxCode,
                    userId
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


    async getCensors({page, limit, order, name, ...query}, res) {
        try {
            const queries = {raw: false, nest: true};
            // Ensure page and limit are converted to numbers, default to 1 if not provided or invalid
            let pageNumber = (parseInt(page)) || 1
            const limitNumber = (parseInt(limit)) || 4
            // Calculate the offset
            queries.offset = (pageNumber - 1) * limitNumber;
            queries.limit = limitNumber;
            // handle config query
            if (order) queries.order = [order];
            // order of product
            const censorQuery = {
                ...(name ? {name: {[Op.iLike]: `${name}%`}} : {}),
                ...query
            };

            const {count, rows} = await Censor.findAndCountAll({
                where: censorQuery,
                ...queries,
                attributes: {exclude: ['walletId', 'roleId', 'createdAt', 'updatedAt', 'userId']},
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

    async commonQueryOfProductAuction(page = "1",
                                      limit = "10",
                                      order,
                                      productName,
                                      orderProduct,
                                      time,
                                      categoryId,
                                      priceFrom,
                                      priceTo,
                                      query,
                                      censorId
    ) {
        const queries = {raw: true, nest: true};
        // Calculate the offset
        queries.offset = (parseInt(page) - 1) * parseInt(limit);
        queries.limit = parseInt(limit);
        // handle config query
        if (order) queries.order = [order];
        // Order product by startingPrice if
        if (orderProduct === 'price_ASC') {
            queries.order = [[{model: Product, as: 'product'}, 'startingPrice', 'ASC']];
        } else if (orderProduct === 'price_DESC') {
            queries.order = [[{model: Product, as: 'product'}, 'startingPrice', 'DESC']];
        }
        // Add a sort condition by product name if specified
        if (orderProduct === 'productName_ASC') {
            queries.order = [[{model: Product, as: 'product'}, 'productName', 'ASC']];
        } else if (orderProduct === 'productName_DESC') {
            queries.order = [[{model: Product, as: 'product'}, 'productName', 'DESC']];
        }
        // Commented out categoryId query as it's already handled in productQuery
        if (categoryId) {
            query['$product.category.id$'] = categoryId;
        }

        const productQuery = {
            ...(productName !== undefined ? {productName: {[Op.substring]: productName}} : {}),
            ...(priceFrom !== undefined && priceTo !== undefined ?
                    {startingPrice: {[Op.between]: [priceFrom, priceTo]}} :
                    priceFrom !== undefined ?
                        {startingPrice: {[Op.gte]: priceFrom}} :
                        priceTo !== undefined ?
                            {startingPrice: {[Op.lte]: priceTo}} :
                            {}
            )
        };

        const currentDate = new Date();
        if (time === "nearest") {
            queries.order = [["startTime", "ASC"]];
            queries.where = {
                startTime: { [Op.gt]: currentDate }
            };
        } else if (time === "furthest") {
            queries.order = [["startTime", "DESC"]];
            queries.where = {
                startTime: { [Op.gt]: currentDate }
            };
        }

        if (censorId) {
            query.censorId = censorId;
        }

        return {
            queries,
            query,
            productQuery,
        };
    }


    async getAuctions({
                          page,
                          limit,
                          order,
                          productName,
                          orderProduct,
                          time,
                          categoryId,
                          priceFrom,
                          priceTo,
                          ...query
                      }, res) {
        try {
            // handle query parameters
            const {
                queries,
                query: conditionQuery,
                productQuery,
            } = await this.commonQueryOfProductAuction(page, limit, order, productName, orderProduct, time, categoryId, priceFrom, priceTo, query);

            const {count, rows} = await ProductAuction.findAndCountAll({
                where: conditionQuery,
                ...queries,
                subQuery:false,
                attributes: {exclude: ['productId', 'censorId']},
                include: [
                    {
                        model: Product,
                        as: 'product',
                        required: true,
                        where: productQuery,
                        attributes: {exclude: ['censorId', 'updatedAt', 'ownerProductId', "categoryId"]},
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
                            }
                        ],
                    },
                    {
                        model: Censor,
                        as: 'censor',
                        required: true,
                        attributes: {exclude: ['walletId', 'roleId', 'createdAt', 'updatedAt', 'userId', "status"]},
                    }
                ],
                distinct: true
            });

            const totalPages = Math.ceil(count / queries.limit)
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


    async getAuctionsByToken(userId, {
        page,
        limit,
        order,
        time,
        productName,
        upCome,
        orderProduct,
        categoryId,
        priceFrom,
        priceTo,
        ...query
    }, res) {
        try {
            // get censor id
            const censorId = await this.getCensorIdByUserId(userId)
            // get queries, query and productQuery
            const {
                queries,
                query: conditionQuery,
                productQuery
            } = await this.commonQueryOfProductAuction(page, limit, order, productName, orderProduct, time, categoryId, priceFrom, priceTo, query, censorId);

            const {count, rows} = await ProductAuction.findAndCountAll({
                where: conditionQuery,
                ...queries,
                subQuery:false,
                attributes: {exclude: ['productId', 'censorId']},
                include: [
                    {
                        model: Product,
                        as: 'product',
                        required: true,
                        where: productQuery,
                        attributes: {exclude: ['censorId', 'updatedAt', 'ownerProductId', "categoryId"]},
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
                            }
                        ],
                    }
                ],
                distinct: true
            });

            const totalPages = Math.ceil(count / queries?.limit)
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

    async getCurrentCensor(userId, {page, limit, order, ...query}, res) {
        try {
            const queries = {raw: false, nest: true};
            // Ensure page and limit are converted to numbers, default to 1 if not provided or invalid
            let pageNumber = isNaN(parseInt(page)) ? 1 : parseInt(page);
            const limitNumber = isNaN(parseInt(limit)) ? 4 : parseInt(limit);
            // If pageNumber is less than 1, set it to 1
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            // Calculate the offset
            queries.offset = (pageNumber - 1) * limitNumber;
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
                attributes: {exclude: ['roleId', 'createdAt', 'updatedAt', "userId", "walletId"]},
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
                where: {id: productId}
            })
            if (!product) {
                return res.status(404).json({
                    message: "Product is not found"
                })
            } else if (product.status === "Verified") {
                return res.status(400).json({message: "Product is Verified"});
            }

            // Check whether the user belongs to the specified organization
            const memberCensor = await MemberOrganization.findOne({
                where: {userId}
            })
            if (!memberCensor || (product.censorId !== memberCensor.censorId)) {
                return res.status(400).json({message: "The user does not belong to the specified organization"});
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

    async rejecteAuctionProduct(userId, {productId, note}, res) {
        try {

            const product = await Product.findOne({
                where: {id: productId}
            })
            if (!product) {
                return res.status(404).json({
                    message: "Product is not found"
                })
            } else if (product.status === "Rejected") {
                return res.status(400).json({message: "Product is rejected"});
            }

            // Check whether the user belongs to the specified organization
            const memberCensor = await MemberOrganization.findOne({
                where: {userId}
            })
            if (!memberCensor || (product.censorId !== memberCensor.censorId)) {
                return res.status(400).json({message: "The user does not belong to the specified organization"});
            }

            // Update status of Product
            product.status = "Rejected"
            product.note = note
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
            const auctionSession = await ProductAuction.create({
                title: body.title,
                description: body.description,
                startTime: body.startTime,
                endTime: body.endTime,
                productId: body.productId,
                censorId: censor.censorId,
            })
            await Product.update({status: 'Success'}, {where: {id: body.productId}});
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
            const auctionSession = await ProductAuction.update({
                ...body
            }, {
                where: {id: sessionId}
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
                where: {id: sessionId}
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
