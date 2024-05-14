const express = require("express");
const router = express.Router();

const multer = require("multer");
const censorControllers = require("../controllers/censorController");
const { verifyToken, isAdmin, isCensor } = require("../middlewares/verifyToken");


const upload = multer({ storage: multer.memoryStorage() });
router.get("/get-auction-session", censorControllers.getAuctionByQuery);
router.get("/get-censor", censorControllers.getCensorByQuery);

router.use(verifyToken)
router.post("/register-censor", upload.single('avatar'), censorControllers.registerCensor);
router.use(isCensor)
router.post('/approve-auction-product', censorControllers.approveAuctionProduct)
router.get("/my-auction-session", censorControllers.getAuctionByToken);
router.get('/me', censorControllers.getCurrentCensor)
router.post('/approve-auction-product', censorControllers.approveAuctionProduct)
router.post('/reject-auction-product', censorControllers.rejectAuctionProduct)

router.post('/post-auction-session', censorControllers.postAuctionSession)
router.put('/update-auction-session/:sessionId', censorControllers.updateAuctionSession)
router.delete('/delete-auction-session/:sessionId', censorControllers.deleteAuctionSession)

router.get('/get-user-participating', censorControllers.getUserParticipating)
module.exports = router
