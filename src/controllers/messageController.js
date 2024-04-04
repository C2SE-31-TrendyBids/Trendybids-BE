const messageServices = require('../services/messageService')

class MessageController {
    createMessage(req, res) {
        try {
            return messageServices.createMessage(req.body, req.files, req.user.id, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    async getMessagesInConversation(req, res) {
        const conversationId = req.params.conversationId;
        if (conversationId === ":conversationId") {
            return res.status(400).json({
                message: '\"conversationId\" is required',
            });
        }
        try {
            return messageServices.getMessagesInConversation(req.query, conversationId, req.user.id, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new MessageController();