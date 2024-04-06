const conversationServices = require('../services/conversationService')
const {validateVerify, validateCreateConversation} = require("../helpers/joiSchema");
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
            const { error } = validateCreateConversation(req.body);
            if (error)
                return res.status(400).json({
                    message: error.details[0].message,
                });
            return conversationServices.createConversation(req.body, req.user.id, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new ConversationController();