const Censor = require("../models/censor");
const { uploadFile, uploadMultipleFile } = require("../util/firebase.config");

class CensorServices {
    async register({ name, phoneNumber, founding, address, companyTaxCode, taxCodeIssuanceDate, position, placeTaxCode }, avatar, res) {
        try {
            const uploadAvatar = await uploadFile(avatar, 'avatar')
            const avatarUrl = uploadAvatar.url
            const [censor, created] = await Censor.findOrCreate({
                where: { phoneNumber },
                defaults: {
                    name,
                    phoneNumber,
                    founding,
                    address,
                    avatarUrl,
                    companyTaxCode,
                    taxCodeIssuanceDate,
                    position,
                    placeTaxCode
                }
            })
            const status = created ? 201 : 409;
            return res.status(status).json({
                message: created ? "Submitted registration request successfully" : "Phone number has already registered",
                censor: censor.toJSON()
            });
        } catch (error) {
            throw new Error(error)
        }
    }
}
module.exports = new CensorServices
