const express = require('express')
const {verifyToken, isAdmin, isCensor} = require("../middlewares/verifyToken");
const censorController = require('../controllers/censorController')

const router = express.Router()

router.use(verifyToken)
router.use(isCensor)
router.post('/approve-auction-product', censorController.approveAuctionProduct)

module.exports = router