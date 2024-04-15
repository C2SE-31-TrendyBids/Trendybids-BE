const express = require("express");
const router = express.Router();
const { verifyToken, isCensor } = require("../middlewares/verifyToken");

const StatisticalController = require('../controllers/statisticalController')

router.use(verifyToken)
router.use(isCensor)
router.get('/total-auction', StatisticalController.getNumberAuction)
router.get('/total-participants', StatisticalController.getNumberParticipants)
router.get('/total-price', StatisticalController.getTotalHighestPrice)


module.exports = router;