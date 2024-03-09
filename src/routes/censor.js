const express = require("express");
const router = express.Router();
const censorControllers = require("../controllers/censorController");

router.get("/get-all", censorControllers.getCensorByQuery);


module.exports = router;