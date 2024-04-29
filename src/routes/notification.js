const express = require('express')
const { verifyToken, isAdmin } = require("../middlewares/verifyToken");
const notificationController = require('../controllers/notificationController')

const router = express.Router()

router.use(verifyToken)
router.get('/notifications', notificationController.getNotifications)
router.post('/seen-notification', notificationController.seenNotification)

module.exports = router