const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, isAdmin, isCensor } = require("../middlewares/verifyToken");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() })

router.get("/me", verifyToken, userController.getCurrentUser);

router.use(verifyToken)
router.post("/post-product", upload.array('prdImageURL') ,userController.postAuctionProduct);
router.put("/update-product/:productId", upload.array('prdImageURL') ,userController.updateAuctionProduct);
router.delete("/delete-product/:productId" ,userController.deleteAuctionProduct);

module.exports = router;