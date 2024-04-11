const ProductAuction = require("../models/productAuction");
const UserParticipant = require("../models/userParticipant");
const { Sequelize, Op} = require("sequelize");
const bcrypt = require("bcryptjs");
const AuctionHistory = require("../models/auctionHistory");
const User = require("../models/user");

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
                auctionPrices: rows,
            });
        } catch (error) {
            console.error("Error in getAllAuctionPrice:", error);
            throw new Error(error);
        }
    }

    async getHighestPrice(sessionId) {
        const latestHighestPrice = await AuctionHistory.findOne({
            where: {
                productAuctionId: sessionId,
            },
            order: [["createdAt", "DESC"]],
            attributes: ["auctionPrice"],
        });
        return latestHighestPrice?.auctionPrice;
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

    async placeABid(userId, { bidPrice, sessionId }, res) {
        try {
            // handle check user in party
            const participant = await UserParticipant.findOne({
                where: { userId, productAuctionId: sessionId },
            });
            if (!participant) {
                return res.status(400).json({
                    message: "User is not in this auction!",
                });
            }
            // handle check bid price
            const highestPrice = await this.getHighestPrice(sessionId);
            if (bidPrice <= highestPrice) {
                return res.status(400).json({
                    message:
                        "Bid price must be greater than the current highest price!",
                });
            }

            const updateHighestPrice = ProductAuction.update(
                {
                    highestPrice: bidPrice,
                },
                {
                    where: {
                        id: sessionId,
                    },
                }
            );

            const createAuctionHistory = AuctionHistory.create({
                auctionPrice: bidPrice,
                productAuctionId: sessionId,
                userId: userId,
            });

            await Promise.all([updateHighestPrice, createAuctionHistory]);

            return res.status(201).json({
                message: "Place a bid successfully!",
                bidPrice: bidPrice,
            });
        } catch (error) {
            console.error("Error in getAllAuctionPrice:", error);
            throw new Error(error);
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
