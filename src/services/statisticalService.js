const ProductAuction = require('../models/productAuction')
const AuctionHistory = require('../models/auctionHistory')
const User = require("../models/user")
const UserParticipant = require("../models/userParticipant")
const Product = require('../models/product')
const { Sequelize } = require('sequelize');
const PrdImage = require('../models/prdImage')
const Censor = require('../models/censor')

class StatisticalService {
    async getNumberAuction(censorId, status, res) {
        try {
            let whereCondition = {
                censorId: censorId
            };

            if (parseInt(status) !== 1) {
                whereCondition.status = status;
            }

            const { count } = await ProductAuction.findAndCountAll({
                where: whereCondition
            });

            return res.status(200).json({
                message: "Get number of product auctions successfully!",
                totalItem: count
            });
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    }
    async getTotalParticipants(productAuctionId, res) {
        try {
            const productAuction = await ProductAuction.findByPk(productAuctionId);
            if (!productAuction) {
                throw new Error('Product auction not found');
            }
            const totalParticipants = productAuction.numberOfParticipation
            return res.status(200).json({
                message: "Get number participants of product auctions successfully!",
                totalItem: totalParticipants
            });
        } catch (error) {
            throw new Error('Error in getTotalParticipants function: ' + error.message);
        }
    }
    async getTotalPrice(censorId, res) {
        try {
            const productAuction = await ProductAuction.findAll({
                where: {
                    censorId: censorId,
                    status: "ended"
                }
            });
            if (!productAuction) {
                throw new Error('Product auction not found');
            }
            let totalPrice = 0;
            productAuction.forEach(auction => {
                totalPrice += parseFloat(auction.highestPrice)
            });
            console.log(totalPrice);

            return res.status(200).json({
                message: "Get total auctions successfully!",
                totalHighestPrice: totalPrice.toFixed(2)
            });
        } catch (error) {
            throw new Error('Error in getTotalParticipants function: ' + error.message);
        }
    }
    async getSessionAuctionDetail(productAuctionId, res) {
        try {
            const productAuction = await ProductAuction.findOne({
                where: {
                    id: productAuctionId
                }
            });
            const auctionDetail = await AuctionHistory.findAll({
                where: {
                    productAuctionId: productAuctionId
                },
                include: [
                    {
                        model: User,
                        as: 'userAuctionHistory',
                        required: true,
                        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'walletId', 'roleId', 'refreshToken'] }
                    }
                ]
            });
            if (!auctionDetail || auctionDetail.length === 0) {
                return res.status(404).json({
                    message: "Auction details not found for the specified product auction ID."
                });
            }
            return res.status(200).json({
                message: "Successfully retrieved auction details.",
                highestPrice: productAuction.highestPrice,
                auctionDetail: auctionDetail,
            });
        } catch (error) {
            console.error("Error retrieving auction details:", error);
            return res.status(500).json({
                message: "An error occurred while retrieving auction details.",
                error: error.message
            });
        }
    }
    async getSessionAuctionForUser(userId, res) {
        try {
            const userAuction = await UserParticipant.findAll({
                where: {
                    userId: userId
                },
                include: [
                    {
                        model: ProductAuction,
                        as: 'productAuction',
                        required: true,
                        attributes: { exclude: ['censorId', 'highestBidder', 'title', 'totalNumberAuction', 'createdAt', 'description',] },
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                required: true,
                                attributes: { exclude: ['censorId', 'id ', 'ownerProductId', 'updatedAt', 'categoryId', 'status', 'createdAt'] },
                                include: [
                                    {
                                        model: PrdImage,
                                        as: 'prdImages',
                                        attributes: { exclude: ['productId'] }
                                    },
                                ],
                            }
                        ]
                    }
                ]
            });
            const count = await AuctionHistory.count({
                distinct: true,
                where: {
                    userId: userId
                }
            })
            const highestBids = await AuctionHistory.findAll({
                attributes: [
                    'productAuctionId',
                    [Sequelize.fn('max', Sequelize.col('auction_price')), 'highestBid'],
                    'userId'
                ],
                group: ['productAuctionId', 'userId']
            });
            let countAuctionSuccess = 0;
            for (const bid of highestBids) {
                if (bid.dataValues.userId === userId) {
                    countAuctionSuccess++;
                }
            }
            return res.status(200).json({
                numberOfParticipatAuctions: userAuction.length,
                productAuctionSuccess: countAuctionSuccess,
                auctionQuote: count,
                productAuction: userAuction
            });
        } catch (error) {
            console.error("Error retrieving auction details:", error);
            return res.status(500).json({
                message: "An error occurred while retrieving auction details.",
                error: error.message
            });
        }

    }
    async getSessionAuctionDetailForUser(productAuctionId, userId, res) {
        try {

            const productAuction = await ProductAuction.findOne({
                where: {
                    id: productAuctionId
                }
            })
            const auctionDetail = await AuctionHistory.findAll({
                where: {
                    productAuctionId: productAuctionId,
                    userId: userId
                },
            });

            if (!auctionDetail || auctionDetail.length === 0) {
                return res.status(404).json({
                    message: "Auction details not found for the specified product auction ID."
                });
            }
            return res.status(200).json({
                message: "Successfully retrieved auction details.",
                highestPrice: productAuction.highestPrice,
                auctionDetail: auctionDetail
            });
        } catch (error) {
            console.error("Error retrieving auction details:", error);
            return res.status(500).json({
                message: "An error occurred while retrieving auction details.",
                error: error.message
            });
        }
    }
    async getProductBidsSuccess(userId, pageNumber, limit, res) {
        try {
            // Tính toán giá trị offset và limit
            const offset = (pageNumber - 1) * limit;

            // Retrieve all productAuctionId values that the user has participated in
            const userParticipants = await UserParticipant.findAll({
                where: { userId: userId },
                attributes: ['productAuctionId']
            });

            // Get the list of productAuctionId
            const productAuctionIds = userParticipants.map(participant => participant.productAuctionId);

            if (productAuctionIds.length === 0) {
                return res.status(200).json({ products: [] });
            }

            // Find all ProductAuction entries with the corresponding productAuctionId
            const productAuctions = await ProductAuction.findAll({
                where: { id: productAuctionIds },
            });

            // Find all successful bids
            const auctionHistories = await AuctionHistory.findAll({
                where: {
                    productAuctionId: productAuctionIds,
                    userId: userId
                }
            });

            // Get the list of products that the user has successfully bid on
            const successfulProductAuctionIds = [];
            for (let auction of auctionHistories) {
                const productAuction = productAuctions.find(pa => pa.id === auction.productAuctionId);
                if (productAuction && productAuction.highestPrice === auction.auctionPrice) {
                    successfulProductAuctionIds.push(auction.productAuctionId);
                }
            }

            if (successfulProductAuctionIds.length === 0) {
                return res.status(200).json({ products: [] });
            }

            // Retrieve details of the successfully bid products with pagination
            const countsuccessfulProduct = await ProductAuction.count({
                where: { id: successfulProductAuctionIds },

            })
            const successfulProductAuctions = await ProductAuction.findAll({
                where: { id: successfulProductAuctionIds },
                attributes: { exclude: ['productId', 'censorId'] },
                include: [
                    {
                        model: Product,
                        as: 'product',
                        required: true,
                        attributes: { exclude: ['censorId', 'updatedAt', 'ownerProductId', "categoryId"] },
                        include: [
                            {
                                model: User,
                                as: 'owner',
                                required: true,
                                attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'walletId', 'roleId', 'refreshToken', 'address', 'avatarUrl', 'email', 'phoneNumber', 'status'] }
                            },
                            {
                                model: PrdImage,
                                as: 'prdImages',
                                attributes: { exclude: ['productId'] }
                            },
                        ]
                    },
                    {
                        model: Censor,
                        as: 'censor',
                        attributes: { exclude: ['address', 'avatarUrl', 'companyTaxCode', 'founding', 'phoneNumber', 'placeTaxCode', 'position', 'roleId', 'status', 'taxCodeIssuanceDate', 'userId'] }
                    }
                ],
                offset: offset,
                limit: limit
            });

            return res.status(200).json({
                totalPage: Math.ceil(countsuccessfulProduct / limit),
                countProduct: successfulProductAuctions.length,
                products: successfulProductAuctions,
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'An error occurred while fetching the data.' });
        }
    }



}
module.exports = new StatisticalService();