const adminServices = require('../services/adminService')
const { validateRegister, validateEditUser } = require("../helpers/joiSchema");
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
            const userId = req.query.userId;
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
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new AdminController()