const adminServices = require('../services/adminService')
const {validateRegister, validateEditUser} = require("../helpers/joiSchema");
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
            return adminServices.getUsers(req.query, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    editUser(req, res) {
        try {
            const userId = req.params.userId;
            const { error } = validateEditUser(req.body);
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
}

module.exports = new AdminController()