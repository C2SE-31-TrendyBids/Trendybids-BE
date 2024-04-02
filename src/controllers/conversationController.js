const conversationServices = require('../services/conversationService')
class ConversationController {
    getConversations(req, res) {
        try {
            return conversationServices.getConversations(req.query, req.user.id, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    createConversation(req, res) {
        try {
            const recipientId = req.body.recipientId;
            if (!recipientId) {
                return res.status(400).json({
                    message: "Id of recipient is required"
                })
            }
            return conversationServices.createConversation(recipientId, req.user.id, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new ConversationController();