const Product = require('../models/product')
const MemberOrganization = require('../models/memberOrganization')
class CensorService {
    async approveAuctionProduct(userId, productId, res) {
        try {

            const product = await Product.findOne({
                where: {id: productId}
            })
            if (!product) {
                return res.status(404).json({
                    message: "Product is not found"
                })
            } else if (product.status === "Verified") {
                return res.status(400).json({ message: "Product is Verified" });
            }

            // Check whether the user belongs to the specified organization
            const memberCensor = await MemberOrganization.findOne({
                where: { userId }
            })
            if (!memberCensor || (product.censorId !== memberCensor.censorId)) {
                return res.status(400).json({ message: "The user does not belong to the specified organization" });
            }

            // Update status of Product
            product.status = "Verified"
            await product.save()

            return res.status(200).json({
                message: "Approve auction product successfully"
            })
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = new CensorService()