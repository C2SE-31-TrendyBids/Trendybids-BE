const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productController");
const {verifyToken, isAdmin, isCensor} = require("../middlewares/verifyToken");
const multer = require("multer");

const upload = multer({storage: multer.memoryStorage()})


router.use(verifyToken)
router.get("/get-product-owner", productControllers.getProductOfOwner);
router.get("/get-product-censor", productControllers.getProductOfCensor);
router.post("/post-product", upload.array('prdImageURL'), productControllers.postAuctionProduct);
router.put("/update-product/:productId", upload.array('prdImageURL'), productControllers.updateAuctionProduct);
router.delete("/delete-product/:productId", productControllers.deleteAuctionProduct);
router.delete("/delete-image/:imageId", productControllers.deleteImage);



module.exports = router;