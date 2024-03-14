const ProductAuction = require('../models/productAuction')
const UserParticipant = require('../models/userParticipant')
const { Sequelize } = require("sequelize");

class UserServices {
    getCurrentUser(user, res) {
        return res.status(200).json({
            ...user
        })
    }

    async joinAuctionSession(userId, sessionId, res) {
        try {
            const participant = await UserParticipant.findOne({
                where: { userId, productAuctionId: sessionId }
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
                    where: { id: sessionId }
                })
            ])

            return res.status(200).json({
                message: "Join to auction session successfully",
            });
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = new UserServices