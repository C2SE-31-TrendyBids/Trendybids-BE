const express = require("express");
const router = express.Router();
const ConversationController = require('../controllers/conversationController')
const {verifyToken} = require('../middlewares/verifyToken')
const multer = require("multer");

const upload = multer({storage: multer.memoryStorage()})

router.use(verifyToken)
router.post("/create", upload.array('filesAttach'), ConversationController.createConversation);
router.get("/conversations", ConversationController.getConversations);

module.exports = router;