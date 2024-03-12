const censorServices = require('../services/censorService');
const { validateRegisterCensor, validateAuctionSession } = require('../helpers/joiSchema');

class CensorController {
    async registerCensor(req, res) {
        try {
            const { error } = validateRegisterCensor(req.body);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    message: '\"avatar\" is required',
                });
            }
            let avatar = req.file || null;
            return await censorServices.register(req.body, avatar, res);
        } catch (error) {
            console.error("Error in registerCensor:", error);

        }
    }

    async getCensorByQuery(req, res) {
        try {
            return await censorServices.getCensors(req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async getAuctionByQuery(req, res) {
        try {
            return await censorServices.getAuction(req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    approveAuctionProduct(req, res) {
        try {
            const productId = req.body.productId
            if (productId === ":productId") {
                return res.status(400).json({
                    message: '\"productId\" is required',
                });
            }
            return censorServices.approveAuctionProduct(req.user.id, productId, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    postAuctionSession(req, res) {
        try {
            const { error } = validateAuctionSession(req.body, "post");
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            }
            return censorServices.postAuctionSession(req.user.id, req.body, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

    updateAuctionSession(req, res) {
        try {
            const { error } = validateAuctionSession(req.body, "update");
            const sessionId = req.params.sessionId;

            if (sessionId === ":sessionId") {
                return res.status(400).json({
                    message: '\"sessionId\" is required',
                });
            }
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            }

            return censorServices.updateAuctionSession(sessionId, req.body, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

    deleteAuctionSession(req, res) {
        try {
            const sessionId = req.params.sessionId;
            if (sessionId === ":sessionId") {
                return res.status(400).json({
                    message: '\"sessionId\" is required',
                });
            }
            return censorServices.deleteAuctionSession(sessionId, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

}

module.exports = new CensorController()
