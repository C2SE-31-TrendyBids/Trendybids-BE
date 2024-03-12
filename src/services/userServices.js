const Product = require('../models/product')
const {uploadFile, uploadMultipleFile, deleteMultipleFile} = require("../util/firebase.config");
const prdImage = require('../models/prdImage')

class UserServices {
    getCurrentUser(user, res) {
        return res.status(200).json({
            ...user
        })
    }
}

module.exports = new UserServices