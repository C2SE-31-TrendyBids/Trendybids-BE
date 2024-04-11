const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middlewares/verifyToken");

router.get("/search", userController.searchUser);

router.use(verifyToken);
router.get("/me", verifyToken, userController.getCurrentUser);
router.put("/edit-user", verifyToken, userController.editUser);
router.put("/change-password", userController.changePassword);
router.post('/join-auction-session', userController.joinAuctionSession)
router.get('/get-all-auction-price/:sessionId', userController.getAllAuctionPriceInSession)
router.get('/get-summary-auction-price/:sessionId', userController.getTheNecessaryDataInSession)
router.post('/place-bid', userController.placeABid)

module.exports = router;
