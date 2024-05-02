const ProductAuction = require("../models/productAuction");
const UserParticipant = require("../models/userParticipant");
const { Sequelize, Op} = require("sequelize");
const bcrypt = require("bcryptjs");
const AuctionHistory = require("../models/auctionHistory");
const User = require("../models/user");
const {validateBidPrice} = require("../helpers/joiSchema");

class UserServices {
    getCurrentUser(user, res) {
        return res.status(200).json({
            ...user,
        });
    }

    async joinAuctionSession(userId, sessionId, res) {
        try {
            const participant = await UserParticipant.findOne({
                where: { userId, productAuctionId: sessionId },
            });
            if (participant) {
                return res.status(400).json({
                    message: "The user has participated in this auction",
                });
            }

            await Promise.all([
                UserParticipant.create({
                    userId,
                    productAuctionId: sessionId,
                }),
                ProductAuction.update(
                    {
                        numberOfParticipation: Sequelize.literal(
                            "number_of_participation + 1"
                        ),
                    },
                    {
                        where: { id: sessionId },
                    }
                ),
            ]);

            return res.status(200).json({
                message: "Join to auction session successfully",
            });
        } catch (error) {
            throw new Error(error);
        }
    }
    
    async editUser(id, newData, res) {
        try {
            const user = await User.findOne({
                where: { id: id },
            });

            if (!user) {
                res.status(404).json({
                    message: "User is not found",
                });
            }
            // Upload image into Firebase and save url in database
            // if (user && fileImages.length > 0) {
            //     const imageURLs = await uploadMultipleFile(fileImages, 'user')
            //     const prdImageModels = imageURLs.map(item => {
            //         return {
            //             id: item.id,
            //             prdImageURL: item.url,
            //             productId: product.id
            //         };
            //     });
            //     await prdImage.bulkCreate(prdImageModels)
            // }

            await user.update({
                ...newData,
            });
        } catch (error) {
            throw new Error(error);
        }
    }

