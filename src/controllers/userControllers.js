const userServices = require("../services/userService");


class UserController {
    async getCurrentUser(req, res) {
        try {
            const id = req.user.id;
            const response = await userServices.getCurrentUser(id, res);
            return response;
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    };
}
module.exports = new UserController;


