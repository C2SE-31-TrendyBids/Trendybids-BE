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
            return censorServices.rejecteAuctionProduct(req.user.id, req.body, res)
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

    getUserParticipating(req, res) {
        try {
            const { page, limit, productAuctionId } = req.query
            return censorServices.getAllUserParticipating(productAuctionId, page, limit, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

    addMemberToOrganization(req, res) {
        try {
            const censorId = req.censor.dataValues.id
            const email = req.body.email
            console.log(email);
            return censorServices.addMemberByEmail(censorId, email, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }

    }
    getAllMemberOrganization(req, res) {
        try {
            const censorId = req.memberOrganization.dataValues.censorId
            const { page, limit } = req.query
            return censorServices.getAllMembers(censorId, page, limit, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }
    getUserForCensor(req, res) {
        try {
            const email = req.query.email
            return censorServices.getUserByEmail(email, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }
    removeMember(req, res) {
        try {
            const userId = req.params.userId
            console.log(userId);
            if (!userId) {
                return res.status(400).json({
                    message: "userId is required"
                });
            }
            return censorServices.removeMember(userId, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }

    updateStatus(req, res) {
        try {
            return censorServices.updateStatusProductAuction(req.query, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }


}

module.exports = new CensorController()
