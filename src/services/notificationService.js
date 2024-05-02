const Notification = require('../models/notification')
const {Op} = require("sequelize");

class NotificationService {
    async createNotification(body) {
        try {
            const newNotification = await Notification.create({
                type: body.type,
                title: body.title,
                content: body.content,
                recipientId: body.recipientId,
                linkAttach: body.linkAttach,
                thumbnail: body.thumbnail,
            })
            return {
                message: "success",
                data: newNotification,
            }
        } catch (error) {
            console.log(error)
        }
    }

    async getNotificationByRecipientId(recipientId, { page, limit, isSeen }, res) {
        try {
            page = parseInt(page) || null
            limit = parseInt(limit) || null
            const offset = (page - 1) * limit

            const notificationQuery = {
                recipientId: recipientId,
                ...(isSeen ? { isSeen } : {}),
            }

            const notifications = await Notification.findAll({
                where: notificationQuery,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
            })
            return res.json({
                message: "success",
                data: notifications,
            })
        } catch (error) {
            console.log(error)
        }
    }

    async seenNotification(userId, notificationId, res) {
        try {
            const notification = await Notification.findOne(
                { where: { id: notificationId, recipientId: userId }}
            )

            if (!notification) {
                return res.status(404).json({
                    message: "Notification not found",
                })
            }
            await notification.update({ isSeen: true })

            return res.json({
                message: "Update status successfully",
            })
        } catch (error) {
            console.log(error)
        }
    }

    async getCountUnseen(userId, res) {
        try {
            const countUnseen = await Notification.count({
                where: {
                    recipientId: userId,
                    isSeen: false,
                }
            })

            return res.json({
                message: "Count unseen successfully",
                count: countUnseen
            })
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = new NotificationService()