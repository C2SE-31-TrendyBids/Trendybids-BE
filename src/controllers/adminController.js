const adminServices = require('../services/adminService')
class AdminController {
    approveCensor(req, res) {
        try {
            const censorId = req.body.censorId
            if (!censorId) {
                return res.status(400).json({
                    message: '\"censorId\" is required',
                });
            }
            return adminServices.approveCensor(censorId, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new AdminController()