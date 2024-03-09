const express = require("express");
const router = express.Router();
const censorControllers = require("../controllers/censorController");
const {verifyToken, isAdmin, isCensor} = require("../middlewares/verifyToken");
const censorController = require('../controllers/censorController')

router.get("/get-all", censorControllers.getCensorByQuery);
router.use(verifyToken)
router.use(isCensor)
router.post('/approve-auction-product', censorController.approveAuctionProduct)

module.exports = router
