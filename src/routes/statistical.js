const express = require("express");
const router = express.Router();
const { verifyToken, isCensor } = require("../middlewares/verifyToken");

const StatisticalController = require('../controllers/statisticalController')

router.use(verifyToken)
router.get('/auction-detail-user', StatisticalController.getSessionAuctionForUser)
router.get('/auction-user-participant', StatisticalController.getSessionForUser)
router.get('/auction-bid-success', StatisticalController.getAuctionBidsSuccess)

router.use(isCensor)
router.get('/total-auction', StatisticalController.getNumberAuction)
router.get('/total-participants', StatisticalController.getNumberParticipants)
router.get('/total-price', StatisticalController.getTotalHighestPrice)
router.get('/auction-detail', StatisticalController.getSessionAuction)


module.exports = router;