const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {verifyToken} = require("../middlewares/verifyToken");

router.use(verifyToken)
router.get("/me", verifyToken, userController.getCurrentUser);
router.post('/join-auction-session', userController.joinAuctionSession)


module.exports = router;