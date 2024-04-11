const ConverParticipant = require('../models/converParticipant');
const {uploadMultipleFile} = require("../config/firebase.config");
const User = require("../models/user");
const Message = require("../models/message");
const {Op} = require("sequelize");
const eventEmitter = require("../config/eventEmitter");

class MessageService {
    async createMessage({ conversationId, content }, files, userId, res) {
        try {
            const conversation = await ConverParticipant.findOne({
                where: { conversationId, userId }
            })

            if (!conversation) {
                return res.status(404).json({
                    message: "The user is not participating in this conversation"
                })
            }

            const messageData = await this.saveMessage(files, conversationId, content, userId);

            eventEmitter.emit('message.create', JSON.stringify(messageData));

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
                limit,
                offset,
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

    async saveMessage(files, conversationId, content, userId) {
        let filesAttach = [];
        if (files && files.length > 0) {
            const uploadFileAttach = await uploadMultipleFile(files, 'message')
            filesAttach = uploadFileAttach.map(item => {
                return {
                    id: item.id.split('.')[0],
                    name: item.name,
                    url: item.url,
                    type: item.type
                }
            });
        }

        const newMessage = await Message.create({
            conversationId,
            content,
            userId,
            filesAttach
        })

        // Get inserted message data
        return Message.findOne({
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
    }
}

module.exports = new MessageService();