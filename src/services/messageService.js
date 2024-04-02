const ConverParticipant = require('../models/converParticipant');
const {uploadMultipleFile, uploadFile} = require("../config/firebase.config");
const User = require("../models/user");
const Message = require("../models/message");
const {Op} = require("sequelize");

Message.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' })

class MessageService {
    async createMessage({ conversationId, content }, files, userId, res) {
        try {
            let imgUrls = [];
            const conversation = await ConverParticipant.findOne({
                where: { conversationId, userId }
            })

            if (!conversation) {
                return res.status(404).json({
                    message: "The user is not participating in this conversation"
                })
            }

            if (files && files.length > 0) {
                const uploadImages = await uploadMultipleFile(files, 'message')
                imgUrls = uploadImages.map(item => item.url);
            }

            const newMessage = await Message.create({
                conversationId,
                content,
                userId,
                imgUrls
            })

            // Get inserted message data
            const messageData = await Message.findOne({
                where: { id: newMessage.id },
                attributes: {
                    exclude: ['userId']
                },
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatarUrl']
                }
            })

            return res.status(200).json({
                message: "Message created successfully",
                data: messageData
            })

        } catch (error) {
            throw new Error(error);
        }
    }

    async getMessagesInConversation({ page, limit, keyword }, conversationId, userId, res) {
        try {
            page = parseInt(page) || 1
            limit = parseInt(limit) || 10
            const offset = (page - 1) * limit

            const messages = await Message.findAll({
                where: {
                    conversationId,
                    ...(keyword ? { content: { [Op.iLike]: `%${keyword}%` } } : {})
                },
                // limit,
                // offset,
                order: [['createdAt', 'DESC']],
                attributes: {exclude: ['userId']},
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatarUrl']
                }
            })

            return res.status(200).json({
                message: "Success",
                data: messages
            })
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = new MessageService();