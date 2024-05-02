const notificationServices = require("../services/notificationService");

class NotificationController {
    getNotifications(req, res) {
        try {
            return notificationServices.getNotificationByRecipientId(req?.user?.id, req.query, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }

    seenNotification(req, res) {
        try {
            const notificationId = req.body.notificationId
            console.log(notificationId)
            if (!notificationId) {
                return res.status(400).json({
                    message: '\"notificationId\" is required',
                });
            }
            return notificationServices.seenNotification(req?.user?.id, notificationId, res)
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new NotificationController()