const express = require("express");
const router = express.Router();
const MessageController = require('../controllers/messageController')
const {verifyToken} = require('../middlewares/verifyToken')
const multer = require("multer");

const upload = multer({storage: multer.memoryStorage()})

router.use(verifyToken)
router.post("/create", upload.array('images'), MessageController.createMessage);
router.get("/messages/:conversationId", MessageController.getMessagesInConversation);

module.exports = router;