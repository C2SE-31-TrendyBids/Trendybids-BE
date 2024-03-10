const express = require('express')
const {verifyToken, isAdmin} = require("../middlewares/verifyToken");
const adminController = require('../controllers/adminController')

const router = express.Router()

router.use(verifyToken)
router.use(isAdmin)
router.post('/approve-censor', adminController.approveCensor)

module.exports = router