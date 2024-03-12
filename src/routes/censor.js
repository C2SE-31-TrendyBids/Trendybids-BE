const express = require("express");
const router = express.Router();

const multer = require("multer");
const censorControllers = require("../controllers/censorController");
const { verifyToken, isAdmin, isCensor } = require("../middlewares/verifyToken");


const upload = multer({ storage: multer.memoryStorage() });
router.post("/register-censor", upload.single('avatar'), censorControllers.registerCensor);
router.get("/get-auction-session", censorControllers.getAuctionByQuery);
router.get("/get-censor", censorControllers.getCensorByQuery);
router.use(verifyToken)
router.use(isCensor)
router.post('/approve-auction-product', censorControllers.approveAuctionProduct)

module.exports = router
