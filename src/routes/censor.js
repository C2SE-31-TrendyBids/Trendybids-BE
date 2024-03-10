const express = require("express");
const router = express.Router();
const CensorController = require('../controllers/censorController')
const multer = require("multer");


const upload = multer({ storage: multer.memoryStorage() });


router.post("/register-censor", upload.single('avatar'), CensorController.registerCensor);

module.exports = router;
