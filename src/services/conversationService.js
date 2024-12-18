const Conversation = require('../models/conversation');
const Message = require('../models/message')
const ConverParticipant = require('../models/converParticipant');
const User = require('../models/user');
const messageService = require('./messageService');
const eventEmitter = require("../config/eventEmitter");
const { Op } = require("sequelize");
const sequelize = require('../config/database');

class ConversationService {
    async getConversations({ page, limit }, userId, res) {
        try {
            page = parseInt(page) || null
            limit = parseInt(limit) || null
            const offset = (page - 1) * limit

            const participants = await ConverParticipant.findAll({
                where: {
                    userId
                }
            })
            const existConversation = participants.map((item) => item.conversationId)

            const conversations = await Conversation.findAll({
                where: {
                    id: existConversation
                },
                limit,
                offset,
                include: [
                    {
                        model: User,
                        as: 'users',
                        through: {
                            model: ConverParticipant,
                            attributes: [],
                        },
                        attributes: ['id', 'fullName', 'avatarUrl'],
                    },
                    {
                        model: Message,
                        as: 'messages',
                        attributes: ['id', 'content', 'filesAttach', 'isSeen', 'createdAt'],
                        where: {
                            createdAt: {
                                [Op.eq]: sequelize.literal(`(SELECT MAX("created_at") FROM "message" WHERE "conversation_id" = "conversation"."id")`)
                            }
                        },
                        include: { model: User, as: 'user', attributes: ['id', 'fullName', 'avatarUrl'] }
                    }
                ],
                order: [[{ model: Message, as: 'messages' }, 'createdAt', 'DESC']]
            });

            return res.json({
                message: "Success",
                conversations: conversations.length > 0 ? this.optimizeDataConversation(conversations, userId) : [],
                totalItem: conversations.length,
            });
        } catch (error) {
            throw new Error(error);
        }
    }

    async createConversation({ recipientId, content }, files, userId, res) {
        try {
            const recipient = await User.findOne({
                where: {
                    id: recipientId
                },
                attributes: ['id', 'fullName', 'avatarUrl']
            })

            if (!recipient) {
                return res.status(404).json({
                    message: "Recipient not found"
                })
            }

            const existConversation = await this.isCreated(userId, recipientId);
            if (existConversation) {
                return res.status(404).json({
                    message: "Conversation already exists"
                })
            }

            const newConversation = await Conversation.create();
            const [participants, messageData] = await Promise.all([
                ConverParticipant.bulkCreate([
                    { userId, conversationId: newConversation.id },
                    { userId: recipientId, conversationId: newConversation.id }
                ]),
                messageService.saveMessage(files, newConversation.id, content, userId)
            ])

            const responseData = {
                id: newConversation.id,
                recipient: messageData.user,
                latestMessage: messageData
            }

            // Emit event to send message to client
            eventEmitter.emit('conversation.create', {data: JSON.stringify(responseData), recipientId});

            return res.json({
                message: "Create conversation successfully",
                responseData,
            })
        } catch (error) {
            throw new Error(error);
        }
    }

    async isCreated(userId, recipientId) {
        const participants = await ConverParticipant.findAll({
            where: {
                userId
            },
            attributes: ['conversationId']
        })
        const conversationIds = participants.map((item) => item.conversationId)

        // Check if the recipient is in those conversations
        const recipientInConversation = await ConverParticipant.findOne({
            where: {
                userId: recipientId,
                conversationId: conversationIds
            }
        });
        return recipientInConversation !== null;
    }

    optimizeDataConversation(conversations, userId) {
        return conversations.map((conversation) => {
            const user = conversation.users.filter((user) => user.id !== userId)
            return {
                id: conversation.id,
                recipient: user[0],
                latestMessage: conversation.messages[0]
            }
        })
    }

    async getParticipants(conversationId) {
        try {
            const participants = await ConverParticipant.findAll({
                where: { conversationId },
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['id']
                }
            })
            // Extract user IDs from the participants
            return participants.map(participant => participant.user.id);
        } catch (error) {
            throw new Error(error);
        }
    }

    async getUnseenConversationsCount(userId, res) {
        try {
            const participants = await ConverParticipant.findAll({
                where: {
                    userId
                }
            })
            const existConversation = participants.map((item) => item.conversationId)

            const conversations = await Conversation.findAll({
                where: {
                    id: existConversation
                },
                include: {
                    model: Message,
                    as: 'messages',
                    where: {
                        isSeen: false
                    },
                    required: false
                }
            });

            let count = 0;
            for (let conversation of conversations) {
                if (conversation.messages.length > 0 && conversation.messages[0].userId !== userId && !conversation.messages[0].isSeen) {
                    count++;
                }
            }

            return res.json({
                message: "success",
                unseenConv: count,
                conversations
            })
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = new ConversationService();