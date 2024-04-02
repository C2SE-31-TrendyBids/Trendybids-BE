const Conversation = require('../models/Conversation');
const ConverParticipant = require('../models/converParticipant');
const User = require('../models/user');
const {Sequelize} = require('sequelize');

User.belongsToMany(Conversation, { through: ConverParticipant, foreignKey: "userId" });
Conversation.belongsToMany(User, { through: ConverParticipant, foreignKey: "conversationId" });

class ConversationService {
    async getConversations({page, limit}, userId, res) {
        try {
            page = parseInt(page) || 1
            limit = parseInt(limit) || 10
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
                    }
                ]
            });

            return res.json({
                message: "Success",
                conversations: this.optimizeDataConversation(conversations, userId),
                totalItem: conversations.length
            });
        } catch (error) {
            throw new Error(error);
        }
    }

    async createConversation(recipientId, userId, res) {
       try {
           const recipient = await User.findOne({
               where: {
                   id: recipientId
               }
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
           await ConverParticipant.bulkCreate([
               {userId, conversationId: newConversation.id},
               {userId: recipientId, conversationId: newConversation.id}
           ])

           return res.json({
               message: "Create conversation successfully",
               conversation: newConversation
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
                createdAt: conversation.createdAt,
                recipient: user[0]
            }
        })
    }
}

module.exports = new ConversationService();