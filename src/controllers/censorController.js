const censorServices = require("../services/censorService");


class CensorController {
    async getCensorByQuery(req, res) {
        try {
            return await censorServices.getCensors(req.query, res);
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

}

module.exports = new CensorController()