    async changePassword(id, oldPassword, newPassword, res) {
        try {
            const user = await User.findOne({ where: { id: id } });
            console.log("chay roi");
            if (!user) {
                console.log("User not found");
            }
            // const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            const hashPassword = bcrypt.hashSync(
                newPassword,
                bcrypt.genSaltSync(8)
            );
            await user.update({ password: hashPassword });
        } catch (error) {
            throw new Error(error);
        }
    }

    async getHighestPrice(sessionId) {
        const latestHighestPrice = await AuctionHistory.findOne({
            where: {
                productAuctionId: sessionId
            },
            order: [['createdAt', 'DESC']],
            attributes: ['auctionPrice']
        });
        return latestHighestPrice?.auctionPrice
    }

    async getAllAuctionPrice({ page, limit }, sessionId, res) {
        try {
            const queries = { raw: false, nest: true };
            // Ensure page and limit are converted to numbers, default to 1 if not provided or invalid
            let pageNumber = isNaN(parseInt(page)) ? 1 : parseInt(page);
            const limitNumber = isNaN(parseInt(limit)) ? 6 : parseInt(limit);
            // If pageNumber is less than 1, set it to 1
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            // Calculate the offset
            const offset = (pageNumber - 1) * limitNumber;
            queries.offset = offset;
            queries.limit = limitNumber;
            // get new messages
            queries.order = [["createdAt", "DESC"]];

            const { count, rows } = await AuctionHistory.findAndCountAll({
                where: { productAuctionId: sessionId },
                ...queries,
                attributes: {exclude: ["userId", "updatedAt"]},
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id',
                            [Sequelize.literal('CASE WHEN LENGTH("user"."full_name") > 12 THEN LEFT("user"."full_name", 8) || \'****\' ELSE LEFT("user"."full_name", LENGTH("user"."full_name") - 4) || REPEAT(\'*\', 4) END'), 'fullName'],
                            'avatarUrl']
                    }
                ]
            })
            const totalPages = Math.ceil(count / limitNumber)
            const highestPrice = await this.getHighestPrice(sessionId);
            // get number of participation
            const numberOfParticipation = await UserParticipant.count({
                where: {
                    productAuctionId: sessionId // Assuming sessionId holds the value you want to count for
                },
                attributes: { exclude: ["productAuctionId"] },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "fullName", "avatarUrl"],
                    },
                ],
            });

            return res.status(200).json({
                message: "Get all auction price successfully!",
                totalBids: count,
                currentPage: pageNumber,
                highestPrice: highestPrice,
                totalPages,
                auctionPrices: rows,
                numberOfParticipation: numberOfParticipation
            });
        } catch (error) {
            console.error("Error in getAllAuctionPrice:", error);
            throw new Error(error);
        }
    }

    async getTheNecessaryDataInSession(sessionId, res) {
        try {
            const highestPrice = await this.getHighestPrice(sessionId);

            const numberOfParticipants = await UserParticipant.count({
                distinct: true,
                where: { productAuctionId: sessionId },
            });

            return res.status(200).json({
                numberOfParticipants,
                highestPrice: highestPrice ? highestPrice : null,
            });
        } catch (error) {
            console.error("Error in getAllAuctionPrice:", error);
            throw new Error(error);
        }
    }

    async checkUserInAuction(userId, sessionId) {
        const participant = await UserParticipant.findOne({
            where: {userId, productAuctionId: sessionId}
        });
        if (!participant) {
            return {
                status: "error",
                message: "User is not in this auction!"
            }
        }
        return {status: "success", message: "None"}
    }


    async checkBidPrice(bidPrice, sessionId) {
        const highestPrice = await this.getHighestPrice(sessionId);
        if (bidPrice <= highestPrice) {
            return {
                status: "error",
                message: "Bid price must be greater than the current highest price!"
            }
        }
        if (bidPrice > highestPrice * 2) {
            return {
                status: "error",
                message: "Bid price must be less than twice the highest price!"
            }
        }
        const {error} = validateBidPrice({bidPrice: bidPrice});
        if (error)
            return {
                status: "error",
                message: "Bid price must number!"
            }
        return {status: "success", message: "None"}
    }

    async updateAuctionData(bidPrice, sessionId, userId) {
        const updateHighestPrice = ProductAuction.update({
            highestPrice: bidPrice
        }, {
            where: {
                id: sessionId
            }
        });

        const createAuctionHistory = AuctionHistory.create({
            auctionPrice: bidPrice,
            productAuctionId: sessionId,
            userId: userId
        });

        await Promise.all([updateHighestPrice, createAuctionHistory]);
    }

    async getUpdatedData(userId, sessionId) {
        const updatedParticipant = await UserParticipant.findOne({
            where: {userId, productAuctionId: sessionId},
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatarUrl']
                }
            ]
        });
        const updatedAuctionHistory = await AuctionHistory.findOne({
            where: {userId: userId}
        });

        return {updatedParticipant, updatedAuctionHistory};
    }

    async placeABid(userId, bidPrice, sessionId) {
        try {
            // check user already in auction
            const isValidParticipant = await this.checkUserInAuction(userId, sessionId);
            if (isValidParticipant?.status === "error") {
                return {status: "error", userId: userId, message: isValidParticipant.message}
            }
            // check bid price validity
            const isValidBidPrice = await this.checkBidPrice(bidPrice, sessionId);
            if (isValidBidPrice?.status === "error") {
                return {status: "error", userId: userId, message: isValidBidPrice.message}
            }
            // update auction data
            await this.updateAuctionData(bidPrice, sessionId, userId);

            const {updatedParticipant, updatedAuctionHistory} = await this.getUpdatedData(userId, sessionId);

            console.log(updatedAuctionHistory.createdAt)
            const currentDate = new Date()

            return ({
                status: "success",
                message: 'Place a bid successfully!',
                bidPrice: {
                    id: updatedAuctionHistory.id,
                    auctionPrice: bidPrice,
                    productAuctionId: sessionId,
                    createdAt: currentDate,
                    user: updatedParticipant.user.get({ plain: true }),
                },
                highestPrice: bidPrice
            });
        } catch (error) {
            console.error("Error in placeABid:", error);
            return ({message: error.message, status: "error"});
        }
    }

    async searchUser({ keyword }, res) {
        const users = await User.findAll({
            where: {
                roleId: { [Op.not]: "R03" },
                fullName: { [Op.iLike]: `%${keyword || null}%` },
            },
            attributes: ['id', 'email', 'fullName', 'avatarUrl'],
        })
        return res.status(200).json({
            message: 'Success',
            totalItem: users.length,
            users: users,
        })
    }
}

module.exports = new UserServices();
