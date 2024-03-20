const Censor = require('../models/censor')
class AdminService {
    async approveCensor(user, censorId, res) {
        try {
            const censor = await Censor.findOne({
                where: { id: censorId }
            })
            if (!censor) {
                return res.status(404).json({
                    message: "Censor is not found"
                })
            } else if (censor.status === "Verified") {
                return res.status(400).json({ message: "Censor is Verified" });
            }

            // Update status of Censor
            censor.status = "Verified"
            await censor.save()

            return res.status(200).json({
                message: "Approve censor successfully"
            })
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = new AdminService()