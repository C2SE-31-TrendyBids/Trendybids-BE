const ProductAuction = require('../models/productAuction')
const AuctionHistory = require('../models/auctionHistory')
const User = require("../models/user")
const UserParticipant = require("../models/userParticipant")
const Product = require('../models/product')
const { Sequelize } = require('sequelize');
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

}
module.exports = new StatisticalService();