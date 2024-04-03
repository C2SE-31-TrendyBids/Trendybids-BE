const userServices = require('../services/userServices')
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
            return userServices.getAllAuctionPrice(req.user?.id, req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

    getTheNecessaryDataInSession(req, res) {
        try {
            return userServices.getTheNecessaryDataInSession(req.user?.id, req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

    placeABid(req, res) {
        try {
            return userServices.placeABid(req.user?.id, req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }


}

module.exports = new UserController;