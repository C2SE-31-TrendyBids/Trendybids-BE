const express = require('express')
const { verifyToken, isAdmin } = require("../middlewares/verifyToken");
const adminController = require('../controllers/adminController')
const multer = require("multer");

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/get-rules', adminController.getRules)
router.use(verifyToken)
router.use(isAdmin)
router.post('/toggle-status-censor', adminController.toggleStatusCensor)
router.get('/get-users', adminController.getUsers)
router.put('/edit-user', upload.single('avatar'), adminController.editUser)
router.delete('/delete-user', adminController.deleteUser)
router.get('/get-roles', adminController.getAllRolesController)
router.get('/get-summary', adminController.getSummary)
router.get('/get-summary-product-auction', adminController.getLineChartProductAuction)
router.get('/get-profit', adminController.getProfit)
router.get('/get-transaction-history', adminController.getTransactionHistory)
router.post('/create-rule', adminController.createRule)
router.put('/update-rule', adminController.updateRule)
router.delete('/delete-rule', adminController.deleteRule)


module.exports = router