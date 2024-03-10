const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, isAdmin, isCensor } = require("../middlewares/verifyToken");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() })

router.get("/me", verifyToken, userController.getCurrentUser);

router.use(verifyToken)
router.post("/post-auction-product", upload.array('prdImageURL'), userController.postAuctionProduct);

module.exports = router;