const censorServices = require('../services/censorService');
const { validateRegisterCensor } = require('../helpers/joiSchema');

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

    approveAuctionProduct(req, res) {
        try {
            const productId = req.body.productId
            if (!productId) {
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

}

module.exports = new CensorController()
