const express = require('express')
const { verifyToken, isAdmin } = require("../middlewares/verifyToken");
const adminController = require('../controllers/adminController')
const multer = require("multer");

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.use(verifyToken)
router.use(isAdmin)
router.post('/toggle-status-censor', adminController.toggleStatusCensor)
router.get('/get-users', adminController.getUsers)
router.put('/edit-user', upload.single('avatar'), adminController.editUser)
router.delete('/delete-user', adminController.deleteUser)
router.get('/get-roles', adminController.getAllRolesController)

module.exports = router