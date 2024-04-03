const ProductAuction = require('../models/productAuction')
const UserParticipant = require('../models/userParticipant')
const AuctionHistory = require('../models/auctionHistory')
const {Sequelize} = require("sequelize");
const Censor = require("../models/censor");
const User = require("../models/user");

class UserServices {
    getCurrentUser(user, res) {
        return res.status(200).json({
            ...user
        })
    }

    async joinAuctionSession(userId, sessionId, res) {
        try {
            const participant = await UserParticipant.findOne({
                where: {userId, productAuctionId: sessionId}
            })
            if (participant) {
                return res.status(400).json({
                    message: "The user has participated in this auction",
                });
            }

            await Promise.all([
                UserParticipant.create({
                    userId,
                    productAuctionId: sessionId
                }),
                ProductAuction.update({
                    numberOfParticipation: Sequelize.literal('number_of_participation + 1')
                }, {
                    where: {id: sessionId}
                })
            ])

            return res.status(200).json({
                message: "Join to auction session successfully",
            });
        } catch (error) {
            throw new Error(error)
        }
    }

    async getAllAuctionPrice(userId, {page, limit, sessionId}, res) {
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
            // get new messages
            queries.order = [['createdAt', 'DESC']]

            const {count, rows} = await AuctionHistory.findAndCountAll({
                where: {productAuctionId: sessionId},
                ...queries,
                attributes: {exclude: ["productAuctionId"]},
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'fullName', 'avatarUrl']
                    }
                ]
            })

            return res.status(200).json({
                message: 'Get all auction price successfully!',
                totalBids:count,
                auctionPrices: rows
            });
        } catch (error) {
            console.error("Error in getAllAuctionPrice:", error);
            throw new Error(error)
        }
    }

    async getTheNecessaryDataInSession(userId, {sessionId}, res) {
        try {
            const queries = {raw: false, nest: true};
            const auctionPrices = await AuctionHistory.findAndCountAll({
                where: {productAuctionId: sessionId},
                ...queries,
                attributes: {exclude: ['userId']}
            })

            return res.status(200).json({
                auctionPrices
            });
        } catch (error) {
            console.error("Error in getAllAuctionPrice:", error);
            throw new Error(error)
        }
    }

    async placeABid(userId, {sessionId}, res) {
        try {
            const queries = {raw: false, nest: true};
            const auctionPrices = await AuctionHistory.findAll({
                where: {productAuctionId: sessionId},
                ...queries,
                attributes: {exclude: ['userId']},

            })

            return res.status(200).json({
                auctionPrices
            });
        } catch (error) {
            console.error("Error in getAllAuctionPrice:", error);
            throw new Error(error)
        }
    }
}

module.exports = new UserServices