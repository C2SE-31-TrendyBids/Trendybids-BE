const userControllers = require("../controllers/userControllers");
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verify_token");


router.use(verifyToken.verifyToken);
router.get("/get-current-user", userControllers.getCurrentUser)
module.exports = router;