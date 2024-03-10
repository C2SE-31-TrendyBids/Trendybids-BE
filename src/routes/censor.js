const express = require("express");
const router = express.Router();

const multer = require("multer");
const censorControllers = require("../controllers/censorController");
const { verifyToken, isAdmin, isCensor } = require("../middlewares/verifyToken");
const censorController = require('../controllers/censorController')

const upload = multer({ storage: multer.memoryStorage() });
router.post("/register-censor", upload.single('avatar'), censorController.registerCensor);
router.get("/get-all", censorControllers.getCensorByQuery);
router.use(verifyToken)
router.use(isCensor)
router.post('/approve-auction-product', censorController.approveAuctionProduct)

module.exports = router
