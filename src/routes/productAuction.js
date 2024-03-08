const express = require("express");
const router = express.Router();
const productAuctionControllers = require("../controllers/productAuctionController");

router.get("/get-all", productAuctionControllers.getAll);


module.exports = router;