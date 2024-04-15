const userServices = require('../services/userServices')
const {validateBidPrice} = require("../helpers/joiSchema");

class UserController {
    getCurrentUser(req, res) {
        try {

            return userServices.getCurrentUser(req.user.dataValues, res);
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    joinAuctionSession(req, res) {
        try {
            const sessionId = req.body.sessionId
            if (!sessionId) {
                return res.status(400).json({
                    message: '\"sessionId\" is required',
                });
            }
            return userServices.joinAuctionSession(req.user?.id, sessionId, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

    getAllAuctionPriceInSession(req, res) {
        try {
            const sessionId = req.params.sessionId
            if (!sessionId) {
                return res.status(400).json({
                    message: '\"sessionId\" is required',
                });
            }
            return userServices.getAllAuctionPrice(req.query, sessionId, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

    getTheNecessaryDataInSession(req, res) {
        try {
            const sessionId = req.params.sessionId
            if (!sessionId) {
                return res.status(400).json({
                    message: '\"sessionId\" is required',
                });
            }
            return userServices.getTheNecessaryDataInSession(sessionId, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

}

module.exports = new UserController;