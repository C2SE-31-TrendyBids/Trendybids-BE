const StatisticalService = require('../services/statisticalService')

class StatisticalController {
    getNumberAuction = async (req, res) => {
        try {
            const censorId = req.censor.dataValues.id;
            const { status } = req.query; 
            if (!censorId) {
                return res.status(400).json({
                    message: '"Account" is not Censor',
                });
            }
            return StatisticalService.getNumberAuction(censorId, status, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error,
            });
        }
    }
    async getNumberParticipants(req, res) {
        try {
            const { productAuctionId } = req.query;
            if (!productAuctionId) {
                return res.status(400).json({
                    message: '"productAuctionId" is required',
                });
            }
            return StatisticalService.getTotalParticipants(productAuctionId, res);
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Internal Server Error",
                error: err.message
            });
        }
    }
    async getTotalHighestPrice(req, res) {
        try {
            const censorId = req.censor.dataValues.id;
            if (!censorId) {
                return res.status(400).json({
                    message: '"Account" is not Censor',
                });
            }
            return StatisticalService.getTotalPrice(censorId, res);
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Internal Server Error",
                error: err.message
            });
        }
    }
    async getSessionAuction(req, res) {
        try {
            const { productAuctionId } = req.query;
            if (!productAuctionId) {
                return res.status(400).json({
                    message: '"Account" is not Censor',
                });
            }
            return StatisticalService.getSessionAuctionDetail(productAuctionId, res);
        } catch (error) {
            console.log(err);
            return res.status(500).json({
                message: "Internal Server Error",
                error: err.message
            });
        }
    }
    async getSessionForUser(req, res) {
        try {
            const userId = req.user.dataValues.id
            if (!userId) {
                return res.status(400).json({
                    message: '"Account" is not find',
                });
            }
            return StatisticalService.getSessionAuctionForUser(userId, res);
        } catch (error) {
            console.log(err);
            return res.status(500).json({
                message: "Internal Server Error",
                error: err.message
            });
        }
    }
    async getSessionAuctionForUser(req, res) {
        try {
            const { productAuctionId } = req.query;
            const userId = req.user.dataValues.id
            if (!productAuctionId) {
                return res.status(400).json({
                    message: '"Account" is not Censor',
                });
            }
            return StatisticalService.getSessionAuctionDetailForUser(productAuctionId, userId, res);
        } catch (error) {
            console.log(err);
            return res.status(500).json({
                message: "Internal Server Error",
                error: err.message
            });
        }
    }
    getAuctionBidsSuccess(req, res) {
        try {
            const userId = req.user.dataValues.id
            const { pageNumber, limit } = req.query
            return StatisticalService.getProductBidsSuccess(userId, pageNumber, limit, res);
        } catch (error) {
            console.log(err);
            return res.status(500).json({
                message: "Internal Server Error",
                error: err.message
            });
        }
    }

}
module.exports = new StatisticalController();