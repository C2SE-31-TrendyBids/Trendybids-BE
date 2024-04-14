const ProductAuction = require('../models/productAuction')
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
}
module.exports = new StatisticalService();