const censorServices = require('../services/censorService');
const { validateRegisterCensor, validateAuctionSession } = require('../helpers/joiSchema');

class CensorController {
    async registerCensor(req, res) {
        try {
            const user = req.user.dataValues
            const avatar = req.file || 1;
            const { error } = validateRegisterCensor(req.body);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message,
                });
            }
            return await censorServices.register(user, req.body, avatar, res);
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

    async getCurrentCensor(req, res) {
        try {
            return await censorServices.getCurrentCensor(req?.user?.id, req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async getAuctionByQuery(req, res) {
        try {
            return await censorServices.getAuctions(req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async getAuctionByToken(req, res) {
        try {
            return await censorServices.getAuctionsByToken(req?.user?.id, req.query, res);
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
    rejectAuctionProduct(req, res) {
        try {
            const productId = req.body.productId
            if (productId === ":productId") {
                return res.status(400).json({
                    message: '\"productId\" is required',
                });
            }
            return censorServices.rejecteAuctionProduct(req.user.id, productId, res)
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
            return censorServices.postAuctionSession(req.memberOrganization.dataValues, req.body, res);
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
