const userServices = require("../services/userServices");
const { validateContact } = require("../helpers/joiSchema");

class UserController {
    getCurrentUser(req, res) {
        try {
            return userServices.getCurrentUser(req.user.dataValues, res);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    joinAuctionSession(req, res) {
        try {
            const sessionId = req.body.sessionId;
            if (!sessionId) {
                return res.status(400).json({
                    message: '"sessionId" is required',
                });
            }
            return userServices.joinAuctionSession(
                req.user?.id,
                sessionId,
                res
            );
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error,
            });
        }
    }
    async editUser(req, res) {
        try {
            const { userId, newData } = req.body;
            await userServices.editUser(userId, newData, res);
            return res.status(200).json({
                message: "User data updated successfully",
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error,
            });
        }
    }

    async changePassword(req, res) {
        try {
            const { userId, oldPassword, newPassword } = req.body;
            await userServices.changePassword(
                userId,
                oldPassword,
                newPassword,
                res
            );
            return res.status(200).json({
                message: "Password changed successfully",
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error,
            });
        }
    }

    getAllAuctionPriceInSession(req, res) {
        try {
            const sessionId = req.params.sessionId;
            if (!sessionId) {
                return res.status(400).json({
                    message: '"sessionId" is required',
                });
            }
            return userServices.getAllAuctionPrice(req.query, sessionId, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error,
            });
        }
    }

    getTheNecessaryDataInSession(req, res) {
        try {
            const sessionId = req.params.sessionId;
            if (!sessionId) {
                return res.status(400).json({
                    message: '"sessionId" is required',
                });
            }
            return userServices.getTheNecessaryDataInSession(sessionId, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error,
            });
        }
    }

    searchUser(req, res) {
        try {
            return userServices.searchUser(req?.user?.id, req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    sendContact(req, res) {
        try {
            const { error } = validateContact(req.body);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            return userServices.sendContact(req.body, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
    getTransaction(req, res) {
        try {
            const userId = req.user.dataValues.id
            const { pageNumber, limit } = req.query
            return userServices.getTransaction(userId, pageNumber, limit, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new UserController();
