const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productController");
const { verifyToken, isAdmin, isCensor } = require("../middlewares/verifyToken");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() })

router.get("/get-all", productControllers.getProductByQuery);

router.use(verifyToken)
router.post("/post-product", upload.array('prdImageURL') ,productControllers.postAuctionProduct);
router.put("/update-product/:productId", upload.array('prdImageURL') ,productControllers.updateAuctionProduct);
router.delete("/delete-product/:productId" ,productControllers.deleteAuctionProduct);


module.exports = router;