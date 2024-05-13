const adminServices = require('../services/adminService')
const {validateDate, validateEditUser, validateRule} = require("../helpers/joiSchema");

class AdminController {
    toggleStatusCensor(req, res) {
        try {
            const censorId = req.body.censorId
            const type = req.body.type;

            if (!censorId) {
                return res.status(400).json({
                    message: '\"censorId\" is required',
                });
            }

            if (type !== "1" && type !== "2") {
                return res.status(400).json({
                    message: '\"type\" value is 1 or 2 (Verified or Rejected)',
                });
            }
            return adminServices.toggleStatusCensor(type, censorId, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    getUsers(req, res) {
        try {
            return adminServices.getUsers(req?.user?.id, req.query, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    editUser(req, res) {
        try {
            const userId = req.query.userId;
            const {error} = validateEditUser(req.body);

            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            if (!userId) {
                return res.status(400).json({
                    message: '\"userId\" is required',
                });
            }
            return adminServices.editUser(userId, req.body, req.file, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    deleteUser(req, res) {
        try {
            const userId = req.query.userId;
            console.log(userId);
            if (!userId) {
                return res.status(400).json({
                    message: '\"userId\" is required',
                });
            }
            return adminServices.deleteUser(userId, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async getAllRolesController(req, res) {
        try {
            const rolesData = await adminServices.getAllRoles()
            return res.status(200).json(rolesData);
        } catch (error) {
            return res.status(500).json({error: 'Internal server error'});
        }
    }

    async getSummary(req, res) {
        try {
            const summaryData = await adminServices.getSummary()
            return res.status(200).json(summaryData);
        } catch (error) {
            return res.status(500).json({error: 'Internal server error'});
        }
    }

    async getLineChartProductAuction(req, res) {
        try {
            const {error} = validateDate(req.query);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            const chartData = await adminServices.generateProductAuctionChart(req.query)
            return res.status(200).json(chartData);
        } catch (error) {
            return res.status(500).json({error: 'Internal server error'});
        }
    }

    async getProfit(req, res) {
        try {
            const {error} = validateDate(req.query);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });

            const chartData = await adminServices.getProfitsByPeriod(req.query)
            return res.status(200).json(chartData);
        } catch (error) {
            return res.status(500).json({error: 'Internal server error'});
        }
    }

    async getTransactionHistory(req, res) {
        try {
            return await adminServices.getTransactionHistory(req.query, res)
        } catch (error) {
            return res.status(500).json({error: 'Internal server error'});
        }
    }

    async createRule(req, res) {
        try {
            const {error} = validateRule(req.body);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            return await adminServices.createRule(req.body, res)
        } catch (error) {
            return res.status(500).json({error: 'Internal server error'});
        }
    }
    async updateRule(req, res) {
        try {
            const id = req.query.id
            if (!id) {
                return res.status(400).json({
                    message: "\"id\" is required",
                });
            }
            return await adminServices.updateRule(id , req.body, res)
        } catch (error) {
            return res.status(500).json({error: 'Internal server error'});
        }
    }

    async deleteRule(req, res) {
        try {
            const id = req.query.id
            if (!id) {
                return res.status(400).json({
                    message: "\"id\" is required",
                });
            }
            return await adminServices.deleteRule(id, res)
        } catch (error) {
            return res.status(500).json({error: 'Internal server error'});
        }
    }

    async getRules(req, res) {
        try {
            return await adminServices.getRules(req.query, res)
        } catch (error) {
            return res.status(500).json({error: 'Internal server error'});
        }
    }


}

module.exports = new AdminController()