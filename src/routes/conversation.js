const express = require("express");
const router = express.Router();
const ConversationController = require('../controllers/conversationController')
const {verifyToken} = require('../middlewares/verifyToken')

router.use(verifyToken)
router.post("/create", ConversationController.createConversation);
router.get("/conversations", ConversationController.getConversations);

module.exports = router;